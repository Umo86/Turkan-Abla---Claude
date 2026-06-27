import Link from 'next/link';

const tiers = [
  {
    name: 'Pay Per Service',
    price: 'Varies',
    description: 'Book and pay for individual services with no commitment',
    features: [
      'No subscription required',
      'Transparent pricing',
      'Secure payment',
      'Instant confirmation',
      'Cancel anytime',
    ],
    cta: 'Browse Services',
    ctaHref: '/auth/signup/customer',
    highlighted: false,
  },
  {
    name: 'Monthly Membership',
    price: '£9.99/mo',
    description: 'Save on regular beauty services with exclusive member perks',
    features: [
      '10% discount on all services',
      'Priority booking',
      'Exclusive member deals',
      'Flexible scheduling',
      'Cancel anytime',
    ],
    cta: 'Get Started',
    ctaHref: '/auth/signup/customer',
    highlighted: true,
  },
  {
    name: 'Pro Package',
    price: 'Custom',
    description: 'Tailored packages for frequent customers who want the best',
    features: [
      'Up to 20% discount',
      'Dedicated support',
      'Custom scheduling',
      'Package deals',
      'VIP treatment',
    ],
    cta: 'Contact Us',
    ctaHref: '#contact',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the option that works best for you — no hidden fees, no surprises
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                tier.highlighted
                  ? 'ring-2 ring-amber-700 shadow-2xl scale-105'
                  : 'shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Most Popular badge */}
              {tier.highlighted && (
                <div className="bg-gradient-to-r from-amber-700 to-orange-600 text-white text-center py-2 text-sm font-bold tracking-wide">
                  Most Popular
                </div>
              )}

              <div
                className={`p-8 ${
                  tier.highlighted ? 'bg-white' : 'bg-amber-50/40'
                }`}
              >
                {/* Title & Price */}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{tier.name}</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-700 text-sm">
                      <span className="text-amber-700 font-bold text-base flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  className={`block w-full text-center h-11 leading-[2.75rem] rounded-lg font-semibold transition-all text-sm ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <div className="mt-14 text-center">
          <p className="text-gray-600">
            Questions about pricing?{' '}
            <Link
              href="#contact"
              className="text-amber-700 font-semibold hover:underline"
            >
              Get in touch with us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
