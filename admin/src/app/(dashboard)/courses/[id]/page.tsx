'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoader } from '@/components/ui/loader';
import { api, coursesApi, modulesApi, lessonsApi } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  thumbnailUrl: string;
  modules: Module[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Module creation
  const [showNewModule, setShowNewModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [creatingModule, setCreatingModule] = useState(false);

  // Lesson creation
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'VIDEO' | 'TEXT' | 'QUIZ'>('TEXT');
  const [creatingLesson, setCreatingLesson] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        const data = res.data.data || res.data;
        setCourse(data);
        if (data.modules?.length > 0) {
          setExpandedModules(new Set([data.modules[0].id]));
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSave = async () => {
    if (!course) return;
    setError('');
    setSaving(true);

    try {
      await coursesApi.update(courseId, {
        title: course.title,
        slug: course.slug,
        description: course.description,
        shortDescription: course.shortDescription,
        level: course.level,
        isPublished: course.isPublished,
        thumbnailUrl: course.thumbnailUrl,
      });
    } catch (err: any) {
      console.error('Failed to update course:', err);
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(moduleId)) {
      newSet.delete(moduleId);
    } else {
      newSet.add(moduleId);
    }
    setExpandedModules(newSet);
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) return;
    setCreatingModule(true);

    try {
      const res = await modulesApi.create(courseId, {
        title: newModuleTitle,
        description: newModuleDesc,
        order: (course?.modules?.length || 0) + 1,
      });
      const newModule = res.data.data || res.data;
      setCourse({
        ...course!,
        modules: [...(course?.modules || []), { ...newModule, lessons: [] }],
      });
      setNewModuleTitle('');
      setNewModuleDesc('');
      setShowNewModule(false);
      setExpandedModules(new Set([...expandedModules, newModule.id]));
    } catch (err: any) {
      console.error('Failed to create module:', err);
      alert(err.response?.data?.message || 'Failed to create module');
    } finally {
      setCreatingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;

    try {
      await modulesApi.delete(moduleId);
      setCourse({
        ...course!,
        modules: course!.modules.filter((m) => m.id !== moduleId),
      });
    } catch (err: any) {
      console.error('Failed to delete module:', err);
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleCreateLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;
    setCreatingLesson(true);

    try {
      const module = course?.modules.find((m) => m.id === moduleId);
      const res = await lessonsApi.create(moduleId, {
        title: newLessonTitle,
        slug: newLessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: newLessonType,
        order: (module?.lessons?.length || 0) + 1,
        content: '',
      });
      const newLesson = res.data.data || res.data;
      setCourse({
        ...course!,
        modules: course!.modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), newLesson] } : m
        ),
      });
      setNewLessonTitle('');
      setNewLessonType('TEXT');
      setAddingLessonTo(null);
    } catch (err: any) {
      console.error('Failed to create lesson:', err);
      alert(err.response?.data?.message || 'Failed to create lesson');
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await lessonsApi.delete(lessonId);
      setCourse({
        ...course!,
        modules: course!.modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
        ),
      });
    } catch (err: any) {
      console.error('Failed to delete lesson:', err);
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <InlineLoader />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Course not found'}</p>
        <Link href="/courses" className="inline-block mt-4">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Course</h1>
            <p className="text-gray-600 mt-1">{course.title}</p>
          </div>
        </div>
        <Button variant="primary" className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Title</label>
                <Input
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Slug</label>
                <Input
                  type="text"
                  value={course.slug}
                  onChange={(e) => setCourse({ ...course, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Short Description</label>
                <Input
                  type="text"
                  value={course.shortDescription}
                  onChange={(e) => setCourse({ ...course, shortDescription: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  className="w-full min-h-[150px] px-4 py-3 rounded-lg border-2 border-black focus:ring-2 focus:ring-brand focus:outline-none resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Modules & Lessons */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Modules & Lessons</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowNewModule(true)}
              >
                <Plus className="h-4 w-4" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              {/* New Module Form */}
              {showNewModule && (
                <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Module title"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Module description (optional)"
                      value={newModuleDesc}
                      onChange={(e) => setNewModuleDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreateModule}
                        disabled={creatingModule || !newModuleTitle.trim()}
                      >
                        {creatingModule ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Create'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewModule(false);
                          setNewModuleTitle('');
                          setNewModuleDesc('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modules List */}
              {course.modules?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No modules yet. Add your first module to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {course.modules?.map((module, index) => (
                    <div
                      key={module.id}
                      className="border-2 border-black rounded-lg overflow-hidden"
                    >
                      {/* Module Header */}
                      <div
                        className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer"
                        onClick={() => toggleModule(module.id)}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="w-6 h-6 rounded bg-brand text-black text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        {expandedModules.has(module.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-bold flex-1">{module.title}</span>
                        <span className="text-sm text-gray-500">
                          {module.lessons?.length || 0} lessons
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Module Content */}
                      {expandedModules.has(module.id) && (
                        <div className="p-3 border-t-2 border-black">
                          {/* Lessons */}
                          {module.lessons?.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {module.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded"
                                >
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="flex-1">{lesson.title}</span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded border ${
                                      lesson.type === 'VIDEO'
                                        ? 'bg-blue-100 border-blue-300'
                                        : lesson.type === 'QUIZ'
                                        ? 'bg-purple-100 border-purple-300'
                                        : 'bg-gray-100 border-gray-300'
                                    }`}
                                  >
                                    {lesson.type}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-600"
                                    onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Lesson */}
                          {addingLessonTo === module.id ? (
                            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                              <Input
                                type="text"
                                placeholder="Lesson title"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                              />
                              <select
                                value={newLessonType}
                                onChange={(e) =>
                                  setNewLessonType(e.target.value as 'VIDEO' | 'TEXT' | 'QUIZ')
                                }
                                className="w-full h-10 px-3 rounded-lg border-2 border-black bg-white"
                              >
                                <option value="TEXT">Text</option>
                                <option value="VIDEO">Video</option>
                                <option value="QUIZ">Quiz</option>
                              </select>
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleCreateLesson(module.id)}
                                  disabled={creatingLesson || !newLessonTitle.trim()}
                                >
                                  {creatingLesson ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Add Lesson'
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setAddingLessonTo(null);
                                    setNewLessonTitle('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full gap-2 border-2 border-dashed border-gray-300"
                              onClick={() => setAddingLessonTo(module.id)}
                            >
                              <Plus className="h-4 w-4" />
                              Add Lesson
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                <label className="block text-sm font-bold mb-2">Level</label>
                <select
                  value={course.level}
                  onChange={(e) =>
                    setCourse({ ...course, level: e.target.value as Course['level'] })
                  }
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
                    checked={course.isPublished}
                    onChange={(e) => setCourse({ ...course, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-black accent-brand"
                  />
                  <span className="font-medium">Published</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-8">
                  Make this course visible to students
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Thumbnail URL</label>
                <Input
                  type="url"
                  value={course.thumbnailUrl || ''}
                  onChange={(e) => setCourse({ ...course, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <a
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/courses/${course.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  Preview Course
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
