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
import { ArrowLeft, Save, Plus, X, Target, Users, CheckCircle, Globe } from 'lucide-react';
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
    promoVideoUrl: '',
    price: 0,
    isFree: true,
    isPublished: false,
    language: 'English',
    requirements: [''],
    targetAudience: [''],
    outcomes: [''],
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

  // Array field handlers
  const addArrayItem = (field: 'requirements' | 'targetAudience' | 'outcomes') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const updateArrayItem = (field: 'requirements' | 'targetAudience' | 'outcomes', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeArrayItem = (field: 'requirements' | 'targetAudience' | 'outcomes', index: number) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated.length > 0 ? updated : [''] });
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
        requirements: formData.requirements.filter(Boolean),
        targetAudience: formData.targetAudience.filter(Boolean),
        outcomes: formData.outcomes.filter(Boolean),
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
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">No Organization Selected</h2>
          <p className="text-gray-600">Please select an organization from the sidebar.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-black">Create New Course</h1>
          <p className="text-gray-600 mt-1">Fill in the details to create a new course.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Introduction to Blockchain"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="A brief summary of the course (shown in cards)"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[150px]"
                placeholder="Detailed course description..."
              />
            </div>

            {/* Level, Category & Language */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Blockchain, Web Dev"
                />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated tags, e.g., hedera, smart contracts, web3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoVideoUrl">Promotional Video URL</Label>
                <Input
                  id="promoVideoUrl"
                  value={formData.promoVideoUrl}
                  onChange={(e) => setFormData({ ...formData, promoVideoUrl: e.target.value })}
                  placeholder="https://vimeo.com/... or YouTube URL"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Details Card (Udemy-style) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black flex items-center gap-2">
              <Target className="h-5 w-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learning Outcomes / What you'll learn */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                What students will learn
              </Label>
              <p className="text-sm text-gray-500">List the key learning outcomes for this course</p>
              {formData.outcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateArrayItem('outcomes', index, e.target.value)}
                    placeholder="e.g., Build and deploy smart contracts on Hedera"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('outcomes', index)}
                    disabled={formData.outcomes.length === 1 && !outcome}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('outcomes')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Outcome
              </Button>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Requirements / Prerequisites
              </Label>
              <p className="text-sm text-gray-500">What do students need to know before taking this course?</p>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                    placeholder="e.g., Basic understanding of JavaScript"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('requirements', index)}
                    disabled={formData.requirements.length === 1 && !req}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('requirements')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Requirement
              </Button>
            </div>

            {/* Target Audience */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Who is this course for?
              </Label>
              <p className="text-sm text-gray-500">Describe your ideal student</p>
              {formData.targetAudience.map((audience, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={audience}
                    onChange={(e) => updateArrayItem('targetAudience', index, e.target.value)}
                    placeholder="e.g., Web developers looking to learn blockchain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('targetAudience', index)}
                    disabled={formData.targetAudience.length === 1 && !audience}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('targetAudience')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Target Audience
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Publishing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-black">Pricing & Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg border-2 border-black bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="rounded border-2 border-black h-5 w-5 text-brand focus:ring-brand"
                  />
                  <span className="font-bold text-black">Free Course</span>
                </label>
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-32"
                  />
                </div>
              )}
            </div>

            {/* Publish */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg border-2 border-black bg-green-50 hover:bg-green-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-2 border-black h-5 w-5 text-green-500 focus:ring-green-500"
                />
                <span className="font-bold text-black">Publish immediately</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/courses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
