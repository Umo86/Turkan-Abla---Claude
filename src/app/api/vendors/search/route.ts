import { adminDb } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');

    let query = adminDb.collection('vendors');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(20).get();
    const vendors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Simple text search filter (use Algolia or Typesense in production)
    const filtered = q
      ? vendors.filter(
          (v) =>
            v.businessName.toLowerCase().includes(q.toLowerCase()) ||
            v.bio.toLowerCase().includes(q.toLowerCase())
        )
      : vendors;

    return NextResponse.json({ vendors: filtered });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
