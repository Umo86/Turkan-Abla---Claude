import Link from 'next/link';

const PLACEHOLDER_CARDS = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[#EBE0D1]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-[#A9755A] mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2A211B] leading-tight">
            Glowing Reviews
          </h2>
          <p className="mt-4 text-[#6F6055] max-w-2xl mx-auto">
            Real reviews from real customers — coming as our community grows.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLACEHOLDER_CARDS.map(({ id }) => (
            <div
              key={id}
              className="bg-[#F4ECE1] rounded-2xl p-8 border border-[#2A211B]/5"
            >
              <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-lg text-[#A9755A]">
                    ★
                  </span>
                ))}
              </div>

              <p className="text-[#6F6055] mb-6 leading-relaxed italic">
                &ldquo;Customer review placeholder — genuine reviews will appear
                here once collected.&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D8C3AC] rounded-full flex items-center justify-center text-xl select-none">
                  👤
                </div>
                <div>
                  <div className="font-semibold text-[#2A211B]">
                    Customer Name
                  </div>
                  <div className="text-sm text-[#6F6055]">Service Category</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/auth/signup/customer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full text-base font-medium bg-[#2A211B] text-[#F4ECE1] hover:bg-[#A9755A] transition-colors"
          >
            Book Your First Service
          </Link>
        </div>
      </div>
    </section>
  );
}
