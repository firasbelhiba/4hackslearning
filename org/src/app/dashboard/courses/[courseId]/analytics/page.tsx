'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Users,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  BookOpen,
  BarChart3,
  UserCheck,
  PlayCircle,
  HelpCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Analytics {
  totalEnrollments: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  certificateCount: number;
  avgProgress: number;
  completionRate: number;
  recentEnrollments: number;
  totalLessons: number;
  totalQuizzes: number;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  watchedSeconds: number;
}

interface Certificate {
  id: string;
  uniqueCode: string;
  issuedAt: string;
  pdfUrl: string | null;
}

interface Enrollment {
  id: string;
  userId: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED';
  enrolledAt: string;
  completedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  lessonProgress: LessonProgress[];
  certificate: Certificate | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { currentOrganization } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'not_started'>('all');

  useEffect(() => {
    fetchData();
  }, [courseId, currentOrganization]);

  const fetchData = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const [courseRes, analyticsRes, enrollmentsRes] = await Promise.all([
        orgCoursesApi.getById(currentOrganization.id, courseId),
        orgCoursesApi.getAnalytics(currentOrganization.id, courseId),
        orgCoursesApi.getEnrollments(currentOrganization.id, courseId),
      ]);

      setCourse(courseRes.data);
      setAnalytics(analyticsRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-brand';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusBadge = (enrollment: Enrollment) => {
    if (enrollment.status === 'COMPLETED') {
      return <Badge variant="success">Completed</Badge>;
    }
    if (enrollment.progress > 0) {
      return <Badge variant="warning">In Progress</Badge>;
    }
    return <Badge variant="secondary">Not Started</Badge>;
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    // Search filter
    const matchesSearch =
      enrollment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'completed') {
      matchesStatus = enrollment.status === 'COMPLETED';
    } else if (statusFilter === 'active') {
      matchesStatus = enrollment.status === 'ACTIVE' && enrollment.progress > 0;
    } else if (statusFilter === 'not_started') {
      matchesStatus = enrollment.status === 'ACTIVE' && enrollment.progress === 0;
    }

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Progress', 'Status', 'Enrolled Date', 'Completed Date', 'Certificate Code'];
    const rows = filteredEnrollments.map((e) => [
      e.user.name,
      e.user.email,
      `${Math.round(e.progress)}%`,
      e.status === 'COMPLETED' ? 'Completed' : e.progress > 0 ? 'In Progress' : 'Not Started',
      formatDate(e.enrolledAt),
      e.completedAt ? formatDate(e.completedAt) : '',
      e.certificate?.uniqueCode || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course?.slug || 'course'}-enrollments.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization from the sidebar.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/courses/${courseId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-black">Course Analytics</h1>
              <Badge variant={course.isPublished ? 'success' : 'warning'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mt-1">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 border-2 border-black flex items-center justify-center">
                <Users className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{analytics.totalEnrollments}</p>
                <p className="text-xs text-gray-600">Total Students</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 border-2 border-black flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{analytics.completedCount}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-brand/30 border-2 border-black flex items-center justify-center">
                <Award className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{analytics.certificateCount}</p>
                <p className="text-xs text-gray-600">Certificates Issued</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 border-2 border-black flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{analytics.completionRate}%</p>
                <p className="text-xs text-gray-600">Completion Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-black">{analytics.inProgressCount}</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <PlayCircle className="h-3 w-3" />
                In Progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-black">{analytics.notStartedCount}</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Not Started
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-black">{analytics.avgProgress}%</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Avg Progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-black">{analytics.totalLessons}</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <BookOpen className="h-3 w-3" />
                Total Lessons
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-bold text-black">{analytics.recentEnrollments}</p>
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <UserCheck className="h-3 w-3" />
                Last 30 Days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enrollments List */}
      <Card>
        <CardHeader className="py-4 px-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-black flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Enrollments
              <Badge variant="secondary" className="ml-2">{filteredEnrollments.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">In Progress</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No enrollments yet</h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchQuery || statusFilter !== 'all'
                  ? 'No students match your search criteria.'
                  : 'Students who enroll in this course will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Certificate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg border-2 border-black bg-brand/20 flex items-center justify-center overflow-hidden">
                            {enrollment.user.avatar ? (
                              <img
                                src={enrollment.user.avatar}
                                alt={enrollment.user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-black">
                                {enrollment.user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-black">{enrollment.user.name}</p>
                            <p className="text-xs text-gray-500">{enrollment.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-200 rounded-full border border-black overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(enrollment.progress)} transition-all`}
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-black">
                            {Math.round(enrollment.progress)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(enrollment)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(enrollment.enrolledAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {enrollment.completedAt ? (
                          <span className="text-sm text-green-600">
                            {formatDate(enrollment.completedAt)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {enrollment.certificate ? (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-brand" />
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded border">
                              {enrollment.certificate.uniqueCode}
                            </code>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
