import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-amber-900 via-orange-700 to-rose-700 bg-clip-text text-transparent">
            Transform Your Look
          </span>
          <br />
          <span className="text-gray-800">with Expert Services</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover professional beauty, wellness, and personal care services from trusted vendors across the UK. Book instantly, pay securely.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary CTA */}
          <Link
            href="/home"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-lg font-semibold text-white bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 transition-all"
          >
            Browse Services
          </Link>
          {/* Secondary CTA */}
          <Link
            href="#services"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-lg font-semibold border-2 border-amber-700 text-amber-700 hover:bg-amber-50 transition-all"
          >
            Learn More
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 pt-16 border-t border-gray-200">
          <div>
            <div className="text-3xl font-bold text-amber-700">500+</div>
            <p className="text-gray-600">Professional Vendors</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-700">10K+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-700">50K+</div>
            <p className="text-gray-600">Bookings Completed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
