import Image from 'next/image';

const partners = [
  { name: 'Partner 1', logo: '/partners/Group 5.png' },
  { name: 'Partner 2', logo: '/partners/Group 6.png' },
  { name: 'Partner 3', logo: '/partners/Frame.png' },
  { name: 'Partner 4', logo: '/partners/XMLID_1_.png' },
  { name: 'Tokopedia', logo: '/partners/cdnlogo.com_tokopedia 1.png' },
  { name: 'Partner 5', logo: '/partners/Vector.png' },
  { name: 'Partner 6', logo: '/partners/Vector (1).png' },
  { name: 'Partner 7', logo: '/partners/Group 9.png' },
  { name: 'Partner 8', logo: '/partners/Group 10.png' },
  { name: 'Partner 9', logo: '/partners/Vector (2).png' },
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-[#FCFAF7]">
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
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-10 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={80}
                height={32}
                className="h-6 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
