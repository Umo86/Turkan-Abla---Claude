import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#221B16] text-[#F4ECE1] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl mb-4">Türkan Abla</h3>
            <p className="text-[#F4ECE1]/55 text-sm leading-relaxed">
              Professional beauty and wellness services at your fingertips.
              Connecting trusted vendors with customers across the UK.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium mb-4 text-[#F4ECE1]">Services</h4>
            <ul className="space-y-2.5 text-sm text-[#F4ECE1]/55">
              <li><Link href="#services" className="hover:text-[#E4C9AF] transition-colors">All Services</Link></li>
              <li><Link href="#services" className="hover:text-[#E4C9AF] transition-colors">Hair Salon</Link></li>
              <li><Link href="#services" className="hover:text-[#E4C9AF] transition-colors">Spa &amp; Massage</Link></li>
              <li><Link href="#services" className="hover:text-[#E4C9AF] transition-colors">Fitness</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium mb-4 text-[#F4ECE1]">Company</h4>
            <ul className="space-y-2.5 text-sm text-[#F4ECE1]/55">
              <li><Link href="#about" className="hover:text-[#E4C9AF] transition-colors">About Us</Link></li>
              <li><Link href="#pricing" className="hover:text-[#E4C9AF] transition-colors">Pricing</Link></li>
              <li><Link href="#contact" className="hover:text-[#E4C9AF] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium mb-4 text-[#F4ECE1]">Legal</h4>
            <ul className="space-y-2.5 text-sm text-[#F4ECE1]/55">
              <li><Link href="/" className="hover:text-[#E4C9AF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-[#E4C9AF] transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-[#E4C9AF] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#F4ECE1]/10 pt-8">
          <p className="text-center text-[#F4ECE1]/40 text-sm">
            &copy; 2026 Türkan Abla.
          </p>
        </div>
      </div>
    </footer>
  );
}
