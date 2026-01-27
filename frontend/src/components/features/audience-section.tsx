import Link from 'next/link';
import { Button } from '@/components/ui/button';

const audiences = [
  { label: 'Hackers', rotation: -12 },
  { label: 'Professionals', rotation: 5 },
  { label: 'Students', rotation: 8 },
  { label: 'Career switchers', rotation: -8 },
  { label: 'Hackathon organizers', rotation: 3 },
];

export function AudienceSection() {
  return (
    <section className="py-16 lg:py-24 bg-pink-200 grid-bg">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section Header */}
          <h2 className="text-3xl md:text-4xl font-bold mb-12 font-display">
            Who is this for?
          </h2>

          {/* Audience Tags */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {audiences.map((audience, index) => (
              <div
                key={index}
                className="px-6 py-3 bg-white border-2 border-black rounded-lg shadow-brutal-sm font-medium transform hover:scale-105 transition-transform"
                style={{ transform: `rotate(${audience.rotation}deg)` }}
              >
                {audience.label}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Link href="/courses">
            <Button variant="secondary" size="lg">
              Start Learning
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
