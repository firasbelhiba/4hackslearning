import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Globe, Headphones } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Members' },
  { icon: Globe, value: '120+', label: 'Countries' },
  { icon: Headphones, value: '24/7', label: 'Support' },
];

export function CommunitySection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            Join a Global Community of Builders
          </h2>
          <p className="text-gray-600 mb-10">
            Connect with 50,000+ developers, designers, and entrepreneurs building the future of Web3.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-black rounded-lg shadow-brutal-sm"
              >
                <stat.icon className="w-5 h-5" />
                <span className="font-bold">{stat.value}</span>
                <span className="text-gray-600">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link href="/community">
            <Button variant="outline" size="lg">
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
