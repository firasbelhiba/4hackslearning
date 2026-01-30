'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

interface Stats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalCertificates: number;
}

export default function DashboardPage() {
  const { currentOrganization } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalCertificates: 0,
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrganization) return;

      try {
        setIsLoading(true);
        const response = await orgCoursesApi.getAll(currentOrganization.id, { limit: 5 });
        const courses = response.data.data || [];

        setRecentCourses(courses);
        setStats({
          totalCourses: response.data.meta?.total || courses.length,
          publishedCourses: courses.filter((c: any) => c.isPublished).length,
          totalStudents: courses.reduce((sum: number, c: any) => sum + (c._count?.enrollments || 0), 0),
          totalCertificates: 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization]);

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Organization Selected</h2>
          <p className="text-zinc-400">Please select an organization from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Welcome back! Here's an overview of {currentOrganization.name}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-[#D6FF25]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats.totalCourses}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Published
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats.publishedCourses}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats.totalStudents}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Certificates Issued
            </CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : stats.totalCertificates}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-zinc-400">Loading...</div>
          ) : recentCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">No courses yet</p>
              <p className="text-zinc-500 text-sm">Create your first course to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{course.title}</h3>
                      <p className="text-sm text-zinc-400">{course.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        course.isPublished
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
