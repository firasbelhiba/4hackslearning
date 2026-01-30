import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organizations: [],
  currentOrganization: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { accessToken, refreshToken, user } = response.data;

    Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });

    set({ user, isAuthenticated: true });
    await get().fetchProfile();
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('currentOrgId');
    set({
      user: null,
      organizations: [],
      currentOrganization: null,
      isAuthenticated: false,
    });
  },

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const [profileRes, orgsRes] = await Promise.all([
        authApi.getProfile(),
        import('@/lib/api').then((mod) => mod.organizationsApi.getMyOrganizations()),
      ]);

      const user = profileRes.data;
      const organizations = orgsRes.data;

      // Get saved org from cookie or use first org
      const savedOrgId = Cookies.get('currentOrgId');
      let currentOrganization = organizations.find((o: Organization) => o.id === savedOrgId);
      if (!currentOrganization && organizations.length > 0) {
        currentOrganization = organizations[0];
        Cookies.set('currentOrgId', currentOrganization.id, { expires: 30 });
      }

      set({
        user,
        organizations,
        currentOrganization,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  fetchOrganizations: async () => {
    try {
      const { organizationsApi } = await import('@/lib/api');
      const orgsRes = await organizationsApi.getMyOrganizations();
      const organizations = orgsRes.data;

      const savedOrgId = Cookies.get('currentOrgId');
      let currentOrganization = organizations.find((o: Organization) => o.id === savedOrgId);
      if (!currentOrganization && organizations.length > 0) {
        currentOrganization = organizations[0];
        Cookies.set('currentOrgId', currentOrganization.id, { expires: 30 });
      }

      set({ organizations, currentOrganization });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  },

  setCurrentOrganization: (org: Organization) => {
    Cookies.set('currentOrgId', org.id, { expires: 30 });
    set({ currentOrganization: org });
  },
}));
