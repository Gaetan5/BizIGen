import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const action = searchParams.get('action') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) {
      where.action = action;
    }

    const [total, logs] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const securityConfig = {
      httpsEnforced: true,
      secureCookies: process.env.NODE_ENV === 'production',
      hashingAlgorithm: 'bcrypt (salt rounds: 12)',
      sessionStrategy: 'JWT (30 jours, HttpOnly, SameSite=Lax)',
      corsProtected: true,
      roleBasedAccessControl: 'Activé (USER / CONSULTANT / ADMIN)',
      rateLimiting: 'Actif (FastAPI + NextAuth)',
    };

    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata,
        createdAt: l.createdAt,
        user: l.user ? {
          id: l.user.id,
          email: l.user.email,
          name: l.user.name,
          role: l.user.role,
        } : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      securityConfig,
    });
  } catch (error) {
    console.error('Security audit logs error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des journaux de sécurité' },
      { status: 500 }
    );
  }
}
