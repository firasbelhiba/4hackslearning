'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Play, Clock, BookOpen, Award, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Mock course data - replace with API call
const courseData = {
  id: '1',
  title: 'Hedera Certification',
  slug: 'hedera-certification-intermediate',
  description: `Validate your blockchain expertise with our comprehensive certification program. Stand out to employers and the community with verified skills.

This intermediate-level course covers:
- Hedera Hashgraph fundamentals
- Smart contract development on Hedera
- Token services and HCS
- Building dApps with Hedera SDKs
- Security best practices`,
  shortDescription: 'Validate your blockchain expertise with our comprehensive certification program.',
  level: 'INTERMEDIATE',
  category: 'Blockchain',
  tags: ['Hedera', 'Blockchain', 'Smart Contracts', 'Certification'],
  instructor: {
    name: 'Dhaker',
    avatar: '/avatars/dhaker.jpg',
    bio: 'Web3 educator and hackathon mentor',
  },
  modules: [
    {
      id: 'm1',
      title: 'Introduction to Hedera',
      description: 'Get started with Hedera Hashgraph fundamentals',
      lessons: [
        { id: 'l1', title: 'What is Hedera Hashgraph?', duration: 600 },
        { id: 'l2', title: 'Setting Up Your Development Environment', duration: 480 },
        { id: 'l3', title: 'Your First Hedera Transaction', duration: 720 },
      ],
      hasQuiz: true,
    },
    {
      id: 'm2',
      title: 'Smart Contracts on Hedera',
      description: 'Learn to build and deploy smart contracts',
      lessons: [
        { id: 'l4', title: 'Introduction to Solidity', duration: 900 },
        { id: 'l5', title: 'Your First Smart Contract', duration: 900 },
        { id: 'l6', title: 'Deploying to Hedera', duration: 600 },
      ],
      hasQuiz: true,
    },
    {
      id: 'm3',
      title: 'Token Services',
      description: 'Create and manage tokens on Hedera',
      lessons: [
        { id: 'l7', title: 'Hedera Token Service Overview', duration: 600 },
        { id: 'l8', title: 'Creating Fungible Tokens', duration: 720 },
        { id: 'l9', title: 'Creating NFTs', duration: 720 },
      ],
      hasQuiz: true,
    },
  ],
  enrollmentCount: 1250,
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

function getTotalDuration(modules: typeof courseData.modules): string {
  const totalSeconds = modules.reduce(
    (acc, module) => acc + module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
    0
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getTotalLessons(modules: typeof courseData.modules): number {
  return modules.reduce((acc, module) => acc + module.lessons.length, 0);
}

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level) {
    case 'BEGINNER': return 'beginner';
    case 'INTERMEDIATE': return 'intermediate';
    case 'ADVANCED': return 'advanced';
    default: return 'beginner';
  }
}

export default function CourseDetailPage() {
  const params = useParams();
  const [expandedModule, setExpandedModule] = useState<string | null>('m1');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleEnroll = () => {
    // TODO: Implement actual enrollment with API
    setIsEnrolled(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Course Header */}
        <section className="bg-brand py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <Badge variant={getLevelVariant(courseData.level)} className="mb-4">
                {courseData.level.charAt(0) + courseData.level.slice(1).toLowerCase()}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                {courseData.title}
              </h1>
              <p className="text-lg text-black/80 mb-6">
                {courseData.shortDescription}
              </p>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{getTotalDuration(courseData.modules)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{getTotalLessons(courseData.modules)} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Certificate included</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-black">
                  <span className="font-bold">{courseData.instructor.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{courseData.instructor.name}</p>
                  <p className="text-sm text-black/60">{courseData.instructor.bio}</p>
                </div>
              </div>

              {/* CTA */}
              {isEnrolled ? (
                <Link href={`/dashboard/courses/${courseData.id}`}>
                  <Button variant="primary" size="lg">
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" size="lg" onClick={handleEnroll}>
                  Enroll Now - Free
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Curriculum */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>

                <div className="space-y-4">
                  {courseData.modules.map((module, moduleIndex) => (
                    <Card key={module.id}>
                      <button
                        className="w-full p-4 flex items-center justify-between text-left"
                        onClick={() =>
                          setExpandedModule(expandedModule === module.id ? null : module.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold">
                            {moduleIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-bold">{module.title}</h3>
                            <p className="text-sm text-gray-500">
                              {module.lessons.length} lessons
                              {module.hasQuiz && ' • 1 quiz'}
                            </p>
                          </div>
                        </div>
                        {expandedModule === module.id ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      {expandedModule === module.id && (
                        <CardContent className="pt-0">
                          <div className="border-t pt-4 space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <Play className="w-4 h-4 text-gray-400" />
                                  <span>{lesson.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDuration(lesson.duration)}
                                </span>
                              </div>
                            ))}
                            {module.hasQuiz && (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                                <div className="flex items-center gap-3">
                                  <Award className="w-4 h-4 text-purple-600" />
                                  <span className="text-purple-700">Module Quiz</span>
                                </div>
                                <Lock className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">What you&apos;ll learn</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-brand mt-1">✓</span>
                        <span>Understand Hedera Hashgraph fundamentals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand mt-1">✓</span>
                        <span>Build and deploy smart contracts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand mt-1">✓</span>
                        <span>Create fungible tokens and NFTs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand mt-1">✓</span>
                        <span>Pass certification assessment</span>
                      </li>
                    </ul>

                    <hr className="my-6" />

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled</span>
                        <span className="font-medium">{courseData.enrollmentCount.toLocaleString()} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last updated</span>
                        <span className="font-medium">January 2024</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
