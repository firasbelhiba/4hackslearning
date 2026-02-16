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

// Notification preferences type
export interface NotificationPreferences {
  emailCourseUpdates: boolean;
  emailNewCourses: boolean;
  emailCompletionReminders: boolean;
  emailCertificates: boolean;
  emailMarketing: boolean;
}

// Certificate settings type
export interface CertificateSettings {
  certificateDisplayName: string;
  linkedinAutoShare: boolean;
}

// Appearance settings type
export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface AppearanceSettings {
  theme: ThemePreference;
  language: string;
}

// Privacy settings type
export interface PrivacySettings {
  twoFactorEnabled: boolean;
  profileVisibility: 'public' | 'private';
  showOnLeaderboard: boolean;
}

// Session type
export interface UserSession {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  isCurrentSession: boolean;
  lastActiveAt: string;
  createdAt: string;
}

// 2FA types
export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
}

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/me/change-password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getStats: () => api.get('/users/me/stats'),
  getNotifications: () => api.get<NotificationPreferences>('/users/me/notifications'),
  updateNotifications: (data: Partial<NotificationPreferences>) =>
    api.patch<NotificationPreferences>('/users/me/notifications', data),
  getCertificateSettings: () => api.get<CertificateSettings>('/users/me/certificate-settings'),
  updateCertificateSettings: (data: Partial<CertificateSettings>) =>
    api.patch<CertificateSettings>('/users/me/certificate-settings', data),
  getAppearanceSettings: () => api.get<AppearanceSettings>('/users/me/appearance-settings'),
  updateAppearanceSettings: (data: Partial<AppearanceSettings>) =>
    api.patch<AppearanceSettings>('/users/me/appearance-settings', data),
  // Privacy & Security
  getPrivacySettings: () => api.get<PrivacySettings>('/users/me/privacy-settings'),
  updatePrivacySettings: (data: Partial<PrivacySettings>) =>
    api.patch<PrivacySettings>('/users/me/privacy-settings', data),
  // 2FA
  generate2FA: () => api.post<TwoFactorSetup>('/users/me/2fa/generate'),
  enable2FA: (code: string) => api.post('/users/me/2fa/enable', { code }),
  disable2FA: (code: string) => api.post('/users/me/2fa/disable', { code }),
  // Sessions
  getSessions: () => api.get<UserSession[]>('/users/me/sessions'),
  revokeSession: (sessionId: string) => api.delete(`/users/me/sessions/${sessionId}`),
  revokeAllSessions: () => api.delete('/users/me/sessions'),
};

// Courses API
export const coursesApi = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getBySlug: (slug: string) => api.get(`/courses/${slug}`),
  getById: (id: string) => api.get(`/courses/id/${id}`),
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

// Cloudinary signature response
export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}

// Upload API
export const uploadApi = {
  // Image uploads
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Video uploads
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Cloudinary signed uploads (for large videos)
  getCloudinaryVideoSignature: (folder?: string) =>
    api.post<CloudinarySignature>('/upload/cloudinary/video/signature', { folder }),
  getCloudinaryImageSignature: (folder?: string) =>
    api.post<CloudinarySignature>('/upload/cloudinary/image/signature', { folder }),
  // Get Cloudinary streaming URLs
  getCloudinaryStreamingUrls: (publicId: string) =>
    api.get<{ hls: string; dash: string; thumbnail: string; mp4: string }>(
      `/upload/cloudinary/video/${encodeURIComponent(publicId)}/streaming`
    ),
  // Delete from Cloudinary
  deleteCloudinaryFile: (publicId: string, resourceType?: 'video' | 'image' | 'raw') =>
    api.delete(`/upload/cloudinary/${encodeURIComponent(publicId)}`, {
      data: { resourceType },
    }),
};
