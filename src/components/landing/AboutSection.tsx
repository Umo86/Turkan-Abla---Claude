import { img, IMAGES } from './images';

export function AboutSection() {
  const values = [
    { title: 'Quality', description: 'Verified professionals with years of experience', icon: '⭐' },
    { title: 'Trust', description: 'Secure payments, transparent pricing, protection', icon: '🔒' },
    { title: 'Convenience', description: 'Book, pay, and manage from anywhere', icon: '📱' },
    { title: 'Community', description: 'Supporting small businesses & local talent', icon: '🤝' },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#EBE0D1]">
      <div className="max-w-7xl mx-auto">
        {/* Story block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Image */}
          <div className="relative h-[28rem] rounded-[2rem] overflow-hidden order-last lg:order-first">
            <img
              src={img(IMAGES.about, 900)}
              alt="Beauty professional at work"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A211B]/30 to-transparent" />
          </div>

          {/* Text */}
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#A9755A] mb-3">
              About Türkan Abla
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#2A211B] leading-tight mb-6">
              Your Beauty &amp; Success Start Here
            </h2>
            <p className="text-[#6F6055] mb-4 leading-relaxed">
              Türkan Abla is a modern beauty and wellness marketplace connecting
              professional vendors with customers across the UK. We make quality
              personal care accessible, convenient, and affordable for everyone.
            </p>
            <p className="text-[#6F6055] leading-relaxed">
              Founded to support small beauty businesses and entrepreneurs,
              we&apos;ve grown into a trusted platform with hundreds of vendors
              and thousands of happy customers.
            </p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="font-serif text-3xl text-[#2A211B] mb-10 text-center">
            Our Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-[#F4ECE1] rounded-2xl p-7 border border-[#2A211B]/5 hover:border-[#A9755A]/40 transition-colors"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h4 className="text-lg font-semibold mb-2 text-[#2A211B]">
                  {value.title}
                </h4>
                <p className="text-sm text-[#6F6055]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
