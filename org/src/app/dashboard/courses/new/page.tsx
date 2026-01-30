'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
  const router = useRouter();
  const { currentOrganization } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    level: 'BEGINNER',
    category: '',
    tags: '',
    thumbnail: '',
    price: 0,
    isFree: true,
    isPublished: false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        price: formData.isFree ? 0 : Number(formData.price),
      };

      const response = await orgCoursesApi.create(currentOrganization.id, payload);
      toast({
        title: 'Course created',
        description: 'Your course has been created successfully.',
        variant: 'success',
      });
      router.push(`/dashboard/courses/${response.data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Course</h1>
          <p className="text-zinc-400 mt-1">Fill in the details to create a new course.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-300">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="e.g., Introduction to Blockchain"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-zinc-300">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="text-zinc-300">
                Short Description
              </Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="A brief summary of the course"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">
                Full Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[150px]"
                placeholder="Detailed course description with learning objectives..."
              />
            </div>

            {/* Level & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-zinc-300">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="BEGINNER" className="text-white focus:bg-zinc-700 focus:text-white">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE" className="text-white focus:bg-zinc-700 focus:text-white">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED" className="text-white focus:bg-zinc-700 focus:text-white">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-zinc-300">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="e.g., Blockchain, Web Development"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-zinc-300">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Comma-separated tags, e.g., hedera, smart contracts, web3"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-zinc-300">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-[#D6FF25] focus:ring-[#D6FF25]"
                  />
                  <span className="text-zinc-300">Free Course</span>
                </label>
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-zinc-300">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700 text-white w-32"
                  />
                </div>
              )}
            </div>

            {/* Publish */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-[#D6FF25] focus:ring-[#D6FF25]"
                />
                <span className="text-zinc-300">Publish immediately</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Link href="/dashboard/courses">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
