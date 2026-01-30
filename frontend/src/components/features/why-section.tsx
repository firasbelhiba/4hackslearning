import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Built For Hackers',
    description: 'Content designed around real hackathon challenges, not abstract theory.',
  },
  {
    title: 'Hands-on learning',
    description: 'Every course includes practical exercises, projects, and real-world scenarios.',
  },
  {
    title: 'Recognized certifications',
    description: 'Earn certifications you can showcase on your 4hacks profile and share with employers.',
  },
];

export function WhySection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-3xl md:text-4xl font-bold mb-12 font-display">
          Why learn on 4hacks?
        </h2>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-[#E6FF7B]">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
