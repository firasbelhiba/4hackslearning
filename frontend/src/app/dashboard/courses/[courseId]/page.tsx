'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  FileText,
  Award,
  Lock,
  ArrowLeft,
  Menu,
  X,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/video/video-player';
import { enrollmentsApi, quizzesApi, coursesApi } from '@/lib/api';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  vimeoVideoId?: string;
  videoDuration?: number;
  order: number;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
  status: 'DRAFT' | 'PUBLISHED';
  isFreePreview: boolean;
  resources?: Resource[];
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT';
  options: QuizOption[];
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  questions: QuizQuestion[];
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  quiz?: {
    id: string;
    title: string;
    passingScore: number;
    timeLimit?: number;
  };
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  modules: Module[];
}

interface Enrollment {
  id: string;
  progress: number;
  course: Course;
  lessonProgress: {
    lessonId: string;
    completed: boolean;
    watchedSeconds: number;
  }[];
}

interface QuizAttempt {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: any[];
  completedAt: string;
}

// Content types for sidebar selection
type ContentItem =
  | { type: 'lesson'; data: Lesson }
  | { type: 'quiz'; data: { id: string; title: string; moduleId: string; moduleTitle: string } };

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [course, setCourse] = useState<Course | null>(null); // For non-enrolled users
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [bestAttempt, setBestAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // First try to get enrollment
        const response = await enrollmentsApi.getEnrollment(courseId);
        const enrollmentData = response.data;
        setEnrollment(enrollmentData);
        setCourse(enrollmentData.course);
        setIsEnrolled(true);

        // Expand first module and select first lesson
        if (enrollmentData.course.modules.length > 0) {
          setExpandedModules([enrollmentData.course.modules[0].id]);
          if (enrollmentData.course.modules[0].lessons.length > 0) {
            setSelectedContent({
              type: 'lesson',
              data: enrollmentData.course.modules[0].lessons[0]
            });
          }
        }
      } catch (error: any) {
        // Not enrolled - try to fetch course directly for free preview
        console.log('Not enrolled, fetching course for free preview...');
        try {
          const courseResponse = await coursesApi.getById(courseId);
          const courseData = courseResponse.data;
          setCourse(courseData);
          setIsEnrolled(false);

          // Expand first module and select first free preview lesson
          if (courseData.modules.length > 0) {
            setExpandedModules([courseData.modules[0].id]);
            // Find first free preview lesson
            for (const module of courseData.modules) {
              const freeLesson = module.lessons.find((l: Lesson) => l.isFreePreview);
              if (freeLesson) {
                setSelectedContent({ type: 'lesson', data: freeLesson });
                break;
              }
            }
          }
        } catch (courseError) {
          console.error('Failed to fetch course:', courseError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Fetch quiz data when a quiz is selected
  useEffect(() => {
    if (selectedContent?.type === 'quiz') {
      fetchQuizData(selectedContent.data.id);
    } else {
      setQuizData(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizResult(null);
    }
  }, [selectedContent]);

  const fetchQuizData = async (quizId: string) => {
    setQuizLoading(true);
    try {
      const [quizResponse, bestAttemptResponse] = await Promise.all([
        quizzesApi.getQuiz(quizId),
        quizzesApi.getBestAttempt(quizId).catch(() => ({ data: null })),
      ]);
      setQuizData(quizResponse.data);
      setBestAttempt(bestAttemptResponse.data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.lessonProgress.some(
      (p) => p.lessonId === lessonId && p.completed
    );
  };

  const getLessonProgress = (lessonId: string) => {
    return enrollment?.lessonProgress.find((p) => p.lessonId === lessonId);
  };

  const handleProgressUpdate = async (watchedSeconds: number, duration: number) => {
    if (!isEnrolled || !enrollment || selectedContent?.type !== 'lesson') return;

    try {
      await enrollmentsApi.updateProgress(enrollment.id, selectedContent.data.id, {
        watchedSeconds: Math.floor(watchedSeconds),
        completed: duration > 0 && watchedSeconds / duration >= 0.9,
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleLessonComplete = async () => {
    if (!isEnrolled || !enrollment || selectedContent?.type !== 'lesson') return;

    setEnrollment((prev) => {
      if (!prev) return prev;
      const lessonId = selectedContent.data.id;
      const existingProgress = prev.lessonProgress.find(
        (p) => p.lessonId === lessonId
      );
      if (existingProgress) {
        return {
          ...prev,
          lessonProgress: prev.lessonProgress.map((p) =>
            p.lessonId === lessonId ? { ...p, completed: true } : p
          ),
        };
      }
      return {
        ...prev,
        lessonProgress: [
          ...prev.lessonProgress,
          { lessonId, completed: true, watchedSeconds: selectedContent.data.videoDuration || 0 },
        ],
      };
    });
  };

  const handleQuizAnswerChange = (questionId: string, value: string | string[]) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleQuizSubmit = async () => {
    if (!quizData || !selectedContent || selectedContent.type !== 'quiz') return;

    try {
      const formattedAnswers = Object.entries(quizAnswers).map(([questionId, selectedOptions]) => ({
        questionId,
        selectedOptionIds: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions],
      }));

      const response = await quizzesApi.submitQuiz(quizData.id, formattedAnswers);
      setQuizResult(response.data);
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const navigateToNext = () => {
    if (!course || !selectedContent) return;

    // Build flat list of all accessible content items
    const allContent: ContentItem[] = [];
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (canAccessLesson(lesson)) {
          allContent.push({ type: 'lesson', data: lesson });
        }
      });
      if (module.quiz && isEnrolled) {
        allContent.push({
          type: 'quiz',
          data: {
            id: module.quiz.id,
            title: module.quiz.title,
            moduleId: module.id,
            moduleTitle: module.title
          }
        });
      }
    });

    const currentIndex = allContent.findIndex((item) => {
      if (selectedContent.type === 'lesson' && item.type === 'lesson') {
        return item.data.id === selectedContent.data.id;
      }
      if (selectedContent.type === 'quiz' && item.type === 'quiz') {
        return item.data.id === selectedContent.data.id;
      }
      return false;
    });

    if (currentIndex < allContent.length - 1) {
      setSelectedContent(allContent[currentIndex + 1]);
    }
  };

  const navigateToPrevious = () => {
    if (!course || !selectedContent) return;

    const allContent: ContentItem[] = [];
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        if (canAccessLesson(lesson)) {
          allContent.push({ type: 'lesson', data: lesson });
        }
      });
      if (module.quiz && isEnrolled) {
        allContent.push({
          type: 'quiz',
          data: {
            id: module.quiz.id,
            title: module.quiz.title,
            moduleId: module.id,
            moduleTitle: module.title
          }
        });
      }
    });

    const currentIndex = allContent.findIndex((item) => {
      if (selectedContent.type === 'lesson' && item.type === 'lesson') {
        return item.data.id === selectedContent.data.id;
      }
      if (selectedContent.type === 'quiz' && item.type === 'quiz') {
        return item.data.id === selectedContent.data.id;
      }
      return false;
    });

    if (currentIndex > 0) {
      setSelectedContent(allContent[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Course not found</h2>
            <p className="text-gray-600 mb-4">This course may not exist or is unavailable.</p>
            <Link href="/courses">
              <Button variant="primary">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper to check if a lesson is accessible
  const canAccessLesson = (lesson: Lesson) => {
    return isEnrolled || lesson.isFreePreview;
  };

  const selectedLesson = selectedContent?.type === 'lesson' ? selectedContent.data : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <h1 className="font-bold text-lg truncate max-w-[200px] sm:max-w-none">
              {course.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isEnrolled && enrollment && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden border border-black">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(enrollment.progress)}%</span>
              </div>
            )}
            {!isEnrolled && (
              <Badge variant="secondary" className="hidden sm:flex">
                Free Preview
              </Badge>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Course Content */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r-2 border-black transform transition-transform lg:transform-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } pt-16 lg:pt-0 overflow-y-auto h-[calc(100vh-64px)]`}
        >
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4">Course Content</h2>

            <div className="space-y-2">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border-2 border-black rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand text-black text-sm font-bold flex items-center justify-center border border-black">
                        {moduleIndex + 1}
                      </span>
                      <span className="font-medium text-left">{module.title}</span>
                    </div>
                    {expandedModules.includes(module.id) ? (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    )}
                  </button>

                  {expandedModules.includes(module.id) && (
                    <div className="border-t-2 border-black">
                      {module.lessons.map((lesson) => {
                        const isCompleted = isLessonCompleted(lesson.id);
                        const isSelected = selectedContent?.type === 'lesson' && selectedContent.data.id === lesson.id;
                        const isAccessible = canAccessLesson(lesson);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (isAccessible) {
                                setSelectedContent({ type: 'lesson', data: lesson });
                                if (window.innerWidth < 1024) {
                                  setIsSidebarOpen(false);
                                }
                              }
                            }}
                            disabled={!isAccessible}
                            className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                              isSelected ? 'bg-brand/20 border-l-4 border-brand' : ''
                            } ${isAccessible ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                          >
                            <div className="flex-shrink-0">
                              {!isAccessible ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                              ) : isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : lesson.type === 'VIDEO' ? (
                                <Play className="w-5 h-5 text-gray-400" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm truncate ${isSelected ? 'font-bold' : ''}`}>
                                  {lesson.title}
                                </p>
                                {lesson.isFreePreview && !isEnrolled && (
                                  <Badge variant="secondary" className="text-xs py-0 px-1">Free</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {formatDuration(lesson.videoDuration)}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      {/* Module Quiz - Only for enrolled users */}
                      {module.quiz && isEnrolled && (
                        <button
                          onClick={() => {
                            setSelectedContent({
                              type: 'quiz',
                              data: {
                                id: module.quiz!.id,
                                title: module.quiz!.title,
                                moduleId: module.id,
                                moduleTitle: module.title
                              }
                            });
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`w-full p-3 flex items-center gap-3 text-left hover:bg-purple-100 transition-colors bg-purple-50 ${
                            selectedContent?.type === 'quiz' && selectedContent.data.id === module.quiz.id
                              ? 'border-l-4 border-purple-600'
                              : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <HelpCircle className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate text-purple-700 ${
                              selectedContent?.type === 'quiz' && selectedContent.data.id === module.quiz.id
                                ? 'font-bold'
                                : ''
                            }`}>
                              {module.quiz.title}
                            </p>
                            <p className="text-xs text-purple-500">
                              Quiz • Pass: {module.quiz.passingScore}%
                            </p>
                          </div>
                        </button>
                      )}
                      {/* Locked quiz indicator for non-enrolled users */}
                      {module.quiz && !isEnrolled && (
                        <div className="w-full p-3 flex items-center gap-3 text-left bg-gray-100 opacity-50 cursor-not-allowed">
                          <div className="flex-shrink-0">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate text-gray-500">
                              {module.quiz.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              Quiz • Enroll to access
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Enrollment CTA for non-enrolled users */}
            {!isEnrolled && (
              <div className="mt-6 p-4 bg-brand/20 border-2 border-black rounded-lg">
                <h3 className="font-bold mb-2">Unlock Full Course</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Enroll to access all lessons, quizzes, and earn your certificate.
                </p>
                <Link href={`/courses/${course.slug}`}>
                  <Button variant="primary" className="w-full">
                    <Award className="w-4 h-4 mr-2" />
                    Enroll Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {selectedContent?.type === 'lesson' && selectedLesson ? (
            <div className="max-w-5xl mx-auto p-4 lg:p-6">
              {/* Free Preview Banner */}
              {!isEnrolled && (
                <Card className="mb-6 bg-gradient-to-r from-brand/30 to-brand/10 border-brand">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">Enjoying this free preview?</h3>
                        <p className="text-sm text-gray-600">
                          Enroll now to unlock all lessons, take quizzes, and earn your certificate!
                        </p>
                      </div>
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="primary" className="whitespace-nowrap">
                          <Award className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Video Player */}
              <div className="mb-6">
                <VideoPlayer
                  videoUrl={selectedLesson.videoUrl}
                  vimeoVideoId={selectedLesson.vimeoVideoId}
                  title={selectedLesson.title}
                  onProgress={handleProgressUpdate}
                  onComplete={handleLessonComplete}
                  initialProgress={getLessonProgress(selectedLesson.id)?.watchedSeconds || 0}
                />
              </div>

              {/* Lesson Info */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                    {selectedLesson.description && (
                      <p className="text-gray-600">{selectedLesson.description}</p>
                    )}
                  </div>
                  {isEnrolled && isLessonCompleted(selectedLesson.id) && (
                    <Badge variant="beginner" className="flex-shrink-0">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {!isEnrolled && selectedLesson.isFreePreview && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      Free Preview
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(selectedLesson.videoDuration)}
                  </span>
                  <span className="flex items-center gap-1">
                    {selectedLesson.type === 'VIDEO' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Video Lesson
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Article
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Lesson Content */}
              {selectedLesson.content && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedLesson.content
                            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
                            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
                            .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
                            .replace(/^\d\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n\n/g, '</p><p class="mb-4">')
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                <Button variant="outline" onClick={navigateToPrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button variant="primary" onClick={navigateToNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : selectedContent?.type === 'quiz' ? (
            <div className="max-w-3xl mx-auto p-4 lg:p-6">
              {quizLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
                </div>
              ) : quizData ? (
                <div>
                  {/* Quiz Header */}
                  <div className="mb-6">
                    <Badge variant="secondary" className="mb-2">
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Quiz
                    </Badge>
                    <h2 className="text-2xl font-bold mb-2">{quizData.title}</h2>
                    {quizData.description && (
                      <p className="text-gray-600 mb-4">{quizData.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Pass: {quizData.passingScore}%</span>
                      <span>{quizData.questions.length} questions</span>
                      {quizData.timeLimit && <span>Time: {quizData.timeLimit} min</span>}
                    </div>
                  </div>

                  {/* Best Attempt Banner */}
                  {bestAttempt && !quizSubmitted && (
                    <Card className={`mb-6 ${bestAttempt.passed ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {bestAttempt.passed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-yellow-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {bestAttempt.passed ? 'You passed this quiz!' : 'Previous attempt'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Best score: {bestAttempt.percentage}% ({bestAttempt.score}/{bestAttempt.totalPoints} points)
                              </p>
                            </div>
                          </div>
                          {!bestAttempt.passed && (
                            <Button variant="outline" size="sm" onClick={() => setBestAttempt(null)}>
                              Try Again
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quiz Result */}
                  {quizSubmitted && quizResult && (
                    <Card className={`mb-6 ${quizResult.passed ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <CardContent className="p-6">
                        <div className="text-center">
                          {quizResult.passed ? (
                            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          ) : (
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                          )}
                          <h3 className="text-2xl font-bold mb-2">
                            {quizResult.passed ? 'Congratulations!' : 'Keep Trying!'}
                          </h3>
                          <p className="text-lg mb-4">
                            You scored <span className="font-bold">{quizResult.percentage}%</span>
                          </p>
                          <p className="text-gray-600 mb-4">
                            {quizResult.score} out of {quizResult.totalPoints} points
                          </p>
                          <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={handleRetakeQuiz}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Retake Quiz
                            </Button>
                            <Button variant="primary" onClick={navigateToNext}>
                              Continue
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quiz Questions */}
                  {!quizSubmitted && (!bestAttempt || !bestAttempt.passed) && (
                    <div className="space-y-6">
                      {quizData.questions.map((question, qIndex) => (
                        <Card key={question.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                              <span className="w-8 h-8 rounded-full bg-brand text-black font-bold flex items-center justify-center border-2 border-black flex-shrink-0">
                                {qIndex + 1}
                              </span>
                              <div>
                                <p className="font-medium">{question.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{question.points} point{question.points > 1 ? 's' : ''}</p>
                              </div>
                            </div>

                            <div className="space-y-2 ml-11">
                              {question.options.map((option) => {
                                const isSelected = question.type === 'MULTIPLE_SELECT'
                                  ? (quizAnswers[question.id] as string[] || []).includes(option.id)
                                  : quizAnswers[question.id] === option.id;

                                return (
                                  <label
                                    key={option.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-brand bg-brand/10'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <input
                                      type={question.type === 'MULTIPLE_SELECT' ? 'checkbox' : 'radio'}
                                      name={`question-${question.id}`}
                                      value={option.id}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (question.type === 'MULTIPLE_SELECT') {
                                          const current = (quizAnswers[question.id] as string[]) || [];
                                          if (e.target.checked) {
                                            handleQuizAnswerChange(question.id, [...current, option.id]);
                                          } else {
                                            handleQuizAnswerChange(question.id, current.filter(id => id !== option.id));
                                          }
                                        } else {
                                          handleQuizAnswerChange(question.id, option.id);
                                        }
                                      }}
                                      className="w-4 h-4 text-brand"
                                    />
                                    <span>{option.text}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={navigateToPrevious}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        <Button
                          variant="primary"
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < quizData.questions.length}
                        >
                          Submit Quiz
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500">Failed to load quiz</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
              <p className="text-gray-500">Select a lesson or quiz to start learning</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
