'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { orgCoursesApi, quizzesApi, Quiz, QuizQuestion, QuizOption } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Settings,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Shuffle,
  RotateCcw,
  Copy,
  Image,
  Code,
  Type,
  List,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  FileText,
  Layers,
  Zap,
  Edit,
  MoreVertical,
  Check,
} from 'lucide-react';

// Types
type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT';

interface QuestionFormData {
  id?: string;
  text: string;
  type: QuestionType;
  options: QuizOption[];
  explanation: string;
  points: number;
  order: number;
  hint?: string;
  imageUrl?: string;
  codeSnippet?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
}

interface QuizSettings {
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
  maxAttempts: number | null;
  showHints: boolean;
  showExplanations: boolean;
  questionNavigation: 'FREE' | 'LINEAR';
  autoSubmit: boolean;
}

const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultSettings: QuizSettings = {
  title: '',
  description: '',
  passingScore: 70,
  timeLimit: null,
  shuffleQuestions: false,
  shuffleOptions: false,
  showResults: true,
  showCorrectAnswers: true,
  allowRetakes: true,
  maxAttempts: null,
  showHints: true,
  showExplanations: true,
  questionNavigation: 'FREE',
  autoSubmit: false,
};

const trueFalseOptions: QuizOption[] = [
  { id: 'true', text: 'True', isCorrect: true },
  { id: 'false', text: 'False', isCorrect: false },
];

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const { currentOrganization } = useAuthStore();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [existingQuiz, setExistingQuiz] = useState<Quiz | null>(null);

  const [settings, setSettings] = useState<QuizSettings>({ ...defaultSettings });
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<number, string[]>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [previewCurrentQuestion, setPreviewCurrentQuestion] = useState(0);

  // Question modal state
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    text: '',
    type: 'MULTIPLE_CHOICE',
    options: [
      { id: generateOptionId(), text: '', isCorrect: true },
      { id: generateOptionId(), text: '', isCorrect: false },
      { id: generateOptionId(), text: '', isCorrect: false },
      { id: generateOptionId(), text: '', isCorrect: false },
    ],
    explanation: '',
    points: 1,
    order: 1,
    difficulty: 'MEDIUM',
  });

  // Helper to load quiz data
  const loadQuizData = (quiz: Quiz) => {
    setExistingQuiz(quiz);
    setSettings({
      ...defaultSettings,
      title: quiz.title,
      description: quiz.description || '',
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit || null,
    });
    if (quiz.questions) {
      setQuestions(
        quiz.questions.map((q: QuizQuestion, i: number) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          explanation: q.explanation || '',
          points: q.points,
          order: q.order || i + 1,
          difficulty: 'MEDIUM',
        }))
      );
    }
  };

  // Fetch course and module data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrganization) return;

      try {
        setIsLoading(true);
        const courseResponse = await orgCoursesApi.getById(currentOrganization.id, courseId);
        const course = courseResponse.data;
        setCourseName(course.title);

        const module = course.modules?.find((m: any) => m.id === moduleId);
        if (module) {
          setModuleName(module.title);
          setSettings((prev) => ({
            ...prev,
            title: prev.title || `${module.title} Quiz`,
          }));

          // Check if quiz exists from course data
          if (module.quiz?.id) {
            const quizResponse = await quizzesApi.getById(module.quiz.id);
            loadQuizData(quizResponse.data);
          } else {
            // Try fetching quiz by module ID as fallback
            try {
              const quizResponse = await quizzesApi.getByModuleId(moduleId);
              loadQuizData(quizResponse.data);
            } catch {
              // No quiz exists yet, that's fine
            }
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        const errorMessage = error.response?.status === 401
          ? 'Please log in to access this page'
          : error.response?.status === 404
          ? 'Course or module not found'
          : error.message || 'Failed to load data';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId, currentOrganization]);

  // Question handlers
  const handleAddQuestion = (type: QuestionType = 'MULTIPLE_CHOICE') => {
    setEditingQuestionIndex(null);

    const baseOptions =
      type === 'TRUE_FALSE'
        ? [...trueFalseOptions]
        : [
            { id: generateOptionId(), text: '', isCorrect: true },
            { id: generateOptionId(), text: '', isCorrect: false },
            { id: generateOptionId(), text: '', isCorrect: false },
            { id: generateOptionId(), text: '', isCorrect: false },
          ];

    setQuestionForm({
      text: '',
      type,
      options: baseOptions,
      explanation: '',
      points: 1,
      order: questions.length + 1,
      difficulty: 'MEDIUM',
    });
    setQuestionModalOpen(true);
  };

  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingQuestionIndex(index);
    setQuestionForm({ ...q });
    setQuestionModalOpen(true);
  };

  const handleDuplicateQuestion = (index: number) => {
    const q = questions[index];
    const newQuestion: QuestionFormData = {
      ...q,
      id: undefined,
      text: `${q.text} (Copy)`,
      order: questions.length + 1,
      options: q.options.map((o) => ({ ...o, id: generateOptionId() })),
    };
    setQuestions([...questions, newQuestion]);
    toast({ title: 'Question duplicated', variant: 'success' });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const updated = questions.filter((_, i) => i !== index);
    updated.forEach((q, i) => (q.order = i + 1));
    setQuestions(updated);
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((q, i) => (q.order = i + 1));
    setQuestions(updated);
  };

  const handleSaveQuestion = () => {
    if (!questionForm.text.trim()) {
      toast({ title: 'Error', description: 'Question text is required', variant: 'destructive' });
      return;
    }

    const validOptions = questionForm.options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      toast({ title: 'Error', description: 'At least 2 options are required', variant: 'destructive' });
      return;
    }

    const hasCorrect = validOptions.some((o) => o.isCorrect);
    if (!hasCorrect) {
      toast({ title: 'Error', description: 'At least one option must be marked as correct', variant: 'destructive' });
      return;
    }

    const newQuestion: QuestionFormData = {
      ...questionForm,
      options: validOptions,
      order: editingQuestionIndex !== null ? questions[editingQuestionIndex].order : questions.length + 1,
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex].id : undefined,
    };

    if (editingQuestionIndex !== null) {
      const updated = [...questions];
      updated[editingQuestionIndex] = newQuestion;
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setQuestionModalOpen(false);
    toast({ title: editingQuestionIndex !== null ? 'Question updated' : 'Question added', variant: 'success' });
  };

  // Option handlers
  const handleTypeChange = (type: QuestionType) => {
    if (type === 'TRUE_FALSE') {
      setQuestionForm({
        ...questionForm,
        type,
        options: [...trueFalseOptions],
      });
    } else if (questionForm.type === 'TRUE_FALSE') {
      setQuestionForm({
        ...questionForm,
        type,
        options: [
          { id: generateOptionId(), text: '', isCorrect: true },
          { id: generateOptionId(), text: '', isCorrect: false },
          { id: generateOptionId(), text: '', isCorrect: false },
          { id: generateOptionId(), text: '', isCorrect: false },
        ],
      });
    } else {
      setQuestionForm({ ...questionForm, type });
    }
  };

  const handleAddOption = () => {
    if (questionForm.options.length >= 8) {
      toast({ title: 'Error', description: 'Maximum 8 options allowed', variant: 'destructive' });
      return;
    }
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { id: generateOptionId(), text: '', isCorrect: false }],
    });
  };

  const handleRemoveOption = (optionId: string) => {
    if (questionForm.options.length <= 2) {
      toast({ title: 'Error', description: 'At least 2 options required', variant: 'destructive' });
      return;
    }
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.filter((o) => o.id !== optionId),
    });
  };

  const handleToggleCorrect = (optionId: string) => {
    if (questionForm.type === 'MULTIPLE_SELECT') {
      setQuestionForm({
        ...questionForm,
        options: questionForm.options.map((o) =>
          o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
        ),
      });
    } else {
      setQuestionForm({
        ...questionForm,
        options: questionForm.options.map((o) => ({
          ...o,
          isCorrect: o.id === optionId,
        })),
      });
    }
  };

  // Save quiz
  const handleSaveQuiz = async () => {
    if (!settings.title.trim()) {
      toast({ title: 'Error', description: 'Quiz title is required', variant: 'destructive' });
      return;
    }

    if (questions.length === 0) {
      toast({ title: 'Error', description: 'Add at least one question', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);

      const quizData = {
        title: settings.title,
        description: settings.description || undefined,
        passingScore: settings.passingScore,
        timeLimit: settings.timeLimit || undefined,
      };

      if (existingQuiz) {
        // Update existing quiz
        await quizzesApi.update(existingQuiz.id, quizData);

        // Update questions
        for (const q of questions) {
          const questionData = {
            text: q.text,
            type: q.type,
            options: q.options,
            explanation: q.explanation || undefined,
            points: q.points,
            order: q.order,
          };

          if (q.id) {
            await quizzesApi.updateQuestion(q.id, questionData);
          } else {
            await quizzesApi.addQuestion(existingQuiz.id, questionData);
          }
        }

        toast({ title: 'Quiz updated successfully', variant: 'success' });
      } else {
        // Create new quiz
        const response = await quizzesApi.create(moduleId, quizData);
        const newQuiz = response.data;

        // Add questions
        for (const q of questions) {
          await quizzesApi.addQuestion(newQuiz.id, {
            text: q.text,
            type: q.type,
            options: q.options,
            explanation: q.explanation || undefined,
            points: q.points,
            order: q.order,
          });
        }

        setExistingQuiz(newQuiz);
        toast({ title: 'Quiz created successfully', variant: 'success' });
      }
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save quiz';

      // If module already has a quiz, fetch it and switch to edit mode
      if (errorMessage.includes('already has a quiz')) {
        try {
          const quizResponse = await quizzesApi.getByModuleId(moduleId);
          loadQuizData(quizResponse.data);
          toast({
            title: 'Quiz loaded',
            description: 'A quiz already exists for this module. You can now edit it.',
            variant: 'success',
          });
          // Retry save as update
          return handleSaveQuiz();
        } catch {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Preview mode handlers
  const togglePreviewMode = () => {
    if (previewMode) {
      // Exit preview - reset state
      setPreviewAnswers({});
      setPreviewSubmitted(false);
      setPreviewCurrentQuestion(0);
    }
    setPreviewMode(!previewMode);
  };

  const handlePreviewAnswer = (questionIndex: number, optionId: string, isMultiSelect: boolean) => {
    setPreviewAnswers((prev) => {
      const current = prev[questionIndex] || [];
      if (isMultiSelect) {
        // Toggle for multi-select
        if (current.includes(optionId)) {
          return { ...prev, [questionIndex]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionIndex]: [...current, optionId] };
        }
      } else {
        // Replace for single select
        return { ...prev, [questionIndex]: [optionId] };
      }
    });
  };

  const calculatePreviewScore = () => {
    let earned = 0;
    let total = 0;

    questions.forEach((q, index) => {
      total += q.points;
      const selectedAnswers = previewAnswers[index] || [];
      const correctAnswers = q.options.filter((o) => o.isCorrect).map((o) => o.id);

      // Check if answers match exactly
      const isCorrect =
        selectedAnswers.length === correctAnswers.length &&
        selectedAnswers.every((a) => correctAnswers.includes(a));

      if (isCorrect) {
        earned += q.points;
      }
    });

    return { earned, total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
  };

  // Calculated values
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const questionsByDifficulty = {
    easy: questions.filter((q) => q.difficulty === 'EASY').length,
    medium: questions.filter((q) => q.difficulty === 'MEDIUM').length,
    hard: questions.filter((q) => q.difficulty === 'HARD').length,
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
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
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
              <span>{courseName}</span>
              <span>/</span>
              <span>{moduleName}</span>
            </div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              {existingQuiz ? 'Edit Quiz' : 'Create Quiz'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={previewMode ? 'primary' : 'outline'} onClick={togglePreviewMode}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          {!previewMode && (
            <Button variant="primary" onClick={handleSaveQuiz} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Quiz'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/20 border-2 border-black flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{questions.length}</p>
              <p className="text-xs text-gray-600">Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 border-2 border-black flex items-center justify-center">
              <Target className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{totalPoints}</p>
              <p className="text-xs text-gray-600">Total Points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 border-2 border-black flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">{settings.passingScore}%</p>
              <p className="text-xs text-gray-600">Passing Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 border-2 border-black flex items-center justify-center">
              <Clock className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xl font-bold text-black">
                {settings.timeLimit ? `${settings.timeLimit}m` : 'None'}
              </p>
              <p className="text-xs text-gray-600">Time Limit</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Mode */}
      {previewMode ? (
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-black">
            <CardHeader className="border-b-2 border-black bg-brand/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-black">{settings.title || 'Quiz Preview'}</CardTitle>
                  {settings.description && (
                    <p className="text-sm text-gray-600 mt-1">{settings.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {settings.timeLimit && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {settings.timeLimit} min
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-600">
                    <Target className="h-4 w-4" />
                    Pass: {settings.passingScore}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No questions to preview. Add some questions first.</p>
                </div>
              ) : previewSubmitted ? (
                // Results View
                <div className="space-y-6">
                  <div className="text-center py-8">
                    {(() => {
                      const score = calculatePreviewScore();
                      const passed = score.percentage >= settings.passingScore;
                      return (
                        <>
                          <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full border-4 ${passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} mb-4`}>
                            <span className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                              {score.percentage}%
                            </span>
                          </div>
                          <h3 className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                            {passed ? 'Passed!' : 'Not Passed'}
                          </h3>
                          <p className="text-gray-600 mt-2">
                            You scored {score.earned} out of {score.total} points
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  {/* Review Answers */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-black">Review Your Answers:</h4>
                    {questions.map((question, qIndex) => {
                      const selectedAnswers = previewAnswers[qIndex] || [];
                      const correctAnswers = question.options.filter((o) => o.isCorrect).map((o) => o.id);
                      const isCorrect =
                        selectedAnswers.length === correctAnswers.length &&
                        selectedAnswers.every((a) => correctAnswers.includes(a));

                      return (
                        <div key={qIndex} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-black">{qIndex + 1}. {question.text}</p>
                              <div className="mt-2 space-y-1">
                                {question.options.map((option) => {
                                  const isSelected = selectedAnswers.includes(option.id);
                                  const isCorrectOption = option.isCorrect;
                                  return (
                                    <div
                                      key={option.id}
                                      className={`text-sm flex items-center gap-2 ${
                                        isCorrectOption
                                          ? 'text-green-700 font-medium'
                                          : isSelected
                                          ? 'text-red-700'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {isSelected && !isCorrectOption && <XCircle className="h-3.5 w-3.5" />}
                                      {isCorrectOption && <CheckCircle2 className="h-3.5 w-3.5" />}
                                      {!isSelected && !isCorrectOption && <span className="w-3.5" />}
                                      {option.text}
                                      {isSelected && !isCorrectOption && ' (Your answer)'}
                                      {isCorrectOption && ' (Correct)'}
                                    </div>
                                  );
                                })}
                              </div>
                              {question.explanation && (
                                <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
                                  <Lightbulb className="h-3.5 w-3.5 inline mr-1" />
                                  {question.explanation}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {isCorrect ? question.points : 0}/{question.points} pts
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreviewAnswers({});
                        setPreviewSubmitted(false);
                        setPreviewCurrentQuestion(0);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                // Quiz Taking View
                <div className="space-y-6">
                  {/* Progress */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Question {previewCurrentQuestion + 1} of {questions.length}</span>
                    <span>{Object.keys(previewAnswers).length} answered</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all"
                      style={{ width: `${((previewCurrentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Current Question */}
                  {questions[previewCurrentQuestion] && (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium text-black">
                          {previewCurrentQuestion + 1}. {questions[previewCurrentQuestion].text}
                        </h3>
                        <Badge variant="secondary">{questions[previewCurrentQuestion].points} pts</Badge>
                      </div>

                      {questions[previewCurrentQuestion].hint && settings.showHints && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Hint: {questions[previewCurrentQuestion].hint}
                        </div>
                      )}

                      <div className="space-y-2">
                        {questions[previewCurrentQuestion].options.map((option) => {
                          const isSelected = (previewAnswers[previewCurrentQuestion] || []).includes(option.id);
                          const isMultiSelect = questions[previewCurrentQuestion].type === 'MULTIPLE_SELECT';

                          return (
                            <button
                              key={option.id}
                              onClick={() => handlePreviewAnswer(previewCurrentQuestion, option.id, isMultiSelect)}
                              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                isSelected
                                  ? 'border-brand bg-brand/10'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-5 w-5 rounded-${isMultiSelect ? 'md' : 'full'} border-2 flex items-center justify-center ${
                                  isSelected ? 'border-brand bg-brand' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="h-3 w-3 text-black" />}
                                </div>
                                <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {questions[previewCurrentQuestion].type === 'MULTIPLE_SELECT' && (
                        <p className="text-sm text-gray-500">Select all that apply</p>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewCurrentQuestion((prev) => Math.max(0, prev - 1))}
                      disabled={previewCurrentQuestion === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex gap-1">
                      {questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setPreviewCurrentQuestion(index)}
                          className={`h-8 w-8 rounded-lg border-2 text-sm font-medium transition-all ${
                            index === previewCurrentQuestion
                              ? 'border-brand bg-brand text-black'
                              : previewAnswers[index]
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    {previewCurrentQuestion < questions.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => setPreviewCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => setPreviewSubmitted(true)}
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Editor Mode - Main Content */
        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Questions List */}
          <div className="col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                {/* Add Question Button */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {questions.length === 0
                      ? 'No questions added yet'
                      : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
                  </p>
                  <Button variant="primary" onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

              {/* Questions List */}
              <Card>
                <CardContent className="p-0">
                  {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
                        <HelpCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-black mb-2">No questions yet</h3>
                      <p className="text-gray-600 text-center mb-4 max-w-md">
                        Start building your quiz by adding questions using the buttons above.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-gray-100">
                      {questions.map((question, index) => (
                        <div
                          key={question.id || index}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedQuestionIndex === index ? 'bg-brand/10 border-l-4 border-l-brand' : ''
                          }`}
                          onClick={() => setSelectedQuestionIndex(index)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveQuestion(index, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveQuestion(index, 'down');
                                }}
                                disabled={index === questions.length - 1}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-black truncate">{question.text}</p>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {question.type === 'MULTIPLE_CHOICE'
                                        ? 'Multiple Choice'
                                        : question.type === 'TRUE_FALSE'
                                        ? 'True/False'
                                        : 'Multiple Select'}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {question.points} pt{question.points !== 1 ? 's' : ''}
                                    </Badge>
                                    {question.difficulty && (
                                      <Badge
                                        className={`text-xs ${
                                          question.difficulty === 'EASY'
                                            ? 'bg-green-100 text-green-700'
                                            : question.difficulty === 'HARD'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                      >
                                        {question.difficulty}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditQuestion(index);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDuplicateQuestion(index);
                                    }}
                                    className="h-8 w-8 p-0"
                                    title="Duplicate"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteQuestion(index);
                                    }}
                                    className="h-8 w-8 p-0 hover:text-red-500"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Options preview */}
                              <div className="mt-3 space-y-1">
                                {question.options.slice(0, 4).map((option) => (
                                  <div
                                    key={option.id}
                                    className={`flex items-center gap-2 text-sm ${
                                      option.isCorrect ? 'text-green-700' : 'text-gray-500'
                                    }`}
                                  >
                                    {option.isCorrect ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{option.text}</span>
                                  </div>
                                ))}
                                {question.options.length > 4 && (
                                  <p className="text-xs text-gray-400 ml-5">
                                    +{question.options.length - 4} more options
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Basic Settings */}
              <Card>
                <CardHeader className="py-4 px-6 border-b-2 border-black">
                  <CardTitle className="text-lg text-black flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-black">Quiz Title *</label>
                      <Input
                        value={settings.title}
                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-bold text-black">Description</label>
                      <Textarea
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        placeholder="Describe what this quiz covers"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Passing Score (%)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={settings.passingScore}
                        onChange={(e) =>
                          setSettings({ ...settings, passingScore: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-black flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Limit (minutes)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={180}
                        value={settings.timeLimit || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            timeLimit: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Behavior Settings */}
              <Card>
                <CardHeader className="py-4 px-6 border-b-2 border-black">
                  <CardTitle className="text-lg text-black flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Behavior Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.shuffleQuestions}
                        onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-black"
                      />
                      <div>
                        <p className="font-medium text-black flex items-center gap-2">
                          <Shuffle className="h-4 w-4" />
                          Shuffle Questions
                        </p>
                        <p className="text-xs text-gray-500">Randomize question order for each attempt</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.shuffleOptions}
                        onChange={(e) => setSettings({ ...settings, shuffleOptions: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-black"
                      />
                      <div>
                        <p className="font-medium text-black flex items-center gap-2">
                          <Shuffle className="h-4 w-4" />
                          Shuffle Options
                        </p>
                        <p className="text-xs text-gray-500">Randomize answer options for each question</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowRetakes}
                        onChange={(e) => setSettings({ ...settings, allowRetakes: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-black"
                      />
                      <div>
                        <p className="font-medium text-black flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Allow Retakes
                        </p>
                        <p className="text-xs text-gray-500">Students can retake the quiz</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showResults}
                        onChange={(e) => setSettings({ ...settings, showResults: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-black"
                      />
                      <div>
                        <p className="font-medium text-black flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Show Results
                        </p>
                        <p className="text-xs text-gray-500">Show score after completion</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showCorrectAnswers}
                        onChange={(e) => setSettings({ ...settings, showCorrectAnswers: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-black"
                      />
                      <div>
                        <p className="font-medium text-black flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Show Correct Answers
                        </p>
                        <p className="text-xs text-gray-500">Reveal correct answers after submission</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showExplanations}
                        onChange={(e) => setSettings({ ...settings, showExplanations: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-black"
                      />
                      <div>
                        <p className="font-medium text-black flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Show Explanations
                        </p>
                        <p className="text-xs text-gray-500">Display explanations for answers</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Question Preview / Details */}
        <div className="space-y-4">
          {selectedQuestionIndex !== null && questions[selectedQuestionIndex] ? (
            <Card>
              <CardHeader className="py-4 px-6 border-b-2 border-black">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-black">
                    Question {selectedQuestionIndex + 1} Preview
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => handleEditQuestion(selectedQuestionIndex)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-black text-lg">{questions[selectedQuestionIndex].text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{questions[selectedQuestionIndex].type.replace('_', ' ')}</Badge>
                      <Badge variant="secondary">{questions[selectedQuestionIndex].points} points</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Options:</p>
                    {questions[selectedQuestionIndex].options.map((option, i) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border-2 ${
                          option.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {option.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={option.isCorrect ? 'font-medium' : ''}>{option.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {questions[selectedQuestionIndex].explanation && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4" />
                        Explanation
                      </p>
                      <p className="text-sm text-blue-700">{questions[selectedQuestionIndex].explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="h-12 w-12 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-black mb-2">Question Preview</h3>
                <p className="text-sm text-gray-600">
                  Select a question from the list to preview it here
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quiz Summary */}
          <Card>
            <CardHeader className="py-4 px-6 border-b-2 border-black">
              <CardTitle className="text-lg text-black">Quiz Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Questions</span>
                  <span className="font-bold">{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-bold">{totalPoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Passing Score</span>
                  <span className="font-bold">{settings.passingScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Points to Pass</span>
                  <span className="font-bold">{Math.ceil((totalPoints * settings.passingScore) / 100)}</span>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-600 mb-2">Question Types</p>
                  <div className="space-y-1">
                    {questions.filter((q) => q.type === 'MULTIPLE_CHOICE').length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Multiple Choice</span>
                        <span>{questions.filter((q) => q.type === 'MULTIPLE_CHOICE').length}</span>
                      </div>
                    )}
                    {questions.filter((q) => q.type === 'TRUE_FALSE').length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">True/False</span>
                        <span>{questions.filter((q) => q.type === 'TRUE_FALSE').length}</span>
                      </div>
                    )}
                    {questions.filter((q) => q.type === 'MULTIPLE_SELECT').length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Multiple Select</span>
                        <span>{questions.filter((q) => q.type === 'MULTIPLE_SELECT').length}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Question Modal */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Question Text *</label>
              <Textarea
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                placeholder="Enter your question..."
                rows={3}
                className="text-lg"
              />
            </div>

            {/* Question Type and Settings Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Question Type</label>
                <Select value={questionForm.type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                    <SelectItem value="MULTIPLE_SELECT">Multiple Select</SelectItem>
                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Points</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Difficulty</label>
                <Select
                  value={questionForm.difficulty || 'MEDIUM'}
                  onValueChange={(v) => setQuestionForm({ ...questionForm, difficulty: v as 'EASY' | 'MEDIUM' | 'HARD' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-black">
                  Answer Options
                  {questionForm.type === 'MULTIPLE_SELECT' && (
                    <span className="font-normal text-gray-500 ml-2">(Select all correct answers)</span>
                  )}
                </label>
                {questionForm.type !== 'TRUE_FALSE' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddOption}
                    disabled={questionForm.options.length >= 8}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {questionForm.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCorrect(option.id)}
                      className={`p-2.5 rounded-lg border-2 transition-all ${
                        option.isCorrect
                          ? 'border-green-600 bg-green-100 text-green-600'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      disabled={questionForm.type === 'TRUE_FALSE'}
                    >
                      {option.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </button>

                    {questionForm.type === 'TRUE_FALSE' ? (
                      <div className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 font-medium">
                        {option.text}
                      </div>
                    ) : (
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            options: questionForm.options.map((o) =>
                              o.id === option.id ? { ...o, text: e.target.value } : o
                            ),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                    )}

                    {questionForm.type !== 'TRUE_FALSE' && questionForm.options.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveOption(option.id)}
                        className="h-10 w-10 p-0 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Explanation (Optional)
              </label>
              <Textarea
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain why the correct answer is correct (shown after answering)"
                rows={2}
              />
            </div>

            {/* Hint */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-black flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Hint (Optional)
              </label>
              <Input
                value={questionForm.hint || ''}
                onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                placeholder="A subtle hint to help students (if hints are enabled)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSaveQuestion}>
              {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
