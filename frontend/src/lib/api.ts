import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          Cookies.set('accessToken', accessToken, { expires: 1 / 96 }); // 15 minutes
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 }); // 7 days

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, clear tokens and redirect to login
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
};

// Courses API
export const coursesApi = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getBySlug: (slug: string) => api.get(`/courses/${slug}`),
  getCategories: () => api.get('/courses/categories'),
  getTags: () => api.get('/courses/tags'),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Enrollments API
export const enrollmentsApi = {
  getAll: () => api.get('/enrollments'),
  enroll: (courseId: string) => api.post(`/enrollments/course/${courseId}`),
  getEnrollment: (courseId: string) => api.get(`/enrollments/course/${courseId}`),
  checkEnrollment: (courseId: string) =>
    api.get(`/enrollments/course/${courseId}/check`),
  updateProgress: (enrollmentId: string, lessonId: string, data: any) =>
    api.patch(`/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, data),
  unenroll: (courseId: string) => api.delete(`/enrollments/course/${courseId}`),
};

// Quizzes API
export const quizzesApi = {
  getQuiz: (id: string) => api.get(`/quizzes/${id}`),
  submitQuiz: (quizId: string, answers: any) =>
    api.post(`/quizzes/${quizId}/submit`, { answers }),
  getAttempts: (quizId: string) => api.get(`/quizzes/${quizId}/attempts`),
  getBestAttempt: (quizId: string) => api.get(`/quizzes/${quizId}/best-attempt`),
};

// Certificates API
export const certificatesApi = {
  getAll: () => api.get('/certificates'),
  getById: (id: string) => api.get(`/certificates/${id}`),
  verify: (code: string) => api.get(`/certificates/verify/${code}`),
};
