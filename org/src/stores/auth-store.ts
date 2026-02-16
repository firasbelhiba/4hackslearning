import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

// Cookie names for org portal (different from frontend to avoid conflicts)
const ACCESS_TOKEN_KEY = 'org_accessToken';
const REFRESH_TOKEN_KEY = 'org_refreshToken';
const CURRENT_ORG_KEY = 'org_currentOrgId';

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
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organizations: [],
  currentOrganization: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  initialize: async () => {
    // Prevent multiple initializations
    if (get().isInitialized) return;

    const accessToken = Cookies.get(ACCESS_TOKEN_KEY);

    if (!accessToken) {
      set({ isLoading: false, isInitialized: true });
      return;
    }

    try {
      await get().fetchProfile();
    } catch (error) {
      // Token invalid or expired
      Cookies.remove(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      set({ isLoading: false, isInitialized: true });
    }

    set({ isInitialized: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      const { user, tokens } = response.data;
      const { accessToken, refreshToken } = tokens;

      Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 / 96, path: '/' });
      Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, path: '/' });

      set({ user, isAuthenticated: true });
      await get().fetchProfile();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(CURRENT_ORG_KEY);
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
      const savedOrgId = Cookies.get(CURRENT_ORG_KEY);
      let currentOrganization = organizations.find((o: Organization) => o.id === savedOrgId);
      if (!currentOrganization && organizations.length > 0) {
        currentOrganization = organizations[0];
        Cookies.set(CURRENT_ORG_KEY, currentOrganization.id, { expires: 30 });
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

      const savedOrgId = Cookies.get(CURRENT_ORG_KEY);
      let currentOrganization = organizations.find((o: Organization) => o.id === savedOrgId);
      if (!currentOrganization && organizations.length > 0) {
        currentOrganization = organizations[0];
        Cookies.set(CURRENT_ORG_KEY, currentOrganization.id, { expires: 30 });
      }

      set({ organizations, currentOrganization });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  },

  setCurrentOrganization: (org: Organization) => {
    Cookies.set(CURRENT_ORG_KEY, org.id, { expires: 30 });
    set({ currentOrganization: org });
  },
}));
