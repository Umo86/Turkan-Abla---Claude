import Stripe from 'stripe';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { z } from 'zod';
import { NextResponse } from 'next/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

async function getFirebaseServices() {
  const { adminDb } = await import('@/lib/firebase/admin');
  return { adminDb };
}

const checkoutSchema = z.object({
  vendorId: z.string(),
  serviceId: z.string(),
  scheduled_time: z.string(),
  price: z.number(),
});

export async function POST(request: Request) {
  try {
    const { auth: getAuth } = await NextAuth(authOptions);
    const session = await getAuth();
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { vendorId, serviceId, price } = parsed.data;

    // Fetch vendor document to get Stripe Connect account
    const { adminDb } = await getFirebaseServices();
    const vendorSnap = await adminDb.collection('vendors').doc(vendorId).get();

    if (!vendorSnap.exists) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const vendor = vendorSnap.data();
    const stripeConnectAccountId = vendor?.stripe_account_id;

    if (!stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Vendor has no Stripe Connect account set up' },
        { status: 400 }
      );
    }

    // Calculate platform commission: 10% deducted by Stripe
    const priceInPence = Math.round(price * 100);
    const applicationFeeAmount = Math.round(priceInPence * 0.1);

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Service Booking`,
              metadata: { vendorId, serviceId },
            },
            unit_amount: priceInPence,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: stripeConnectAccountId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/home`,
      metadata: {
        vendorId,
        serviceId,
        customerId: session.user.id,
        scheduled_time: parsed.data.scheduled_time,
      },
    });

    return NextResponse.json({ sessionUrl: checkoutSession.url });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
