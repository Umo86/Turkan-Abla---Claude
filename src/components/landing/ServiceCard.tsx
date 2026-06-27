import Link from 'next/link';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  category: string;
  image: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  category,
  image,
}: ServiceCardProps) {
  return (
    <Link
      href={`/home?category=${encodeURIComponent(category)}`}
      className="group block"
    >
      <div className="relative h-72 rounded-2xl overflow-hidden">
        {/* Image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A211B]/90 via-[#2A211B]/20 to-transparent" />

        {/* Arrow */}
        <span className="absolute top-4 right-4 h-9 w-9 rounded-full bg-[#F4ECE1]/90 text-[#2A211B] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ↗
        </span>

        {/* Label */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-[#F4ECE1]">
          <div className="text-2xl mb-1">{icon}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-[#F4ECE1]/75">{description}</p>
        </div>
      </div>
    </Link>
  );
}
