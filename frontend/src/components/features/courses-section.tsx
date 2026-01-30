'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InlineLoader } from '@/components/ui/loader';
import { coursesApi } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesApi.getAll({ limit: '3' });
        setCourses(response.data.data || response.data.courses || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12">
          Courses
        </h2>

        {/* Loading State */}
        {loading && <InlineLoader />}

        {/* Course Cards */}
        {!loading && courses.length > 0 && (
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
                    {course.shortDescription || course.description}
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
        )}

        {/* Action Buttons */}
        {!loading && (
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
        )}
      </div>
    </section>
  );
}
