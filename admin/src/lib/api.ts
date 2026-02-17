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

          Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  getAll: (params?: any) => api.get('/users', { params }),
  getAdminStats: () => api.get('/users/admin/stats'),
};

// Courses API
export const coursesApi = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  getBySlug: (slug: string) => api.get(`/courses/${slug}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Modules API
export const modulesApi = {
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/modules`, data),
  update: (moduleId: string, data: any) => api.patch(`/courses/modules/${moduleId}`, data),
  delete: (moduleId: string) => api.delete(`/courses/modules/${moduleId}`),
};

// Lessons API
export const lessonsApi = {
  create: (moduleId: string, data: any) => api.post(`/courses/modules/${moduleId}/lessons`, data),
  update: (lessonId: string, data: any) => api.patch(`/courses/lessons/${lessonId}`, data),
  delete: (lessonId: string) => api.delete(`/courses/lessons/${lessonId}`),
};
