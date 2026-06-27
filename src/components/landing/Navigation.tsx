import Link from 'next/link';

export function Navigation() {
  return (
    <header className="absolute top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center justify-between rounded-full bg-[#2A211B]/80 backdrop-blur-md px-5 py-3 text-[#F4ECE1] shadow-lg shadow-black/10">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 pl-2">
            <span className="text-lg font-semibold tracking-wide font-serif">
              Türkan&nbsp;Abla
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="#services"
              className="px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              About
            </Link>
            <Link
              href="#pricing"
              className="px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* CTA */}
          <Link
            href="/auth/signup/customer"
            className="inline-flex items-center justify-center h-10 px-6 rounded-full text-sm font-medium bg-[#F4ECE1] text-[#2A211B] hover:bg-white transition-colors"
          >
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
