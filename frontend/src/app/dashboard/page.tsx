'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, Clock, ChevronRight, Play, Settings, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { usersApi, enrollmentsApi, certificatesApi } from '@/lib/api';

interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCertificates: number;
  totalWatchTime: number;
}

interface EnrolledCourse {
  id: string;
  courseId: string;
  progress: number;
  status: string;
  course: {
    id: string;
    title: string;
    slug: string;
    level: string;
    thumbnail: string | null;
  };
}

interface Certificate {
  id: string;
  uniqueCode: string;
  issuedAt: string;
  course: {
    title: string;
  };
}

function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level) {
    case 'BEGINNER': return 'beginner';
    case 'INTERMEDIATE': return 'intermediate';
    case 'ADVANCED': return 'advanced';
    default: return 'beginner';
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);

        const [statsRes, enrollmentsRes, certificatesRes] = await Promise.all([
          usersApi.getStats(),
          enrollmentsApi.getAll(),
          certificatesApi.getAll(),
        ]);

        setStats(statsRes.data);
        setEnrolledCourses(enrollmentsRes.data);
        setCertificates(certificatesRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter in-progress courses (not completed)
  const inProgressCourses = enrolledCourses.filter(e => e.status !== 'COMPLETED');
  const recentCertificates = certificates.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display">
                Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
              </h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-brand/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                  <p className="text-sm text-gray-600">Courses</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalCertificates || 0}</p>
                  <p className="text-sm text-gray-600">Certificates</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatWatchTime(stats?.totalWatchTime || 0)}</p>
                  <p className="text-sm text-gray-600">Watch Time</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.completedCourses || 0}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Continue Learning</h2>
                <Link href="/courses" className="text-purple-600 text-sm hover:underline">
                  Browse all courses
                </Link>
              </div>

              <div className="space-y-4">
                {inProgressCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="hover:shadow-brutal-sm transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {enrollment.course.thumbnail ? (
                            <img
                              src={enrollment.course.thumbnail}
                              alt={enrollment.course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Play className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant={getLevelVariant(enrollment.course.level)} className="mb-2">
                                {enrollment.course.level.charAt(0) + enrollment.course.level.slice(1).toLowerCase()}
                              </Badge>
                              <h3 className="font-bold">{enrollment.course.title}</h3>
                              <p className="text-sm text-gray-600">
                                {Math.round(enrollment.progress)}% complete
                              </p>
                            </div>
                            <Link href={`/dashboard/courses/${enrollment.course.id}`}>
                              <Button variant="primary" size="sm">
                                Continue
                              </Button>
                            </Link>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{Math.round(enrollment.progress)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand transition-all"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {inProgressCourses.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        {enrolledCourses.length === 0
                          ? "You haven't enrolled in any courses yet"
                          : "Great job! You've completed all your courses"}
                      </p>
                      <Link href="/courses">
                        <Button variant="primary">Browse Courses</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Certificates Sidebar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Certificates</h2>
                {certificates.length > 0 && (
                  <Link href="/dashboard/certificates" className="text-purple-600 text-sm hover:underline">
                    View all
                  </Link>
                )}
              </div>

              <Card>
                <CardContent className="p-4">
                  {recentCertificates.length > 0 ? (
                    <div className="space-y-4">
                      {recentCertificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{cert.course.title}</p>
                            <p className="text-sm text-gray-500">
                              Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Link href={`/verify/${cert.uniqueCode}`}>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 text-sm">
                        Complete a course to earn your first certificate
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/courses" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Button>
                  </Link>
                  {certificates.length > 0 && (
                    <Link href="/dashboard/certificates" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Award className="w-4 h-4 mr-2" />
                        My Certificates
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
