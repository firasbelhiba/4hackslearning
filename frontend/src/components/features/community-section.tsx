import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Users, Globe, MessageCircle, ArrowRight } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Members' },
  { icon: Globe, value: '120+', label: 'Countries' },
  { icon: MessageCircle, value: '24/7', label: 'Support' },
];

export function CommunitySection() {
  return (
    <section className="relative bg-black overflow-hidden">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-display text-white">
            Join a Global Community of Builders
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Connect with 50,000+ developers, designers, and entrepreneurs building the future of Web3.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-gray-600 rounded-full text-white"
              >
                <stat.icon className="w-5 h-5 text-gray-400" />
                <span className="font-bold">{stat.value}</span>
                <span className="text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link href="/community">
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-black border-2 border-black hover:bg-gray-100 rounded-lg px-6 gap-2"
            >
              Join the Community
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Purple Spikes Image */}
      <div className="w-full">
        <Image
          src="/images/Union.png"
          alt=""
          width={1440}
          height={160}
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
