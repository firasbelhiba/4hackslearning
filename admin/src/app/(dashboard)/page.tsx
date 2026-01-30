'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoader } from '@/components/ui/loader';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
}

interface RecentCourse {
  id: string;
  title: string;
  slug: string;
  level: string;
  isPublished: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
  });
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const coursesRes = await api.get('/courses');
        const courses = coursesRes.data.data || coursesRes.data.courses || [];

        setStats({
          totalCourses: courses.length,
          totalUsers: 0,
          totalEnrollments: 0,
          totalCertificates: 0,
        });

        setRecentCourses(courses.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <InlineLoader />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <Link href="/courses/new">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 border-2 border-black flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-brand border-2 border-black flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrollments</p>
                <p className="text-3xl font-bold">{stats.totalEnrollments.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 border-2 border-black flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-3xl font-bold">{stats.totalCertificates.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 border-2 border-black flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Courses</CardTitle>
            <Link href="/courses" className="text-sm text-brand-dark hover:underline font-medium">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentCourses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No courses yet. Create your first course!
              </p>
            ) : (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {course.level.toLowerCase()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded border-2 border-black ${
                        course.isPublished ? 'bg-brand' : 'bg-gray-200'
                      }`}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/courses" className="block">
                <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand border-2 border-black flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">Manage Courses</p>
                      <p className="text-sm text-gray-500">Create, edit, and publish</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>

              <Link href="/users" className="block">
                <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 border-2 border-black flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold">Manage Users</p>
                      <p className="text-sm text-gray-500">View and manage accounts</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>

              <Link href="/certificates" className="block">
                <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 border-2 border-black flex items-center justify-center">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold">View Certificates</p>
                      <p className="text-sm text-gray-500">Browse issued certificates</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
