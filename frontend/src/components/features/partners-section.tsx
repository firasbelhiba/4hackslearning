export function PartnersSection() {
  const partners = [
    { name: 'David Eccles School of Business', logo: '/partners/david-eccles.png' },
    { name: 'Harvard University', logo: '/partners/harvard.png' },
    { name: 'Stanford', logo: '/partners/stanford.png' },
    { name: 'Google', logo: '/partners/google.png' },
    { name: 'Tokopedia', logo: '/partners/tokopedia.png' },
    { name: 'University of Cambridge', logo: '/partners/cambridge.png' },
    { name: 'Oxford', logo: '/partners/oxford.png' },
    { name: 'Microsoft', logo: '/partners/microsoft.png' },
    { name: 'Amazon', logo: '/partners/amazon.png' },
    { name: 'Samsung', logo: '/partners/samsung.png' },
  ];

  return (
    <section className="py-16 bg-pink-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            Collaborate with 100+
            <br />
            leading universities and companies
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            4hacks has contributed to students so that they can work in their dream company, we
            will continue to stick to our commitment to create an advanced generation.
          </p>
        </div>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center h-16 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
            >
              {/* Placeholder for partner logos - replace with actual images */}
              <span className="text-lg font-semibold text-gray-600">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
