import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Türkan Abla
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional beauty and wellness services at your fingertips. Connecting trusted vendors with customers across the UK.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#services" className="hover:text-amber-400 transition-colors">
                  All Services
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-amber-400 transition-colors">
                  Hair Salon
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-amber-400 transition-colors">
                  Spa &amp; Massage
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-amber-400 transition-colors">
                  Fitness
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#about" className="hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-amber-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2026 Türkan Abla.
          </p>
        </div>
      </div>
    </footer>
  );
}
