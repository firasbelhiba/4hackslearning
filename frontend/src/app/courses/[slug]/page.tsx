'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Play, Clock, BookOpen, Award, ChevronDown, ChevronRight, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { coursesApi, enrollmentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoDuration?: number;
  type: string;
  isFreePreview: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  quiz?: {
    id: string;
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  level: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  modules: Module[];
  _count?: {
    enrollments: number;
  };
  updatedAt: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0 min';
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

function getTotalDuration(modules: Module[]): string {
  const totalSeconds = modules.reduce(
    (acc, module) => acc + module.lessons.reduce((sum, lesson) => sum + (lesson.videoDuration || 0), 0),
    0
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getTotalLessons(modules: Module[]): number {
  return modules.reduce((acc, module) => acc + module.lessons.length, 0);
}

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level?.toUpperCase()) {
    case 'BEGINNER': return 'beginner';
    case 'INTERMEDIATE': return 'intermediate';
    case 'ADVANCED': return 'advanced';
    default: return 'beginner';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getBySlug(slug);
        setCourse(response.data);

        // Expand first module by default
        if (response.data.modules?.length > 0) {
          setExpandedModule(response.data.modules[0].id);
        }
      } catch (err: any) {
        console.error('Failed to fetch course:', err);
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  // Get auth state
  const { isAuthenticated, fetchUser } = useAuthStore();

  // Refresh user auth on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!course?.id) return;

      // If not authenticated, don't bother checking enrollment
      if (!isAuthenticated) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      try {
        const response = await enrollmentsApi.checkEnrollment(course.id);
        setIsEnrolled(response.data.isEnrolled);
      } catch (err: any) {
        console.error('Enrollment check failed:', err?.response?.status, err?.message);
        // Not logged in or error - assume not enrolled
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    if (course) {
      checkEnrollment();
    }
  }, [course, isAuthenticated]);

  const handleEnroll = async () => {
    if (!course) return;

    try {
      setEnrolling(true);
      await enrollmentsApi.enroll(course.id);
      setIsEnrolled(true);
      // Navigate to learning page
      router.push(`/dashboard/courses/${course.id}`);
    } catch (err: any) {
      console.error('Failed to enroll:', err);
      if (err.response?.status === 401) {
        // Not logged in - redirect to login
        router.push(`/auth/login?redirect=/courses/${slug}`);
      } else if (err.response?.status === 409) {
        // Already enrolled
        setIsEnrolled(true);
      } else {
        alert(err.response?.data?.message || 'Failed to enroll');
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-brand" />
            <p className="text-gray-600">Loading course...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
              <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
              <Link href="/courses">
                <Button variant="primary">Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Course Header */}
        <section className="bg-brand py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <Badge variant={getLevelVariant(course.level)} className="mb-4">
                {course.level?.charAt(0) + course.level?.slice(1).toLowerCase()}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                {course.title}
              </h1>
              <p className="text-lg text-black/80 mb-6">
                {course.shortDescription || course.description?.slice(0, 150)}
              </p>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{getTotalDuration(course.modules)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{getTotalLessons(course.modules)} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Certificate included</span>
                </div>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center border-2 border-black overflow-hidden">
                    {course.instructor.avatar && !avatarError ? (
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="font-bold text-lg text-black">
                        {course.instructor.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{course.instructor.name}</p>
                    {course.instructor.bio && (
                      <p className="text-sm text-black/60">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              {checkingEnrollment ? (
                <Button variant="primary" size="lg" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : isEnrolled ? (
                <Link href={`/dashboard/courses/${course.id}`}>
                  <Button variant="primary" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now - Free'
                  )}
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

                {course.modules.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No modules yet. Check back soon!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <Card key={module.id}>
                        <button
                          className="w-full p-4 flex items-center justify-between text-left"
                          onClick={() =>
                            setExpandedModule(expandedModule === module.id ? null : module.id)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold border-2 border-black">
                              {moduleIndex + 1}
                            </div>
                            <div>
                              <h3 className="font-bold">{module.title}</h3>
                              <p className="text-sm text-gray-500">
                                {module.lessons.length} lessons
                                {module.quiz && ' • 1 quiz'}
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
                                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                    isEnrolled || lesson.isFreePreview
                                      ? 'hover:bg-gray-100 cursor-pointer'
                                      : 'opacity-75'
                                  }`}
                                  onClick={() => {
                                    if (isEnrolled) {
                                      router.push(`/dashboard/courses/${course.id}`);
                                    } else if (lesson.isFreePreview) {
                                      // Could show a preview modal or redirect
                                      router.push(`/dashboard/courses/${course.id}`);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.isFreePreview && !isEnrolled ? (
                                      <Badge variant="beginner" className="text-xs px-2 py-0.5">
                                        Free
                                      </Badge>
                                    ) : isEnrolled ? (
                                      <Play className="w-4 h-4 text-brand" />
                                    ) : (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className={!isEnrolled && !lesson.isFreePreview ? 'text-gray-500' : ''}>
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {formatDuration(lesson.videoDuration)}
                                  </span>
                                </div>
                              ))}
                              {module.quiz && (
                                <div
                                  className={`flex items-center justify-between p-3 rounded-lg bg-purple-50 ${
                                    isEnrolled ? 'hover:bg-purple-100 cursor-pointer' : ''
                                  }`}
                                  onClick={() => {
                                    if (isEnrolled) {
                                      router.push(`/dashboard/courses/${course.id}`);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <Award className="w-4 h-4 text-purple-600" />
                                    <span className="text-purple-700">{module.quiz.title || 'Module Quiz'}</span>
                                  </div>
                                  {!isEnrolled && <Lock className="w-4 h-4 text-gray-400" />}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">What you&apos;ll learn</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                        <span>Understand {course.category || 'the subject'} fundamentals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                        <span>Build practical projects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                        <span>Earn a certificate of completion</span>
                      </li>
                      {course.tags && course.tags.length > 0 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                          <span>Master {course.tags.slice(0, 2).join(', ')}</span>
                        </li>
                      )}
                    </ul>

                    <hr className="my-6" />

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled</span>
                        <span className="font-medium">
                          {course._count?.enrollments?.toLocaleString() || 0} students
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last updated</span>
                        <span className="font-medium">{formatDate(course.updatedAt)}</span>
                      </div>
                      {course.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium">{course.category}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <>
                        <hr className="my-6" />
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Course Description */}
        {course.description && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold mb-6">About This Course</h2>
                <div className="prose max-w-none">
                  {course.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
