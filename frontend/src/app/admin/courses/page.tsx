'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock courses data
const courses = [
  {
    id: '1',
    title: 'Hedera Certification - Intermediate',
    slug: 'hedera-certification-intermediate',
    level: 'INTERMEDIATE',
    enrollments: 1250,
    isPublished: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Hedera Certification - Beginner',
    slug: 'hedera-certification-beginner',
    level: 'BEGINNER',
    enrollments: 980,
    isPublished: true,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Hedera Certification - Advanced',
    slug: 'hedera-certification-advanced',
    level: 'ADVANCED',
    enrollments: 450,
    isPublished: true,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    title: 'DeFi Fundamentals',
    slug: 'defi-fundamentals',
    level: 'BEGINNER',
    enrollments: 0,
    isPublished: false,
    createdAt: '2024-01-25',
  },
];

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level) {
    case 'BEGINNER': return 'beginner';
    case 'INTERMEDIATE': return 'intermediate';
    case 'ADVANCED': return 'advanced';
    default: return 'beginner';
  }
}

export default function AdminCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display">Courses</h1>
              <p className="text-gray-600">Manage your course catalog</p>
            </div>
            <Link href="/admin/courses/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Courses Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-black">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Level</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Enrollments</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Created</th>
                      <th className="px-6 py-4 text-right text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getLevelVariant(course.level)}>
                            {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{course.enrollments.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              course.isPublished
                                ? 'bg-brand/20 text-brand-dark'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/courses/${course.slug}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/courses/${course.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No courses found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
