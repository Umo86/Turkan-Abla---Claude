import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import Stripe from 'stripe';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const bookingSchema = z.object({
  vendorId: z.string(),
  serviceId: z.string(),
  scheduled_time: z.string(),
  price: z.number(),
  payment_intent_id: z.string(),
});

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

async function getFirebaseServices() {
  const { adminDb } = await import('@/lib/firebase/admin');
  return { adminDb };
}

export async function POST(request: Request) {
  try {
    const { auth: getAuth } = await NextAuth(authOptions);
    const session = await getAuth();
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { vendorId, serviceId, scheduled_time, price, payment_intent_id } = parsed.data;

    // Verify payment succeeded
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    // Get service and vendor details
    const { adminDb } = await getFirebaseServices();
    const serviceSnap = await adminDb
      .collection('vendors')
      .doc(vendorId)
      .collection('services')
      .doc(serviceId)
      .get();

    if (!serviceSnap.exists) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const service = serviceSnap.data();
    const platformCommission = price * 0.1; // 10% default
    const vendorNet = price - platformCommission;

    // Create booking
    const bookingRef = adminDb
      .collection('vendors')
      .doc(vendorId)
      .collection('bookings')
      .doc();

    const bookingData = {
      id: bookingRef.id,
      customerId: session.user.id,
      vendorId,
      serviceId,
      scheduled_time: new Date(scheduled_time),
      duration_minutes: service?.duration_minutes,
      customer_name: session.user.name,
      price,
      platform_commission: platformCommission,
      vendor_net: vendorNet,
      status: 'confirmed',
      payment_intent_id,
      payment_status: 'succeeded',
      refund_status: 'none',
      createdAt: new Date(),
    };

    await bookingRef.set(bookingData);

    // Also create in global bookings index for quick lookup
    await adminDb.collection('bookings').doc(bookingRef.id).set(bookingData);

    return NextResponse.json({ bookingId: bookingRef.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
