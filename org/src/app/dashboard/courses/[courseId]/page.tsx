'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  GripVertical,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  Video,
} from 'lucide-react';
import { VimeoUploader } from '@/components/vimeo-uploader';

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  videoDuration: number | null;
  videoUrl: string | null;
  vimeoVideoId: string | null;
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
  level: string;
  isPublished: boolean;
  thumbnail: string | null;
  modules: Module[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { currentOrganization } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Module modal state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // Lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    videoDuration: 0,
    vimeoVideoId: '',
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'module' | 'lesson'>('module');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId, currentOrganization]);

  const fetchCourse = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await orgCoursesApi.getById(currentOrganization.id, courseId);
      setCourse(response.data);
      // Expand all modules by default
      if (response.data.modules) {
        setExpandedModules(new Set(response.data.modules.map((m: Module) => m.id)));
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Module handlers
  const handleOpenModuleModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({ title: module.title, description: module.description || '' });
    } else {
      setEditingModule(null);
      setModuleForm({ title: '', description: '' });
    }
    setModuleModalOpen(true);
  };

  const handleSaveModule = async () => {
    if (!currentOrganization || !course) return;

    try {
      if (editingModule) {
        await orgCoursesApi.updateModule(
          currentOrganization.id,
          course.id,
          editingModule.id,
          moduleForm
        );
        toast({ title: 'Module updated', variant: 'success' });
      } else {
        await orgCoursesApi.createModule(currentOrganization.id, course.id, moduleForm);
        toast({ title: 'Module created', variant: 'success' });
      }
      fetchCourse();
      setModuleModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save module',
        variant: 'destructive',
      });
    }
  };

  // Lesson handlers
  const handleOpenLessonModal = (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        content: '',
        videoUrl: lesson.videoUrl || '',
        videoDuration: lesson.videoDuration || 0,
        vimeoVideoId: lesson.vimeoVideoId || '',
      });
    } else {
      setEditingLesson(null);
      setLessonForm({ title: '', description: '', content: '', videoUrl: '', videoDuration: 0, vimeoVideoId: '' });
    }
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!currentOrganization || !course) return;

    try {
      if (editingLesson) {
        await orgCoursesApi.updateLesson(
          currentOrganization.id,
          course.id,
          editingLesson.id,
          lessonForm
        );
        toast({ title: 'Lesson updated', variant: 'success' });
      } else {
        await orgCoursesApi.createLesson(
          currentOrganization.id,
          course.id,
          selectedModuleId,
          lessonForm
        );
        toast({ title: 'Lesson created', variant: 'success' });
      }
      fetchCourse();
      setLessonModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save lesson',
        variant: 'destructive',
      });
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!currentOrganization || !course || !deleteTarget) return;

    try {
      if (deleteType === 'module') {
        await orgCoursesApi.deleteModule(currentOrganization.id, course.id, deleteTarget.id);
        toast({ title: 'Module deleted', variant: 'success' });
      } else {
        await orgCoursesApi.deleteLesson(currentOrganization.id, course.id, deleteTarget.id);
        toast({ title: 'Lesson deleted', variant: 'success' });
      }
      fetchCourse();
      setDeleteModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete',
        variant: 'destructive',
      });
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-zinc-800 rounded w-64 animate-pulse"></div>
        <div className="h-64 bg-zinc-800 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Course Not Found</h2>
          <p className="text-zinc-400">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <Badge variant={course.isPublished ? 'success' : 'warning'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-zinc-400 mt-1">{course.shortDescription}</p>
          </div>
        </div>
        <Link href={`/dashboard/courses/${courseId}/edit`}>
          <Button className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]">
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </Link>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800">
          <TabsTrigger value="curriculum" className="data-[state=active]:bg-zinc-800">
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="mt-6 space-y-4">
          {/* Add Module Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => handleOpenModuleModal()}
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Modules List */}
          {course.modules.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No modules yet</h3>
                <p className="text-zinc-400 text-center mb-4">
                  Start building your course by adding modules and lessons.
                </p>
                <Button
                  onClick={() => handleOpenModuleModal()}
                  className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Module
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {course.modules
                .sort((a, b) => a.order - b.order)
                .map((module, index) => (
                  <Card key={module.id} className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="flex items-center gap-3 text-left flex-1"
                        >
                          <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                          )}
                          <div>
                            <h3 className="font-medium text-white">
                              Module {index + 1}: {module.title}
                            </h3>
                            <p className="text-sm text-zinc-500">
                              {module.lessons.length} lessons
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenLessonModal(module.id)}
                            className="text-zinc-400 hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModuleModal(module)}
                            className="text-zinc-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeleteType('module');
                              setDeleteTarget({ id: module.id, title: module.title });
                              setDeleteModalOpen(true);
                            }}
                            className="text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedModules.has(module.id) && (
                      <CardContent className="pt-0 pb-3 px-4">
                        <div className="ml-11 space-y-2">
                          {module.lessons.length === 0 ? (
                            <p className="text-sm text-zinc-500 py-2">No lessons in this module</p>
                          ) : (
                            module.lessons
                              .sort((a, b) => a.order - b.order)
                              .map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 group"
                                >
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
                                    <Play className="h-4 w-4 text-[#D6FF25]" />
                                    <div>
                                      <h4 className="text-sm font-medium text-white">
                                        {lessonIndex + 1}. {lesson.title}
                                      </h4>
                                      {lesson.videoDuration && (
                                        <p className="text-xs text-zinc-500">
                                          {Math.floor(lesson.videoDuration / 60)}m{' '}
                                          {lesson.videoDuration % 60}s
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleOpenLessonModal(module.id, lesson)}
                                      className="text-zinc-400 hover:text-white h-7 w-7 p-0"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setDeleteType('lesson');
                                        setDeleteTarget({ id: lesson.id, title: lesson.title });
                                        setDeleteModalOpen(true);
                                      }}
                                      className="text-zinc-400 hover:text-red-400 h-7 w-7 p-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Course Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-zinc-400 text-sm">Level:</span>
                  <span className="text-white ml-2">{course.level}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm">Slug:</span>
                  <span className="text-white ml-2">{course.slug}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Modal */}
      <Dialog open={moduleModalOpen} onOpenChange={setModuleModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingModule ? 'Edit Module' : 'Add Module'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Title</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Module title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Description</label>
              <Input
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
            >
              {editingModule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Title</label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Lesson title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Description</label>
              <Input
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Brief description"
              />
            </div>

            {/* Vimeo Video Upload Section */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-300 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Lesson Video
              </label>

              {lessonForm.vimeoVideoId ? (
                <div className="space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
                    <iframe
                      src={`https://player.vimeo.com/video/${lessonForm.vimeoVideoId}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Lesson video preview"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">
                      Video ID: {lessonForm.vimeoVideoId}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setLessonForm({ ...lessonForm, vimeoVideoId: '', videoUrl: '' })}
                      className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      Remove Video
                    </Button>
                  </div>
                </div>
              ) : (
                <VimeoUploader
                  onUploadComplete={(videoData) => {
                    setLessonForm({
                      ...lessonForm,
                      vimeoVideoId: videoData.videoId,
                      videoUrl: videoData.embedUrl,
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: 'Upload Error',
                      description: error,
                      variant: 'destructive',
                    });
                  }}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Video Duration (seconds)</label>
              <Input
                type="number"
                value={lessonForm.videoDuration}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, videoDuration: Number(e.target.value) })
                }
                className="bg-zinc-800 border-zinc-700 text-white w-32"
              />
              <p className="text-xs text-zinc-500">
                Duration will be auto-detected after video processes
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              className="bg-[#D6FF25] text-black hover:bg-[#c2eb1f]"
            >
              {editingLesson ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete {deleteType}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-white"
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
