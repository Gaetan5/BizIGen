import { NextRequest, NextResponse } from 'next/server';
import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { plan, phone, email } = await request.json();

    if (!plan || !phone || !email) {
      return NextResponse.json({ error: 'Plan, phone, and email required' }, { status: 400 });
    }

    const amounts = {
      basic: 5000, // XAF
      pro: 15000, // XAF
    };

    const payload = {
      tx_ref: `bizigen-${Date.now()}`,
      amount: amounts[plan as keyof typeof amounts],
      currency: 'XAF',
      payment_options: 'mobilemoney',
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      customer: {
        email,
        phone_number: phone,
        name: 'Biz-IGen User',
      },
      customizations: {
        title: 'Biz-IGen Abonnement',
        description: `Abonnement ${plan} - Business Plans IA`,
      },
    };

    const response = await flw.Charge.mobile_money(payload);

    return NextResponse.json({
      status: response.status,
      message: response.message,
      data: response.data,
    });
  } catch (error) {
    console.error('Error initiating Flutterwave payment:', error);
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}
