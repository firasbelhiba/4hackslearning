'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InlineLoader } from '@/components/ui/loader';
import { api, coursesApi } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  level: string;
  isPublished: boolean;
  createdAt: string;
  _count?: {
    enrollments?: number;
  };
}

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level) {
    case 'BEGINNER': return 'beginner';
    case 'INTERMEDIATE': return 'intermediate';
    case 'ADVANCED': return 'advanced';
    default: return 'beginner';
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        const data = res.data.data || res.data.courses || [];
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    setDeleting(courseId);
    try {
      await coursesApi.delete(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course');
    } finally {
      setDeleting(null);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl sm:text-3xl font-bold">Courses</h1>
          <p className="text-gray-600 mt-1">Manage your course catalog</p>
        </div>
        <Link href="/courses/new">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" />
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
                  <th className="px-6 py-4 text-left text-sm font-bold hidden md:table-cell">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-bold hidden lg:table-cell">Enrollments</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold hidden sm:table-cell">Created</th>
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
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Badge variant={getLevelVariant(course.level)}>
                        {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="font-medium">
                        {(course._count?.enrollments || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-bold rounded border-2 border-black ${
                          course.isPublished ? 'bg-brand' : 'bg-gray-200'
                        }`}
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`http://localhost:3000/courses/${course.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" title="View on site">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </a>
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(course.id)}
                          disabled={deleting === course.id}
                          title="Delete"
                        >
                          {deleting === course.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
              <p className="text-gray-500">
                {searchQuery ? 'No courses found matching your search' : 'No courses yet. Create your first course!'}
              </p>
              {!searchQuery && (
                <Link href="/courses/new" className="inline-block mt-4">
                  <Button variant="primary" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Course
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
