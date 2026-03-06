import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Flutterwave webhook handler (for Africa payments)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature
    const signature = request.headers.get('verif-hash');
    const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    if (!signature || signature !== expectedHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = body;

    switch (event) {
      case 'charge.completed': {
        const { tx_ref, customer, meta, status } = data;

        if (status !== 'successful') {
          return NextResponse.json({ received: true });
        }

        const userId = meta?.userId;
        const plan = meta?.plan || 'BASIC';

        if (userId) {
          // Find or create subscription
          const existingSub = await db.subscription.findUnique({
            where: { userId },
          });

          if (existingSub) {
            await db.subscription.update({
              where: { userId },
              data: {
                plan,
                status: 'ACTIVE',
                flutterwaveCustomerId: customer.id,
                flutterwaveTxId: tx_ref,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          } else {
            await db.subscription.create({
              data: {
                userId,
                plan,
                status: 'ACTIVE',
                flutterwaveCustomerId: customer.id,
                flutterwaveTxId: tx_ref,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          }

          // Audit log
          await db.auditLog.create({
            data: {
              userId,
              action: 'SUBSCRIPTION_CREATED',
              entityType: 'Subscription',
              entityId: userId,
              metadata: JSON.stringify({ plan, provider: 'flutterwave' }),
            },
          });
        }
        break;
      }

      case 'subscription.cancelled': {
        const { customer } = data;
        
        const sub = await db.subscription.findFirst({
          where: { flutterwaveCustomerId: customer.id },
        });

        if (sub) {
          await db.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELED', plan: 'FREE' },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET - Test webhook
export async function GET() {
  return NextResponse.json({
    status: 'Flutterwave webhook ready',
    timestamp: new Date().toISOString()
  });
}
