'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

// Mock admin stats - replace with API
const adminStats = {
  totalUsers: 2450,
  totalCourses: 12,
  totalEnrollments: 5680,
  totalCertificates: 1250,
  userGrowth: 12.5,
  enrollmentGrowth: 8.3,
};

const recentEnrollments = [
  { id: 1, userName: 'Alice Johnson', courseName: 'Hedera Certification', date: '2024-01-27' },
  { id: 2, userName: 'Bob Smith', courseName: 'DeFi Fundamentals', date: '2024-01-27' },
  { id: 3, userName: 'Carol Williams', courseName: 'Smart Contract Security', date: '2024-01-26' },
  { id: 4, userName: 'David Brown', courseName: 'NFT Development', date: '2024-01-26' },
];

const popularCourses = [
  { id: 1, title: 'Hedera Certification', enrollments: 1250, completion: 78 },
  { id: 2, title: 'DeFi Fundamentals', enrollments: 980, completion: 65 },
  { id: 3, title: 'Smart Contract Security', enrollments: 750, completion: 82 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your learning platform</p>
            </div>
            <Link href="/admin/courses/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center text-brand-dark text-sm mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{adminStats.userGrowth}%
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-3xl font-bold">{adminStats.totalCourses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-brand/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-brand-dark" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Enrollments</p>
                    <p className="text-3xl font-bold">{adminStats.totalEnrollments.toLocaleString()}</p>
                    <div className="flex items-center text-brand-dark text-sm mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{adminStats.enrollmentGrowth}%
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certificates</p>
                    <p className="text-3xl font-bold">{adminStats.totalCertificates.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Enrollments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Enrollments</CardTitle>
                <Link href="/admin/enrollments" className="text-sm text-purple-600 hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{enrollment.userName}</p>
                        <p className="text-sm text-gray-500">{enrollment.courseName}</p>
                      </div>
                      <span className="text-sm text-gray-500">{enrollment.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Courses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Popular Courses</CardTitle>
                <Link href="/admin/courses" className="text-sm text-purple-600 hover:underline">
                  Manage courses
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-500">
                          {course.enrollments.toLocaleString()} enrollments
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{course.completion}%</p>
                        <p className="text-sm text-gray-500">completion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/courses">
                <Card className="hover:shadow-brutal-sm transition-all cursor-pointer">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Manage Courses</p>
                      <p className="text-sm text-gray-500">Create, edit, and publish courses</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="hover:shadow-brutal-sm transition-all cursor-pointer">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-bold">Manage Users</p>
                      <p className="text-sm text-gray-500">View and manage user accounts</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/certificates">
                <Card className="hover:shadow-brutal-sm transition-all cursor-pointer">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-bold">View Certificates</p>
                      <p className="text-sm text-gray-500">Browse issued certificates</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
