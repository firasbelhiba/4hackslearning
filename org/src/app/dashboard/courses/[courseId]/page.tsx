'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Clock,
  Users,
  BookOpen,
  Settings,
  Eye,
  Folder,
  File,
  X,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { VimeoUploader } from '@/components/vimeo-uploader';
import { quizzesApi } from '@/lib/api';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  fileSize: number | null;
  isDownloadable: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order: number;
  type: string;
  status: string;
  isFreePreview: boolean;
  videoDuration: number | null;
  videoUrl: string | null;
  vimeoVideoId: string | null;
  resources: Resource[];
}

interface ModuleQuiz {
  id: string;
  title: string;
  passingScore: number;
  timeLimit: number | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  outcomes: string[];
  lessons: Lesson[];
  quiz?: ModuleQuiz | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  level: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  isFree: boolean;
  price: number;
  thumbnail: string | null;
  promoVideoUrl: string | null;
  requirements: string[];
  targetAudience: string[];
  outcomes: string[];
  language: string;
  totalDuration: number | null;
  modules: Module[];
  _count?: {
    enrollments: number;
    modules: number;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { currentOrganization } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Drag state
  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<{ lessonId: string; moduleId: string } | null>(null);
  const [dragOverModule, setDragOverModule] = useState<string | null>(null);
  const [dragOverLesson, setDragOverLesson] = useState<string | null>(null);

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
    type: 'VIDEO',
    status: 'DRAFT',
    isFreePreview: false,
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'module' | 'lesson'>('module');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; moduleId?: string } | null>(null);

  // Quick edit state
  const [editingModuleTitle, setEditingModuleTitle] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');


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

  // Calculate totals
  const getTotalLessons = () => {
    if (!course) return 0;
    return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  };

  const getTotalDuration = () => {
    if (!course) return 0;
    let total = 0;
    course.modules.forEach((m) => {
      m.lessons.forEach((l) => {
        if (l.videoDuration) total += l.videoDuration;
      });
    });
    return total;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
      setIsSaving(true);
      if (editingModule) {
        await orgCoursesApi.updateModule(
          currentOrganization.id,
          course.id,
          editingModule.id,
          moduleForm
        );
        toast({ title: 'Section updated', variant: 'success' });
      } else {
        await orgCoursesApi.createModule(currentOrganization.id, course.id, moduleForm);
        toast({ title: 'Section created', variant: 'success' });
      }
      fetchCourse();
      setModuleModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save section',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        videoDuration: lesson.videoDuration || 0,
        vimeoVideoId: lesson.vimeoVideoId || '',
        type: lesson.type || 'VIDEO',
        status: lesson.status || 'DRAFT',
        isFreePreview: lesson.isFreePreview || false,
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        videoDuration: 0,
        vimeoVideoId: '',
        type: 'VIDEO',
        status: 'DRAFT',
        isFreePreview: false,
      });
    }
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!currentOrganization || !course) return;

    try {
      setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!currentOrganization || !course || !deleteTarget) return;

    try {
      setIsSaving(true);
      if (deleteType === 'module') {
        await orgCoursesApi.deleteModule(currentOrganization.id, course.id, deleteTarget.id);
        toast({ title: 'Section deleted', variant: 'success' });
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
    } finally {
      setIsSaving(false);
    }
  };

  // Quick title edit handlers
  const handleStartEditModuleTitle = (module: Module) => {
    setEditingModuleTitle(module.id);
    setTempTitle(module.title);
  };

  const handleSaveModuleTitle = async (moduleId: string) => {
    if (!currentOrganization || !course || !tempTitle.trim()) return;

    try {
      await orgCoursesApi.updateModule(currentOrganization.id, course.id, moduleId, { title: tempTitle });
      fetchCourse();
      setEditingModuleTitle(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update title',
        variant: 'destructive',
      });
    }
  };

  const handleStartEditLessonTitle = (lesson: Lesson) => {
    setEditingLessonTitle(lesson.id);
    setTempTitle(lesson.title);
  };

  const handleSaveLessonTitle = async (lessonId: string) => {
    if (!currentOrganization || !course || !tempTitle.trim()) return;

    try {
      await orgCoursesApi.updateLesson(currentOrganization.id, course.id, lessonId, { title: tempTitle });
      fetchCourse();
      setEditingLessonTitle(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update title',
        variant: 'destructive',
      });
    }
  };

  // Drag and drop handlers for modules
  const handleModuleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModule(moduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleModuleDragOver = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault();
    if (draggedModule && draggedModule !== moduleId) {
      setDragOverModule(moduleId);
    }
  };

  const handleModuleDragLeave = () => {
    setDragOverModule(null);
  };

  const handleModuleDrop = async (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault();
    if (!draggedModule || !course || !currentOrganization || draggedModule === targetModuleId) {
      setDraggedModule(null);
      setDragOverModule(null);
      return;
    }

    const sortedModules = [...course.modules].sort((a, b) => a.order - b.order);
    const draggedIndex = sortedModules.findIndex((m) => m.id === draggedModule);
    const targetIndex = sortedModules.findIndex((m) => m.id === targetModuleId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder modules
    const [removed] = sortedModules.splice(draggedIndex, 1);
    sortedModules.splice(targetIndex, 0, removed);

    // Create new order array
    const newOrder = sortedModules.map((m, i) => ({ id: m.id, order: i }));

    try {
      await orgCoursesApi.reorderModules(currentOrganization.id, course.id, newOrder);
      fetchCourse();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder sections',
        variant: 'destructive',
      });
    }

    setDraggedModule(null);
    setDragOverModule(null);
  };

  // Drag and drop handlers for lessons
  const handleLessonDragStart = (e: React.DragEvent, lessonId: string, moduleId: string) => {
    setDraggedLesson({ lessonId, moduleId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLessonDragOver = (e: React.DragEvent, lessonId: string) => {
    e.preventDefault();
    if (draggedLesson && draggedLesson.lessonId !== lessonId) {
      setDragOverLesson(lessonId);
    }
  };

  const handleLessonDragLeave = () => {
    setDragOverLesson(null);
  };

  const handleLessonDrop = async (e: React.DragEvent, targetLessonId: string, targetModuleId: string) => {
    e.preventDefault();
    if (!draggedLesson || !course || !currentOrganization || draggedLesson.lessonId === targetLessonId) {
      setDraggedLesson(null);
      setDragOverLesson(null);
      return;
    }

    // Get all lessons from target module
    const targetModule = course.modules.find((m) => m.id === targetModuleId);
    if (!targetModule) return;

    const sortedLessons = [...targetModule.lessons].sort((a, b) => a.order - b.order);

    // If moving within the same module
    if (draggedLesson.moduleId === targetModuleId) {
      const draggedIndex = sortedLessons.findIndex((l) => l.id === draggedLesson.lessonId);
      const targetIndex = sortedLessons.findIndex((l) => l.id === targetLessonId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const [removed] = sortedLessons.splice(draggedIndex, 1);
      sortedLessons.splice(targetIndex, 0, removed);
    } else {
      // Moving to different module
      const sourceModule = course.modules.find((m) => m.id === draggedLesson.moduleId);
      if (!sourceModule) return;

      const draggedLessonData = sourceModule.lessons.find((l) => l.id === draggedLesson.lessonId);
      if (!draggedLessonData) return;

      const targetIndex = sortedLessons.findIndex((l) => l.id === targetLessonId);
      sortedLessons.splice(targetIndex, 0, draggedLessonData as Lesson);
    }

    // Create reorder payload
    const lessonsToUpdate = sortedLessons.map((l, i) => ({
      id: l.id,
      order: i,
      moduleId: draggedLesson.moduleId !== targetModuleId && l.id === draggedLesson.lessonId ? targetModuleId : undefined,
    }));

    try {
      await orgCoursesApi.reorderLessons(currentOrganization.id, course.id, lessonsToUpdate);
      fetchCourse();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder lessons',
        variant: 'destructive',
      });
    }

    setDraggedLesson(null);
    setDragOverLesson(null);
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-3.5 w-3.5" />;
      case 'ARTICLE':
        return <FileText className="h-3.5 w-3.5" />;
      case 'QUIZ':
        return <BookOpen className="h-3.5 w-3.5" />;
      default:
        return <Play className="h-3.5 w-3.5" />;
    }
  };

  // Handle quiz delete
  const handleDeleteQuiz = async (quizId: string, moduleName: string) => {
    if (!confirm(`Are you sure you want to delete the quiz for "${moduleName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await quizzesApi.delete(quizId);
      toast({ title: 'Quiz deleted', variant: 'success' });
      fetchCourse();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete quiz',
        variant: 'destructive',
      });
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-black">{course.title}</h1>
              <Badge variant={course.isPublished ? 'success' : 'warning'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mt-1">{course.shortDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/courses/${courseId}/analytics`}>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href={`/dashboard/courses/${courseId}/edit`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button variant="primary">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/20 border-2 border-black flex items-center justify-center">
              <Folder className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{course.modules.length}</p>
              <p className="text-xs text-gray-600">Sections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 border-2 border-black flex items-center justify-center">
              <File className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{getTotalLessons()}</p>
              <p className="text-xs text-gray-600">Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 border-2 border-black flex items-center justify-center">
              <Clock className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{formatDuration(getTotalDuration())}</p>
              <p className="text-xs text-gray-600">Total Duration</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 border-2 border-black flex items-center justify-center">
              <Users className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{course._count?.enrollments || 0}</p>
              <p className="text-xs text-gray-600">Students</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Builder */}
      <Card>
        <CardHeader className="py-4 px-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-black flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Curriculum
            </CardTitle>
            <Button onClick={() => handleOpenModuleModal()} variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {course.modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
                <Folder className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No sections yet</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                Start building your course by adding sections. Each section can contain multiple lessons.
              </p>
              <Button onClick={() => handleOpenModuleModal()} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {course.modules
                .sort((a, b) => a.order - b.order)
                .map((module, index) => (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={(e) => handleModuleDragStart(e, module.id)}
                    onDragOver={(e) => handleModuleDragOver(e, module.id)}
                    onDragLeave={handleModuleDragLeave}
                    onDrop={(e) => handleModuleDrop(e, module.id)}
                    className={`transition-colors ${
                      dragOverModule === module.id ? 'bg-brand/20' : ''
                    } ${draggedModule === module.id ? 'opacity-50' : ''}`}
                  >
                    {/* Section Header */}
                    <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                          )}
                        </button>

                        {editingModuleTitle === module.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              className="h-8 text-sm font-bold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveModuleTitle(module.id);
                                if (e.key === 'Escape') setEditingModuleTitle(null);
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveModuleTitle(module.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingModuleTitle(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="flex-1 cursor-pointer"
                            onDoubleClick={() => handleStartEditModuleTitle(module)}
                          >
                            <h3 className="font-bold text-black">
                              Section {index + 1}: {module.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {module.lessons.length} lessons •{' '}
                              {formatDuration(
                                module.lessons.reduce((acc, l) => acc + (l.videoDuration || 0), 0)
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {module.quiz ? (
                          <div className="flex items-center gap-1 mr-2">
                            <Link href={`/dashboard/courses/${courseId}/modules/${module.id}/quiz`}>
                              <Badge
                                variant="secondary"
                                className="text-xs flex items-center gap-1 cursor-pointer hover:bg-purple-200 transition-colors"
                                title="Click to edit quiz"
                              >
                                <HelpCircle className="h-3 w-3" />
                                Quiz
                              </Badge>
                            </Link>
                            <Link href={`/dashboard/courses/${courseId}/modules/${module.id}/quiz`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Edit quiz"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteQuiz(module.quiz!.id, module.title)}
                              className="h-8 w-8 p-0 hover:text-red-500"
                              title="Delete quiz"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Link href={`/dashboard/courses/${courseId}/modules/${module.id}/quiz`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              title="Add quiz to this section"
                            >
                              <HelpCircle className="h-4 w-4 mr-1" />
                              Quiz
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenLessonModal(module.id)}
                          className="h-8 px-2"
                          title="Add lesson"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenModuleModal(module)}
                          className="h-8 w-8 p-0"
                          title="Edit section"
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
                          className="h-8 w-8 p-0 hover:text-red-500"
                          title="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {expandedModules.has(module.id) && (
                      <div className="px-6 py-2 space-y-1">
                        {module.lessons.length === 0 ? (
                          <div className="py-4 text-center">
                            <p className="text-sm text-gray-500 mb-2">No lessons in this section</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenLessonModal(module.id)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Lesson
                            </Button>
                          </div>
                        ) : (
                          module.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                draggable
                                onDragStart={(e) => handleLessonDragStart(e, lesson.id, module.id)}
                                onDragOver={(e) => handleLessonDragOver(e, lesson.id)}
                                onDragLeave={handleLessonDragLeave}
                                onDrop={(e) => handleLessonDrop(e, lesson.id, module.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 group transition-all ${
                                  dragOverLesson === lesson.id
                                    ? 'border-brand bg-brand/10'
                                    : 'border-gray-200 hover:border-black'
                                } ${draggedLesson?.lessonId === lesson.id ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <div className={`p-1.5 rounded-lg border-2 border-black ${
                                    lesson.status === 'PUBLISHED' ? 'bg-brand' : 'bg-gray-100'
                                  }`}>
                                    {getLessonTypeIcon(lesson.type)}
                                  </div>

                                  {editingLessonTitle === lesson.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <Input
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        className="h-7 text-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveLessonTitle(lesson.id);
                                          if (e.key === 'Escape') setEditingLessonTitle(null);
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSaveLessonTitle(lesson.id)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingLessonTitle(null)}
                                        className="h-7 w-7 p-0"
                                      >
                                        <X className="h-3.5 w-3.5 text-red-500" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div
                                      className="flex-1 cursor-pointer"
                                      onDoubleClick={() => handleStartEditLessonTitle(lesson)}
                                    >
                                      <h4 className="text-sm font-medium text-black flex items-center gap-2">
                                        {lessonIndex + 1}. {lesson.title}
                                        {lesson.isFreePreview && (
                                          <Badge variant="outline" className="text-xs py-0">Free Preview</Badge>
                                        )}
                                      </h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="capitalize">{lesson.type.toLowerCase()}</span>
                                        {lesson.videoDuration && (
                                          <>
                                            <span>•</span>
                                            <span>{formatDuration(lesson.videoDuration)}</span>
                                          </>
                                        )}
                                        <span>•</span>
                                        <span className={lesson.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'}>
                                          {lesson.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      title="Edit lesson"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setDeleteType('lesson');
                                      setDeleteTarget({ id: lesson.id, title: lesson.title, moduleId: module.id });
                                      setDeleteModalOpen(true);
                                    }}
                                    className="h-7 w-7 p-0 hover:text-red-500"
                                    title="Delete lesson"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}

                        {/* Add lesson button at bottom */}
                        {module.lessons.length > 0 && (
                          <button
                            onClick={() => handleOpenLessonModal(module.id)}
                            className="w-full py-2 text-sm text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-black transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Lesson
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Modal */}
      <Dialog open={moduleModalOpen} onOpenChange={setModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit Section' : 'Add Section'}</DialogTitle>
            <DialogDescription>
              Sections help organize your course content into logical groups.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Title *</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Getting Started, Introduction, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Description</label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="What will students learn in this section?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveModule}
              variant="primary"
              disabled={!moduleForm.title.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : editingModule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Title *</label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Lesson title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Type</label>
                <Select
                  value={lessonForm.type}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="ARTICLE">Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Description</label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief description of what this lesson covers"
                rows={2}
              />
            </div>

            {lessonForm.type === 'VIDEO' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-black flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Lesson Video
                </label>
                {lessonForm.vimeoVideoId ? (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-black">
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
                      <span className="text-sm text-gray-600">
                        Video ID: {lessonForm.vimeoVideoId}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setLessonForm({ ...lessonForm, vimeoVideoId: '', videoUrl: '' })
                        }
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
            )}

            {lessonForm.type === 'ARTICLE' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Content</label>
                <Textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Write your article content here..."
                  rows={8}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Status</label>
                <Select
                  value={lessonForm.status}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Free Preview</label>
                <Select
                  value={lessonForm.isFreePreview ? 'yes' : 'no'}
                  onValueChange={(value) =>
                    setLessonForm({ ...lessonForm, isFreePreview: value === 'yes' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes - Allow preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveLesson}
              variant="primary"
              disabled={!lessonForm.title.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : editingLesson ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete {deleteType === 'module' ? 'Section' : 'Lesson'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"?
              {deleteType === 'module' && ' This will also delete all lessons within this section.'}
              {' '}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
