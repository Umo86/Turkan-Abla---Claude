import Link from 'next/link';
import { img, IMAGES } from './images';

export function CTASection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#F4ECE1]">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] min-h-[26rem] flex items-center justify-center text-center">
          {/* Image */}
          <img
            src={img(IMAGES.cta, 1600)}
            alt="Relaxing spa ambience"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2A211B]/70" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
            <h2 className="font-serif text-4xl sm:text-5xl text-[#F4ECE1] mb-5 leading-tight">
              Ready to Transform Your Look?
            </h2>
            <p className="text-[#F4ECE1]/80 mb-9 leading-relaxed">
              Join thousands of satisfied customers and book your first service
              today. Secure payment, instant confirmation, trusted professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup/customer"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full text-base font-medium bg-[#F4ECE1] text-[#2A211B] hover:bg-white transition-colors"
              >
                Book Now
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full text-base font-medium border border-[#F4ECE1]/50 text-[#F4ECE1] hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
