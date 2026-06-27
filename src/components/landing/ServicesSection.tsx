import { ServiceCard } from './ServiceCard';
import { img, SERVICE_IMAGES } from './images';

const SERVICES = [
  { icon: '💅', title: 'Nail Salon', description: 'Manicure, pedicure & nail art', category: 'Nail Salon' },
  { icon: '✂️', title: 'Hair Salon', description: 'Cuts, colour & styling', category: 'Hair Salon' },
  { icon: '💄', title: 'Beauty', description: 'Makeup & treatments', category: 'Beauty' },
  { icon: '💆', title: 'Massage', description: 'Therapeutic & relaxing', category: 'Massage' },
  { icon: '🧖', title: 'Spa', description: 'Facials, wraps & sauna', category: 'Spa' },
  { icon: '💪', title: 'Personal Trainer', description: '1-on-1 & group sessions', category: 'Personal Trainer' },
  { icon: '🐕', title: 'Pet Grooming', description: 'Bathing & grooming', category: 'Pet Grooming' },
  { icon: '🎨', title: 'Tattoo', description: 'Custom artwork', category: 'Tattoo' },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F4ECE1]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#A9755A] mb-3">
              What We Offer
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#2A211B] leading-tight">
              Services We Provide
            </h2>
          </div>
          <p className="text-[#6F6055] max-w-md">
            Explore a curated range of professional beauty, wellness, and
            personal care services from trusted local vendors.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.category}
              {...service}
              image={img(SERVICE_IMAGES[service.category], 600)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
