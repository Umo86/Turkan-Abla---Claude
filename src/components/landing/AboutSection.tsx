export function AboutSection() {
  const values = [
    {
      title: 'Quality',
      description: 'All our vendors are verified professionals with years of experience',
      icon: '⭐',
    },
    {
      title: 'Trust',
      description: 'Secure payments, transparent pricing, and customer protection',
      icon: '🔒',
    },
    {
      title: 'Convenience',
      description: 'Book instantly, pay online, and manage bookings from anywhere',
      icon: '📱',
    },
    {
      title: 'Community',
      description: 'Supporting small businesses and connecting them with customers',
      icon: '🤝',
    },
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              About Türkan Abla
            </span>
          </h2>
        </div>

        {/* Two-column story block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Text column */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900">
              Connecting Beauty Professionals with Customers
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Türkan Abla is a modern beauty and wellness services marketplace connecting
              professional vendors with customers across the UK. We believe in making quality
              personal care services accessible, convenient, and affordable for everyone.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Founded with a mission to support small beauty businesses and entrepreneurs, we&apos;ve
              grown to become a trusted platform with hundreds of vendors and thousands of happy
              customers.
            </p>
          </div>

          {/* Decorative gradient panel */}
          <div className="relative h-96 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              ✨
            </div>
            <div className="absolute top-6 right-6 w-24 h-24 bg-amber-400/30 rounded-full blur-xl" />
            <div className="absolute bottom-6 left-6 w-32 h-32 bg-orange-400/30 rounded-full blur-xl" />
          </div>
        </div>

        {/* Our Values grid */}
        <div>
          <h3 className="text-3xl font-bold mb-12 text-center text-gray-900">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
