import { ServiceCard } from './ServiceCard';

const SERVICES = [
  {
    icon: '💅',
    title: 'Nail Salon',
    description: 'Professional nail care and art',
    category: 'Nail Salon',
    features: ['Manicure', 'Pedicure', 'Nail Art'],
    color: 'bg-gradient-to-br from-pink-400 to-rose-500',
  },
  {
    icon: '✂️',
    title: 'Hair Salon',
    description: 'Expert hair styling and coloring',
    category: 'Hair Salon',
    features: ['Haircut', 'Coloring', 'Styling'],
    color: 'bg-gradient-to-br from-amber-400 to-orange-500',
  },
  {
    icon: '💄',
    title: 'Beauty',
    description: 'Makeup and beauty treatments',
    category: 'Beauty',
    features: ['Makeup', 'Threading', 'Waxing'],
    color: 'bg-gradient-to-br from-purple-400 to-pink-500',
  },
  {
    icon: '💆',
    title: 'Massage',
    description: 'Therapeutic massage services',
    category: 'Massage',
    features: ['Swedish', 'Deep Tissue', 'Hot Stone'],
    color: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  },
  {
    icon: '🧖',
    title: 'Spa',
    description: 'Relaxing spa treatments',
    category: 'Spa',
    features: ['Facials', 'Body Wraps', 'Sauna'],
    color: 'bg-gradient-to-br from-green-400 to-emerald-500',
  },
  {
    icon: '💪',
    title: 'Personal Trainer',
    description: 'Professional fitness training',
    category: 'Personal Trainer',
    features: ['1-on-1 Sessions', 'Group Classes', 'Coaching'],
    color: 'bg-gradient-to-br from-red-400 to-orange-500',
  },
  {
    icon: '🐕',
    title: 'Pet Grooming',
    description: 'Professional pet care',
    category: 'Pet Grooming',
    features: ['Bathing', 'Grooming', 'Styling'],
    color: 'bg-gradient-to-br from-yellow-400 to-amber-500',
  },
  {
    icon: '🎨',
    title: 'Tattoo',
    description: 'Custom tattoo artwork',
    category: 'Tattoo',
    features: ['Custom Design', 'Touch-ups', 'Removal Info'],
    color: 'bg-gradient-to-br from-gray-600 to-slate-700',
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Services We Offer
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore a wide range of professional beauty, wellness, and personal care services
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.category}
              {...service}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
