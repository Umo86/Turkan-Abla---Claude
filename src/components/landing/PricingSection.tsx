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
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F4ECE1]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-[#A9755A] mb-3">
            Pricing
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2A211B] leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-[#6F6055] max-w-2xl mx-auto">
            Choose the option that works best for you — no hidden fees, no
            surprises.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => {
            const dark = tier.highlighted;
            return (
              <div
                key={tier.name}
                className={`relative rounded-[1.75rem] overflow-hidden transition-all duration-300 ${
                  dark
                    ? 'bg-[#2A211B] shadow-2xl md:-translate-y-3'
                    : 'bg-[#EBE0D1] hover:shadow-xl'
                }`}
              >
                {dark && (
                  <div className="bg-[#A9755A] text-[#F4ECE1] text-center py-2 text-xs font-semibold uppercase tracking-[0.15em]">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      dark ? 'text-[#F4ECE1]' : 'text-[#2A211B]'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-sm mb-5 leading-relaxed ${
                      dark ? 'text-[#F4ECE1]/60' : 'text-[#6F6055]'
                    }`}
                  >
                    {tier.description}
                  </p>
                  <div className="mb-6">
                    <span
                      className={`font-serif text-4xl ${
                        dark ? 'text-[#F4ECE1]' : 'text-[#2A211B]'
                      }`}
                    >
                      {tier.price}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-center gap-3 text-sm ${
                          dark ? 'text-[#F4ECE1]/85' : 'text-[#6F6055]'
                        }`}
                      >
                        <span className="text-[#A9755A] font-bold flex-shrink-0">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tier.ctaHref}
                    className={`flex w-full items-center justify-center h-11 rounded-full font-medium text-sm transition-colors ${
                      dark
                        ? 'bg-[#F4ECE1] text-[#2A211B] hover:bg-white'
                        : 'bg-[#2A211B] text-[#F4ECE1] hover:bg-[#A9755A]'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ hint */}
        <div className="mt-12 text-center">
          <p className="text-[#6F6055]">
            Questions about pricing?{' '}
            <Link
              href="#contact"
              className="text-[#A9755A] font-semibold hover:underline"
            >
              Get in touch with us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
