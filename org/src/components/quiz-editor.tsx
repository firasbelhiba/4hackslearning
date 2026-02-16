'use client';

import { useState, useCallback } from 'react';
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
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Edit,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Save,
} from 'lucide-react';
import { quizzesApi, Quiz, QuizQuestion, QuizOption, CreateQuizData, CreateQuestionData } from '@/lib/api';

interface QuizEditorProps {
  moduleId: string;
  moduleName: string;
  existingQuiz?: Quiz | null;
  onQuizSaved: () => void;
  onClose: () => void;
}

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_SELECT';

interface QuestionFormData {
  text: string;
  type: QuestionType;
  options: QuizOption[];
  explanation: string;
  points: number;
}

const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultQuestion: QuestionFormData = {
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
};

const trueFalseOptions: QuizOption[] = [
  { id: 'true', text: 'True', isCorrect: true },
  { id: 'false', text: 'False', isCorrect: false },
];

export function QuizEditor({
  moduleId,
  moduleName,
  existingQuiz,
  onQuizSaved,
  onClose,
}: QuizEditorProps) {
  const [quizData, setQuizData] = useState<CreateQuizData>({
    title: existingQuiz?.title || `${moduleName} Quiz`,
    description: existingQuiz?.description || '',
    passingScore: existingQuiz?.passingScore || 70,
    timeLimit: existingQuiz?.timeLimit || undefined,
  });

  const [questions, setQuestions] = useState<(QuestionFormData & { id?: string; order: number })[]>(
    existingQuiz?.questions?.map((q, i) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      explanation: q.explanation || '',
      points: q.points,
      order: q.order || i + 1,
    })) || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({ ...defaultQuestion });
  const [questionModalOpen, setQuestionModalOpen] = useState(false);

  // Add a new question
  const handleAddQuestion = () => {
    setEditingQuestionIndex(null);
    setQuestionForm({
      ...defaultQuestion,
      options: [
        { id: generateOptionId(), text: '', isCorrect: true },
        { id: generateOptionId(), text: '', isCorrect: false },
        { id: generateOptionId(), text: '', isCorrect: false },
        { id: generateOptionId(), text: '', isCorrect: false },
      ],
    });
    setQuestionModalOpen(true);
  };

  // Edit existing question
  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingQuestionIndex(index);
    setQuestionForm({
      text: q.text,
      type: q.type,
      options: [...q.options],
      explanation: q.explanation,
      points: q.points,
    });
    setQuestionModalOpen(true);
  };

  // Save question (add or update)
  const handleSaveQuestion = () => {
    if (!questionForm.text.trim()) {
      toast({ title: 'Error', description: 'Question text is required', variant: 'destructive' });
      return;
    }

    // Validate at least 2 options
    const validOptions = questionForm.options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      toast({ title: 'Error', description: 'At least 2 options are required', variant: 'destructive' });
      return;
    }

    // Validate at least one correct answer
    const hasCorrect = validOptions.some((o) => o.isCorrect);
    if (!hasCorrect) {
      toast({ title: 'Error', description: 'At least one option must be marked as correct', variant: 'destructive' });
      return;
    }

    const newQuestion = {
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
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    updated.forEach((q, i) => (q.order = i + 1));
    setQuestions(updated);
  };

  // Handle question type change
  const handleTypeChange = (type: QuestionType) => {
    if (type === 'TRUE_FALSE') {
      setQuestionForm({
        ...questionForm,
        type,
        options: [...trueFalseOptions],
      });
    } else {
      // If switching from TRUE_FALSE, reset to default options
      if (questionForm.type === 'TRUE_FALSE') {
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
    }
  };

  // Add option
  const handleAddOption = () => {
    if (questionForm.options.length >= 6) {
      toast({ title: 'Error', description: 'Maximum 6 options allowed', variant: 'destructive' });
      return;
    }
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { id: generateOptionId(), text: '', isCorrect: false }],
    });
  };

  // Remove option
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

  // Update option text
  const handleOptionTextChange = (optionId: string, text: string) => {
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
    });
  };

  // Toggle option correct status
  const handleToggleCorrect = (optionId: string) => {
    if (questionForm.type === 'MULTIPLE_SELECT') {
      // Multiple select allows multiple correct answers
      setQuestionForm({
        ...questionForm,
        options: questionForm.options.map((o) =>
          o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
        ),
      });
    } else {
      // Single select - only one correct answer
      setQuestionForm({
        ...questionForm,
        options: questionForm.options.map((o) => ({
          ...o,
          isCorrect: o.id === optionId,
        })),
      });
    }
  };

  // Save the entire quiz
  const handleSaveQuiz = async () => {
    if (!quizData.title.trim()) {
      toast({ title: 'Error', description: 'Quiz title is required', variant: 'destructive' });
      return;
    }

    if (questions.length === 0) {
      toast({ title: 'Error', description: 'Add at least one question to the quiz', variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);

      if (existingQuiz) {
        // Update existing quiz
        await quizzesApi.update(existingQuiz.id, quizData);

        // Handle questions - for simplicity, delete and recreate
        // In production, you'd want to be smarter about this
        for (const q of questions) {
          if (q.id) {
            await quizzesApi.updateQuestion(q.id, {
              text: q.text,
              type: q.type,
              options: q.options,
              explanation: q.explanation || undefined,
              points: q.points,
              order: q.order,
            });
          } else {
            await quizzesApi.addQuestion(existingQuiz.id, {
              text: q.text,
              type: q.type,
              options: q.options,
              explanation: q.explanation || undefined,
              points: q.points,
              order: q.order,
            });
          }
        }

        toast({ title: 'Quiz updated', variant: 'success' });
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

        toast({ title: 'Quiz created', variant: 'success' });
      }

      onQuizSaved();
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <Card>
        <CardHeader className="py-4 px-6 border-b-2 border-black">
          <CardTitle className="text-lg text-black flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Quiz Title *</label>
              <Input
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                placeholder="e.g., Module 1 Assessment"
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
                value={quizData.passingScore}
                onChange={(e) => setQuizData({ ...quizData, passingScore: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Description</label>
              <Textarea
                value={quizData.description}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                placeholder="Brief description of what this quiz covers"
                rows={2}
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
                value={quizData.timeLimit || ''}
                onChange={(e) =>
                  setQuizData({ ...quizData, timeLimit: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Leave empty for no limit"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="py-4 px-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-black">Questions</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {questions.length} question{questions.length !== 1 ? 's' : ''} • {totalPoints} total points
              </p>
            </div>
            <Button onClick={handleAddQuestion} variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-xl border-2 border-black bg-gray-100 flex items-center justify-center mb-4 shadow-brutal-sm">
                <HelpCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No questions yet</h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">
                Start adding questions to your quiz. You can add multiple choice, true/false, or multiple select questions.
              </p>
              <Button onClick={handleAddQuestion} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-200">
              {questions.map((question, index) => (
                <div key={question.id || index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 pt-1">
                      <div className="cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-500 w-6">{index + 1}.</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-black">{question.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {question.type === 'MULTIPLE_CHOICE'
                                ? 'Multiple Choice'
                                : question.type === 'TRUE_FALSE'
                                ? 'True/False'
                                : 'Multiple Select'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {question.points} point{question.points !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-1">
                            {question.options.map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-center gap-2 text-sm ${
                                  option.isCorrect ? 'text-green-700' : 'text-gray-600'
                                }`}
                              >
                                {option.isCorrect ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-300" />
                                )}
                                {option.text}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Explanation: {question.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditQuestion(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQuestion(index)}
                            className="h-8 w-8 p-0 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveQuiz} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : existingQuiz ? 'Update Quiz' : 'Create Quiz'}
        </Button>
      </div>

      {/* Question Modal */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
            <DialogDescription>
              Create a question with multiple answer options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Question Text *</label>
              <Textarea
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                placeholder="Enter your question here..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Question Type</label>
                <Select value={questionForm.type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice (Single Answer)</SelectItem>
                    <SelectItem value="MULTIPLE_SELECT">Multiple Select (Multiple Answers)</SelectItem>
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
            </div>

            <div className="space-y-2">
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
                    disabled={questionForm.options.length >= 6}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
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
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        option.isCorrect
                          ? 'border-green-600 bg-green-100 text-green-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={questionForm.type === 'TRUE_FALSE'}
                    >
                      {option.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300" />
                      )}
                    </button>
                    {questionForm.type === 'TRUE_FALSE' ? (
                      <div className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50">
                        {option.text}
                      </div>
                    ) : (
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
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
                        className="h-9 w-9 p-0 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-black">Explanation (Optional)</label>
              <Textarea
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain why the correct answer is correct (shown after answering)"
                rows={2}
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
