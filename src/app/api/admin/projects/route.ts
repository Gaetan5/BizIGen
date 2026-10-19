import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'ADMIN') return null;
  return session.user;
}

// GET /api/admin/projects - List projects across all users
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sector = searchParams.get('sector') || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (sector && sector !== 'ALL') {
      where.sector = sector;
    }

    const [total, projects] = await Promise.all([
      db.project.count({ where }),
      db.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              subscription: {
                select: { plan: true },
              },
            },
          },
          generatedDoc: {
            select: {
              id: true,
              canvases: {
                select: { id: true, canvasType: true },
              },
            },
          },
          _count: {
            select: { formInputs: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        sector: p.sector,
        country: p.country,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        user: {
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          plan: p.user.subscription?.plan || 'FREE',
        },
        hasDocument: Boolean(p.generatedDoc),
        canvasesCount: p.generatedDoc?.canvases?.length || 0,
        formInputsCount: p._count.formInputs,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin projects error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/projects?id=... - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json({ error: 'ID de projet manquant' }, { status: 400 });
    }

    await db.project.delete({
      where: { id: projectId },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: 'PROJECT_DELETED_BY_ADMIN',
        entityType: 'Project',
        entityId: projectId,
        metadata: JSON.stringify({ deletedBy: admin.id }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    );
  }
}
