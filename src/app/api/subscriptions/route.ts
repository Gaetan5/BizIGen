import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// GET /api/subscriptions - Get user subscription
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // Get current month usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const projectsUsed = await db.project.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfMonth },
      },
    });

    const exportsUsed = await db.export.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfMonth },
      },
    });

    return NextResponse.json({
      subscription: subscription || {
        plan: 'FREE',
        status: 'INACTIVE',
        projectsUsed,
        exportsUsed,
      },
      usage: {
        projectsUsed,
        exportsUsed,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, provider = 'stripe' } = body;

    const validPlans = ['BASIC', 'PRO'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    // Plan prices (in cents)
    const prices = {
      BASIC: { amount: 700, currency: 'eur' },
      PRO: { amount: 1900, currency: 'eur' },
    };

    const price = prices[plan as keyof typeof prices];

    // Generate checkout URL based on provider
    const checkoutUrl = provider === 'flutterwave'
      ? `${process.env.NEXTAUTH_URL}/api/subscriptions/flutterwave/checkout?plan=${plan}&userId=${session.user.id}`
      : `${process.env.NEXTAUTH_URL}/api/subscriptions/stripe/checkout?plan=${plan}&userId=${session.user.id}`;

    return NextResponse.json({
      checkoutUrl,
      sessionId: `cs_${Date.now()}_${plan}`,
      plan,
      amount: price.amount,
      currency: price.currency,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions - Cancel subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Abonnement non trouvé' }, { status: 404 });
    }

    const updated = await db.subscription.update({
      where: { userId: session.user.id },
      data: { status: 'CANCELED' },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    );
  }
}
