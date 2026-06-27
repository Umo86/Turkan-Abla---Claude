'use client';

import Link from 'next/link';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  color: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  category,
  features,
  color,
}: ServiceCardProps) {
  return (
    <Link
      href={`/home?category=${encodeURIComponent(category)}`}
      className="group block h-full"
    >
      <div
        className={`relative h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 ${color}`} />

        {/* Content */}
        <div className="relative h-full p-8 flex flex-col justify-between text-white">
          {/* Icon & Title */}
          <div>
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-sm opacity-90 mb-4">{description}</p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <span className="text-lg">✓</span>
                {feature}
              </div>
            ))}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
      </div>
    </Link>
  );
}
