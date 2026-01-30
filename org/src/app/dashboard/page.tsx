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
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization from the sidebar.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's an overview of {currentOrganization.name}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-brand">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-black">
              Total Courses
            </CardTitle>
            <div className="p-2 bg-black rounded-lg">
              <BookOpen className="h-4 w-4 text-brand" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {isLoading ? '...' : stats.totalCourses}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-black">
              Published
            </CardTitle>
            <div className="p-2 bg-black rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {isLoading ? '...' : stats.publishedCourses}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-black">
              Total Students
            </CardTitle>
            <div className="p-2 bg-black rounded-lg">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {isLoading ? '...' : stats.totalStudents}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-black">
              Certificates Issued
            </CardTitle>
            <div className="p-2 bg-black rounded-lg">
              <Award className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {isLoading ? '...' : stats.totalCertificates}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-black">Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-gray-600">Loading...</div>
          ) : recentCourses.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mx-auto mb-3 shadow-brutal-sm">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-black font-bold">No courses yet</p>
              <p className="text-gray-600 text-sm">Create your first course to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-lg border-2 border-black bg-gray-50 shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg border-2 border-black bg-white flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-bold shadow-brutal-sm ${
                        course.isPublished
                          ? 'bg-green-400 text-black'
                          : 'bg-yellow-400 text-black'
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
