import Stripe from 'stripe';
import { NextResponse } from 'next/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

async function getFirebaseServices() {
  const { adminDb } = await import('@/lib/firebase/admin');
  return { adminDb };
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Create booking document with payment confirmed
    const { vendorId, serviceId, customerId, scheduled_time } = session.metadata || {};

    if (vendorId && serviceId && customerId) {
      const { adminDb } = await getFirebaseServices();

      const bookingRef = adminDb
        .collection('vendors')
        .doc(vendorId)
        .collection('bookings')
        .doc();

      const price = (session.amount_total || 0) / 100;
      const platformCommission = price * 0.1;

      await bookingRef.set({
        id: bookingRef.id,
        customerId,
        vendorId,
        serviceId,
        scheduled_time: new Date(scheduled_time),
        price,
        platform_commission: platformCommission,
        vendor_net: price - platformCommission,
        status: 'confirmed',
        payment_intent_id: session.payment_intent,
        payment_status: 'succeeded',
        refund_status: 'none',
        createdAt: new Date(),
      });

      // Also add to global bookings index
      await adminDb.collection('bookings').doc(bookingRef.id).set({
        id: bookingRef.id,
        customerId,
        vendorId,
        serviceId,
        status: 'confirmed',
      });
    }
  }

  return NextResponse.json({ received: true });
}
