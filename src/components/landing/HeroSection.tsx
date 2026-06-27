import Link from 'next/link';
import { img, IMAGES } from './images';

const PILLS = ['Skin Care', 'Facial', 'Massage', 'Manicure', 'Pedicure'];

export function HeroSection() {
  return (
    <section className="bg-[#F4ECE1] px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero image card */}
        <div className="relative overflow-hidden rounded-[2rem] min-h-[82vh] flex">
          {/* Background image */}
          <img
            src={img(IMAGES.hero, 1600)}
            alt="Luxury beauty and wellness treatment"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A211B]/85 via-[#2A211B]/45 to-transparent" />

          {/* Content */}
          <div className="relative z-10 w-full flex flex-col justify-between p-8 sm:p-12 lg:p-16">
            {/* Headline */}
            <div className="max-w-2xl mt-16 sm:mt-20">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#F4ECE1]">
                Transform Your Look with{' '}
                <span className="italic text-[#E4C9AF]">Expert Services</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[#F4ECE1]/80 max-w-lg leading-relaxed">
                Discover professional beauty, wellness, and personal care from
                trusted vendors across the UK. Book instantly, pay securely.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full text-base font-medium bg-[#F4ECE1] text-[#2A211B] hover:bg-white transition-colors"
                >
                  Browse Services
                </Link>
                <Link
                  href="#services"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full text-base font-medium border border-[#F4ECE1]/50 text-[#F4ECE1] hover:bg-white/10 transition-colors"
                >
                  Explore More
                </Link>
              </div>
            </div>

            {/* Service pills */}
            <div className="flex flex-wrap gap-2.5 mt-10">
              {PILLS.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm text-[#F4ECE1]"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Floating service cards (desktop) */}
          <div className="hidden lg:flex flex-col gap-4 absolute right-12 top-1/2 -translate-y-1/2 z-10 w-64">
            <FloatingCard
              image={img(IMAGES.heroCardA, 320)}
              title="Facial Care"
              subtitle="Radiant, glowing skin"
            />
            <FloatingCard
              image={img(IMAGES.heroCardB, 320)}
              title="Skin Therapy"
              subtitle="Tailored treatments"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
          <Stat value="500+" label="Professional Vendors" />
          <Stat value="10K+" label="Happy Customers" />
          <Stat value="50K+" label="Bookings Completed" />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#F4ECE1]/95 backdrop-blur-sm shadow-xl">
      <img src={image} alt={title} className="h-28 w-full object-cover" />
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-semibold text-[#2A211B]">{title}</p>
          <p className="text-xs text-[#6F6055]">{subtitle}</p>
        </div>
        <Link
          href="#services"
          aria-label={`Explore ${title}`}
          className="flex-shrink-0 h-9 w-9 rounded-full bg-[#2A211B] text-[#F4ECE1] flex items-center justify-center hover:bg-[#A9755A] transition-colors"
        >
          ↗
        </Link>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-3xl sm:text-4xl text-[#2A211B]">
        {value}
      </div>
      <p className="mt-1 text-sm text-[#6F6055]">{label}</p>
    </div>
  );
}
