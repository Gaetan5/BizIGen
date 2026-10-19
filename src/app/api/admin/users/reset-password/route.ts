import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

// POST /api/admin/users/reset-password - Admin reset password for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, customPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Identifiant utilisateur requis' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Generate secure temporary password if none provided
    const newPassword = customPassword && customPassword.trim().length >= 8
      ? customPassword.trim()
      : `BizGen#${crypto.randomInt(100000, 999999)}!`;

    const passwordHash = await hash(newPassword, 12);

    // Update in Prisma "User" table
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    // Also sync to FastAPI "users" table if present
    try {
      await db.$executeRawUnsafe(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 OR email = $3',
        passwordHash,
        userId,
        user.email
      );
    } catch (sqlErr) {
      console.warn('FastAPI users table sync warning:', sqlErr);
    }

    // Log the event in AuditLog
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PASSWORD_RESET_BY_ADMIN',
        entityType: 'User',
        entityId: userId,
        metadata: JSON.stringify({
          targetEmail: user.email,
          resetByAdmin: session.user.email,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Mot de passe réinitialisé pour ${user.email}`,
      tempPassword: newPassword,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}
