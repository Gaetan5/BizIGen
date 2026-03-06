import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Stripe webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const eventType = payload.type;

    // Handle different event types
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = payload.data.object;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const plan = metadata.plan || 'BASIC';

        if (userId) {
          // Update or create subscription
          await db.subscription.upsert({
            where: { userId },
            update: {
              plan,
              status: 'ACTIVE',
              stripeCustomerId: session.customer,
              stripeSubId: session.subscription,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            create: {
              userId,
              plan,
              status: 'ACTIVE',
              stripeCustomerId: session.customer,
              stripeSubId: session.subscription,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });

          // Create audit log
          await db.auditLog.create({
            data: {
              userId,
              action: 'SUBSCRIPTION_CREATED',
              entityType: 'Subscription',
              entityId: userId,
              metadata: JSON.stringify({ plan, provider: 'stripe' }),
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = payload.data.object;
        const customerId = subscription.customer;

        const userSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (userSub) {
          await db.subscription.update({
            where: { id: userSub.id },
            data: {
              status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
              plan: subscription.items?.data?.[0]?.price?.metadata?.plan || userSub.plan,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = payload.data.object;
        const customerId = subscription.customer;

        const userSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (userSub) {
          await db.subscription.update({
            where: { id: userSub.id },
            data: {
              status: 'CANCELED',
              plan: 'FREE',
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
