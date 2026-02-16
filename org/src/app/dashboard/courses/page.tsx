'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Plus,
  Search,
  BookOpen,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  isPublished: boolean;
  thumbnail: string | null;
  _count?: {
    modules: number;
    enrollments: number;
  };
}

export default function CoursesPage() {
  const { currentOrganization } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [currentOrganization]);

  const fetchCourses = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await orgCoursesApi.getAll(currentOrganization.id);
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete || !currentOrganization) return;

    try {
      await orgCoursesApi.delete(currentOrganization.id, courseToDelete.id);
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      toast({
        title: 'Course deleted',
        description: 'The course has been permanently deleted.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete course',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Courses</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's courses and content.
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">No courses found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchQuery
                ? 'No courses match your search.'
                : 'Create your first course to get started.'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/courses/new">
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-brand/30 to-brand/10 rounded-t-lg overflow-hidden border-b-2 border-black">
                  <div className="flex items-center justify-center h-full">
                    <div className="p-4 bg-white/80 rounded-xl border-2 border-black shadow-brutal-sm">
                      <BookOpen className="h-10 w-10 text-black" />
                    </div>
                  </div>
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button size="sm" variant="outline" className="bg-white">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/courses/${course.id}/edit`}>
                      <Button size="sm" variant="primary">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-black line-clamp-1">
                      {course.title}
                    </h3>
                    <Badge
                      variant={course.isPublished ? 'success' : 'warning'}
                      className="ml-2 shrink-0"
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {course.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course._count?.modules || 0} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {course._count?.enrollments || 0}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCourseToDelete(course);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-1 rounded border-2 border-transparent hover:border-red-500 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This action
              cannot be undone and will remove all associated modules, lessons, and
              enrollments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
