'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { coursesApi } from '@/lib/api';

interface CourseForm {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  thumbnailUrl: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CourseForm>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    level: 'BEGINNER',
    isPublished: false,
    thumbnailUrl: '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm({
      ...form,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await coursesApi.create(form);
      const courseId = response.data.id || response.data.data?.id;
      router.push(`/courses/${courseId}`);
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Create New Course</h1>
          <p className="text-gray-600 mt-1">Add a new course to your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Title *</label>
                  <Input
                    type="text"
                    value={form.title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Introduction to Web3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Slug</label>
                  <Input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="introduction-to-web3"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL-friendly version of the title
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Short Description *</label>
                  <Input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="A brief description for course cards"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Full course description..."
                    className="w-full min-h-[150px] px-4 py-3 rounded-lg border-2 border-black focus:ring-2 focus:ring-brand focus:outline-none resize-y"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Thumbnail URL</label>
                  <Input
                    type="url"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Level *</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value as CourseForm['level'] })}
                    className="w-full h-11 px-4 rounded-lg border-2 border-black focus:ring-2 focus:ring-brand focus:outline-none bg-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-black accent-brand"
                    />
                    <span className="font-medium">Publish immediately</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Make this course visible to students
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Course
                    </>
                  )}
                </Button>

                <Link href="/courses" className="block mt-3">
                  <Button type="button" variant="ghost" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
