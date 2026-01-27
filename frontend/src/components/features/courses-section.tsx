'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const courses = [
  {
    id: 1,
    title: 'Hedera Certification',
    description: 'Validate your blockchain expertise with our comprehensive certification program. Stand out to employers and the community with verified skills.',
    level: 'INTERMEDIATE',
    slug: 'hedera-certification-intermediate',
  },
  {
    id: 2,
    title: 'Hedera Certification',
    description: 'Validate your blockchain expertise with our comprehensive certification program. Stand out to employers and the community with verified skills.',
    level: 'BEGINNER',
    slug: 'hedera-certification-beginner',
  },
  {
    id: 3,
    title: 'Hedera Certification',
    description: 'Validate your blockchain expertise with our comprehensive certification program. Stand out to employers and the community with verified skills.',
    level: 'ADVANCED',
    slug: 'hedera-certification-advanced',
  },
];

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level) {
    case 'BEGINNER':
      return 'beginner';
    case 'INTERMEDIATE':
      return 'intermediate';
    case 'ADVANCED':
      return 'advanced';
    default:
      return 'beginner';
  }
}

function getLevelLabel(level: string): string {
  switch (level) {
    case 'BEGINNER':
      return 'Beginner';
    case 'INTERMEDIATE':
      return 'Intermediate';
    case 'ADVANCED':
      return 'Advanced';
    default:
      return level;
  }
}

export function CoursesSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12">
          Courses
        </h2>

        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all h-full flex flex-col"
            >
              <CardHeader className="pb-3">
                <Badge variant={getLevelVariant(course.level)} className="w-fit mb-3">
                  {getLevelLabel(course.level)}
                </Badge>
                <h3 className="text-lg sm:text-xl font-bold">{course.title}</h3>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                  {course.description}
                </p>
                <Link href={`/courses/${course.slug}`} className="mt-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
          <Link href="/courses" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Start Learning
            </Button>
          </Link>
          <Link href="/courses" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
