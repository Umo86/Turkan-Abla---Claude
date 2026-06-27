import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Türkan Abla
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-gray-700 hover:text-amber-700 transition">
              Services
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-amber-700 transition">
              About
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-amber-700 transition">
              Pricing
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-amber-700 transition">
              Contact
            </Link>
          </div>

          {/* CTA Link styled as button */}
          <Link
            href="/auth/signup/customer"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 transition-all"
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
