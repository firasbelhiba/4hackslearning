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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Save,
  Video,
  FileText,
  BookOpen,
  Clock,
  Eye,
  Plus,
  Trash2,
  Download,
  File,
  Link as LinkIcon,
  Code,
  FileImage,
  Paperclip,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { VimeoUploader } from '@/components/vimeo-uploader';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  fileSize: number | null;
  order: number;
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
  module: {
    id: string;
    title: string;
    courseId: string;
    course: {
      id: string;
      title: string;
      organizationId: string | null;
    };
  };
}

const resourceTypeIcons: Record<string, React.ReactNode> = {
  PDF: <File className="h-4 w-4" />,
  LINK: <LinkIcon className="h-4 w-4" />,
  CODE: <Code className="h-4 w-4" />,
  FILE: <Paperclip className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  IMAGE: <FileImage className="h-4 w-4" />,
};

export default function LessonEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const { currentOrganization } = useAuthStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('VIDEO');
  const [status, setStatus] = useState('DRAFT');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [vimeoVideoId, setVimeoVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  // Resource modal state
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'FILE',
    url: '',
    isDownloadable: true,
  });

  useEffect(() => {
    fetchLesson();
  }, [courseId, lessonId, currentOrganization]);

  const fetchLesson = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const response = await orgCoursesApi.getLesson(currentOrganization.id, courseId, lessonId);
      const data = response.data;
      setLesson(data);

      // Populate form
      setTitle(data.title);
      setDescription(data.description || '');
      setContent(data.content || '');
      setType(data.type || 'VIDEO');
      setStatus(data.status || 'DRAFT');
      setIsFreePreview(data.isFreePreview || false);
      setVimeoVideoId(data.vimeoVideoId || '');
      setVideoUrl(data.videoUrl || '');
      setVideoDuration(data.videoDuration || 0);
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization || !lesson) return;

    try {
      setIsSaving(true);
      await orgCoursesApi.updateLesson(currentOrganization.id, courseId, lessonId, {
        title,
        description: description || null,
        content: content || null,
        type,
        status,
        isFreePreview,
        vimeoVideoId: vimeoVideoId || null,
        videoUrl: videoUrl || null,
        videoDuration: videoDuration || null,
      });

      toast({ title: 'Lesson saved', variant: 'success' });
      setHasChanges(false);
      fetchLesson();
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

  const handleAddResource = async () => {
    if (!currentOrganization || !lesson || !resourceForm.title || !resourceForm.url) return;

    try {
      await orgCoursesApi.createResource(
        currentOrganization.id,
        courseId,
        lessonId,
        resourceForm
      );

      toast({ title: 'Resource added', variant: 'success' });
      setResourceModalOpen(false);
      setResourceForm({ title: '', type: 'FILE', url: '', isDownloadable: true });
      fetchLesson();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add resource',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!currentOrganization) return;

    try {
      await orgCoursesApi.deleteResource(currentOrganization.id, courseId, resourceId);
      toast({ title: 'Resource deleted', variant: 'success' });
      fetchLesson();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getLessonTypeIcon = () => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      case 'ARTICLE':
        return <FileText className="h-5 w-5" />;
      case 'QUIZ':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Video className="h-5 w-5" />;
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
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-black mb-2">Lesson Not Found</h2>
          <p className="text-gray-600">The lesson you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/courses/${courseId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{lesson.module.course.title}</span>
              <span>/</span>
              <span>{lesson.module.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-black">{title || 'Untitled Lesson'}</h1>
              <Badge variant={status === 'PUBLISHED' ? 'success' : 'warning'}>
                {status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black flex items-center gap-2">
                {getLessonTypeIcon()}
                Lesson Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Enter lesson title"
                  className="text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Brief description of what this lesson covers..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lesson Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video Lesson</SelectItem>
                      <SelectItem value="ARTICLE">Article / Text</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value);
                      setHasChanges(true);
                    }}
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
              </div>
            </CardContent>
          </Card>

          {/* Content Card - Video or Article */}
          {type === 'VIDEO' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vimeoVideoId ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-black">
                      <iframe
                        src={`https://player.vimeo.com/video/${vimeoVideoId}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Lesson video"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Video className="h-4 w-4" />
                          Video ID: <code className="bg-gray-200 px-2 py-0.5 rounded">{vimeoVideoId}</code>
                        </div>
                        {videoDuration > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {formatDuration(videoDuration)}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setVimeoVideoId('');
                          setVideoUrl('');
                          setHasChanges(true);
                        }}
                      >
                        Remove Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <VimeoUploader
                    onUploadComplete={(videoData) => {
                      setVimeoVideoId(videoData.videoId);
                      setVideoUrl(videoData.embedUrl);
                      setHasChanges(true);
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
              </CardContent>
            </Card>
          )}

          {type === 'ARTICLE' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Write your article content here. You can use Markdown for formatting..."
                  rows={20}
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: You can use Markdown formatting for headings, lists, code blocks, and more.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Resources Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Resources & Downloads
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResourceModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Resource
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lesson.resources.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Paperclip className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">No resources attached to this lesson</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setResourceModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Resource
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {lesson.resources
                    .sort((a, b) => a.order - b.order)
                    .map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-black transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg border-2 border-black">
                            {resourceTypeIcons[resource.type] || <File className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-black">{resource.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{resource.type.toLowerCase()}</span>
                              {resource.isDownloadable && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Download className="h-3 w-3" />
                                    Downloadable
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteResource(resource.id)}
                            className="h-8 w-8 p-0 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Free Preview</Label>
                  <p className="text-xs text-gray-500">Allow non-enrolled users to preview</p>
                </div>
                <Switch
                  checked={isFreePreview}
                  onCheckedChange={(checked) => {
                    setIsFreePreview(checked);
                    setHasChanges(true);
                  }}
                />
              </div>

              {type === 'VIDEO' && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Video Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={videoDuration}
                    onChange={(e) => {
                      setVideoDuration(parseInt(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    placeholder="Auto-detected from video"
                  />
                  <p className="text-xs text-gray-500">
                    Duration is usually auto-detected after video processing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-black">Lesson Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order</span>
                <span className="font-medium text-black">Lesson {lesson.order + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-black capitalize">{type.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={status === 'PUBLISHED' ? 'success' : 'warning'} className="text-xs">
                  {status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resources</span>
                <span className="font-medium text-black">{lesson.resources.length}</span>
              </div>
              {videoDuration > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-black">{formatDuration(videoDuration)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Resource Modal */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Attach files, links, or other resources to this lesson.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g., Course Slides, Source Code, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={resourceForm.type}
                onValueChange={(value) => setResourceForm({ ...resourceForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILE">File</SelectItem>
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="LINK">External Link</SelectItem>
                  <SelectItem value="CODE">Source Code</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                value={resourceForm.url}
                onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Download</Label>
                <p className="text-xs text-gray-500">Students can download this resource</p>
              </div>
              <Switch
                checked={resourceForm.isDownloadable}
                onCheckedChange={(checked) =>
                  setResourceForm({ ...resourceForm, isDownloadable: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddResource}
              disabled={!resourceForm.title || !resourceForm.url}
            >
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
