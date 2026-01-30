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

          Cookies.set('accessToken', accessToken, { expires: 1 / 96, path: '/' });
          Cookies.set('refreshToken', newRefreshToken, { expires: 7, path: '/' });

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
  getProfile: () => api.get('/users/me'),
};

// Organizations API
export const organizationsApi = {
  getAll: () => api.get('/organizations'),
  getMyOrganizations: () => api.get('/organizations/my'),
  getBySlug: (slug: string) => api.get(`/organizations/${slug}`),
  getById: (id: string) => api.get(`/organizations/${id}`),
  create: (data: {
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
  }) => api.post('/organizations', data),
  update: (id: string, data: any) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  // Members
  addMember: (orgId: string, data: { userId: string; role?: string }) =>
    api.post(`/organizations/${orgId}/members`, data),
  removeMember: (orgId: string, memberId: string) =>
    api.delete(`/organizations/${orgId}/members/${memberId}`),
  updateMemberRole: (orgId: string, memberId: string, role: string) =>
    api.patch(`/organizations/${orgId}/members/${memberId}/role`, { role }),
};

// Organization Courses API
export const orgCoursesApi = {
  getAll: (orgId: string, params?: { page?: number; limit?: number; isPublished?: string }) =>
    api.get(`/organizations/${orgId}/courses`, { params }),
  getById: (orgId: string, courseId: string) =>
    api.get(`/organizations/${orgId}/courses/${courseId}`),
  create: (orgId: string, data: any) =>
    api.post(`/organizations/${orgId}/courses`, data),
  update: (orgId: string, courseId: string, data: any) =>
    api.patch(`/organizations/${orgId}/courses/${courseId}`, data),
  delete: (orgId: string, courseId: string) =>
    api.delete(`/organizations/${orgId}/courses/${courseId}`),
  // Modules
  createModule: (orgId: string, courseId: string, data: any) =>
    api.post(`/organizations/${orgId}/courses/${courseId}/modules`, data),
  updateModule: (orgId: string, courseId: string, moduleId: string, data: any) =>
    api.patch(`/organizations/${orgId}/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (orgId: string, courseId: string, moduleId: string) =>
    api.delete(`/organizations/${orgId}/courses/${courseId}/modules/${moduleId}`),
  // Lessons
  createLesson: (orgId: string, courseId: string, moduleId: string, data: any) =>
    api.post(`/organizations/${orgId}/courses/${courseId}/modules/${moduleId}/lessons`, data),
  updateLesson: (orgId: string, courseId: string, lessonId: string, data: any) =>
    api.patch(`/organizations/${orgId}/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (orgId: string, courseId: string, lessonId: string) =>
    api.delete(`/organizations/${orgId}/courses/${courseId}/lessons/${lessonId}`),
};

// Certificate Templates API
export const certificateTemplatesApi = {
  getAll: (orgId: string) =>
    api.get(`/organizations/${orgId}/certificate-templates`),
  getById: (orgId: string, templateId: string) =>
    api.get(`/organizations/${orgId}/certificate-templates/${templateId}`),
  getDefault: (orgId: string) =>
    api.get(`/organizations/${orgId}/certificate-templates/default`),
  create: (orgId: string, data: any) =>
    api.post(`/organizations/${orgId}/certificate-templates`, data),
  update: (orgId: string, templateId: string, data: any) =>
    api.patch(`/organizations/${orgId}/certificate-templates/${templateId}`, data),
  delete: (orgId: string, templateId: string) =>
    api.delete(`/organizations/${orgId}/certificate-templates/${templateId}`),
  setDefault: (orgId: string, templateId: string) =>
    api.post(`/organizations/${orgId}/certificate-templates/${templateId}/set-default`),
};

// Certificates API (issued certificates)
export const certificatesApi = {
  getOrganizationCertificates: (orgId: string) =>
    api.get(`/certificates/organization/${orgId}`),
  getById: (id: string) =>
    api.get(`/certificates/${id}`),
  verify: (code: string) =>
    api.get(`/certificates/verify/${code}`),
};

// Upload API (Cloudinary)
export const uploadApi = {
  getVideoSignature: (folder?: string) =>
    api.post('/upload/cloudinary/video/signature', { folder }),
  getImageSignature: (folder?: string) =>
    api.post('/upload/cloudinary/image/signature', { folder }),
  deleteCloudinaryFile: (publicId: string, resourceType?: string) =>
    api.delete(`/upload/cloudinary/${publicId}`, { data: { resourceType } }),
};

// Vimeo Upload API
export const vimeoApi = {
  createUploadTicket: (fileSize: number, fileName: string, description?: string) =>
    api.post('/upload/vimeo/video/upload-ticket', { fileSize, fileName, description }),
  getVideoDetails: (videoId: string) =>
    api.get(`/upload/vimeo/video/${videoId}`),
  checkVideoStatus: (videoId: string) =>
    api.get(`/upload/vimeo/video/${videoId}/status`),
  deleteVideo: (videoId: string) =>
    api.delete(`/upload/vimeo/video/${videoId}`),
};
