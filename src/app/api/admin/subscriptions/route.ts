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

// GET /api/admin/subscriptions - List subscriptions and payment overview
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const plan = searchParams.get('plan') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (plan && plan !== 'ALL') {
      where.plan = plan;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [total, subscriptions, payments] = await Promise.all([
      db.subscription.count({ where }),
      db.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      }),
      db.paymentHistory.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Financial KPI aggregation
    const mrr = await db.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true },
    }).then(subs => subs.reduce((acc, s) => {
      if (s.plan === 'BASIC') return acc + 7;
      if (s.plan === 'PRO') return acc + 19;
      return acc;
    }, 0));

    return NextResponse.json({
      subscriptions,
      recentPayments: payments,
      metrics: {
        mrr,
        activeSubscriptions: subscriptions.filter(s => s.status === 'ACTIVE').length,
        totalTracked: total,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des abonnements' },
      { status: 500 }
    );
  }
}
