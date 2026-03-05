import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan required' }, { status: 400 });
    }

    const prices = {
      basic: 'price_basic', // Replace with actual Stripe price IDs
      pro: 'price_pro',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[plan as keyof typeof prices],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
      metadata: {
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
