import Link from 'next/link';
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
    <section className="py-16 lg:py-24 bg-pink-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            {/* Star decorations */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400" style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            }} />
            <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-yellow-400" style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            }} />

            {/* Image placeholder - replace with actual image */}
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto bg-brand/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-brand" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">Student with certificate</p>
              </div>
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
