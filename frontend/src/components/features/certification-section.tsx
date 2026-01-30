import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const benefits = [
  'Shareable digital certificates',
  'Visible on your 4hacks profile',
  'Recognized by hackathon organizers',
  'Useful for internships and jobs',
];

export function CertificationSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#FCFAF7]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            {/* Illustration Image */}
            <div className="relative aspect-square">
              <Image
                src="/images/Illustration.png"
                alt="Student with certificate"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Content Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              Get certified.
              <br />
              Prove your skills.
            </h2>

            <p className="text-gray-600 mb-6">
              4hacks certifications validate your practical skills through real assessments, not just quizzes.
              Each certification is tied to a specific skill set and challenge-based evaluation.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <Link href="/certifications">
              <Button variant="pink" size="lg">
                Explore certifications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
