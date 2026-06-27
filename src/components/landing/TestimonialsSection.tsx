import Link from 'next/link';

const PLACEHOLDER_CARDS = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              What Our Customers Say
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real reviews from real customers — coming as our community grows.
          </p>
        </div>

        {/* Placeholder Review Cards — 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLACEHOLDER_CARDS.map(({ id }) => (
            <div
              key={id}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-orange-100"
            >
              {/* 5-star row */}
              <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-xl text-yellow-400">★</span>
                ))}
              </div>

              {/* Neutral placeholder review text */}
              <p className="text-gray-500 mb-6 leading-relaxed italic">
                &ldquo;Customer review placeholder — genuine reviews will appear here once collected.&rdquo;
              </p>

              {/* Generic author block */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-xl select-none">
                  👤
                </div>
                <div>
                  <div className="font-bold text-gray-900">Customer Name</div>
                  <div className="text-sm text-gray-500">Service Category</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-700 mb-6">
            Ready to experience quality beauty services?
          </p>
          <Link
            href="/auth/signup/customer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-lg font-semibold text-white bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 transition-all duration-300 hover:scale-105"
          >
            Book Your First Service
          </Link>
        </div>
      </div>
    </section>
  );
}
