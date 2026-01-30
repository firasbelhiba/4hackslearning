import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi, usersApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { user, tokens } = response.data;

          // Check if user has admin/instructor role
          if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
            throw new Error('Access denied. Admin or Instructor role required.');
          }

          Cookies.set('accessToken', tokens.accessToken, { expires: 1 / 96 });
          Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors
        } finally {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchUser: async () => {
        const token = Cookies.get('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await usersApi.getProfile();
          const user = response.data;

          // Check if user has admin/instructor role
          if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
