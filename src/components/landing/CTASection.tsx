import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-500">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Look?
        </h2>
        <p className="text-lg text-amber-50 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of satisfied customers and book your first service today. Secure payment, instant confirmation, and professional services.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup/customer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-lg font-semibold bg-white text-amber-700 hover:bg-amber-50 transition-colors"
          >
            Book Now
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
