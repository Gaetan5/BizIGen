import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

// Admin middleware
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return null;
  }
  
  return session;
}

// GET /api/admin/users - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            select: { plan: true, status: true },
          },
          _count: {
            select: { projects: true },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
        locale: u.locale,
        createdAt: u.createdAt,
        subscription: u.subscription,
        projectCount: u._count.projects,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user role/status
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role, isBanned } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: userId,
        metadata: JSON.stringify({ role, isBanned }),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    // Create audit log before deletion
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: userId,
        metadata: JSON.stringify({ deletedAt: new Date().toISOString() }),
      },
    });

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (admin creation)
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, role = 'USER' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
      },
    });

    // Create free subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        status: 'INACTIVE',
        plan: 'FREE',
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        metadata: JSON.stringify({ email, role, createdBy: 'admin' }),
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
