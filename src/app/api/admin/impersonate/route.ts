import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// POST /api/admin/impersonate - Start remote access session for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only real ADMINs can impersonate
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID utilisateur cible requis' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur cible non trouvé' }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set('bizgen_impersonate_id', targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 * 2, // 2 hours max session
    });

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'IMPERSONATION_STARTED',
        entityType: 'User',
        entityId: targetUserId,
        metadata: JSON.stringify({
          adminEmail: session.user.email,
          targetEmail: targetUser.email,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Connexion à distance active pour ${targetUser.email}`,
      targetUser,
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Impersonate error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du démarrage de la session à distance' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/impersonate - Stop remote session and return to Admin
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const currentImpersonatedId = cookieStore.get('bizgen_impersonate_id')?.value;

    cookieStore.delete('bizgen_impersonate_id');

    if (session?.user?.id && currentImpersonatedId) {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'IMPERSONATION_ENDED',
          entityType: 'User',
          entityId: currentImpersonatedId,
          metadata: JSON.stringify({
            adminEmail: session.user.email,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Session à distance terminée. Retour au panneau Admin.',
      redirectUrl: '/admin/users',
    });
  } catch (error) {
    console.error('Stop impersonate error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'arrêt de la session à distance' },
      { status: 500 }
    );
  }
}
