// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  level: CourseLevel;
  category: string;
  tags: string[];
  price: number;
  isFree: boolean;
  isPublished: boolean;
  instructorId: string;
  instructor?: User;
  modules?: Module[];
  enrollmentCount?: number;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessons?: Lesson[];
  quiz?: Quiz;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  videoDuration?: number;
  order: number;
  moduleId: string;
  resources?: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  lessonId: string;
}

export enum ResourceType {
  PDF = 'PDF',
  LINK = 'LINK',
  CODE = 'CODE',
  FILE = 'FILE',
}

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit?: number;
  moduleId: string;
  questions?: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
  quizId: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  answers: QuizAnswer[];
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  progress: number;
  status: EnrollmentStatus;
  lessonProgress?: LessonProgress[];
  enrolledAt: Date;
  completedAt?: Date;
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  watchedSeconds: number;
  completed: boolean;
  completedAt?: Date;
}

// Certificate Types
export interface Certificate {
  id: string;
  uniqueCode: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  issuedAt: Date;
  pdfUrl?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Search & Filter Types
export interface CourseFilters {
  search?: string;
  category?: string;
  level?: CourseLevel;
  tags?: string[];
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Dashboard Stats
export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCertificates: number;
  totalWatchTime: number;
  averageQuizScore: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
  recentEnrollments: Enrollment[];
  popularCourses: Course[];
}
