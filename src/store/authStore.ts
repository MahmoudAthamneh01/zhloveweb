// Authentication Store for ZH-Love Gaming Community
// Manages user authentication state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, type User, type AuthResponse } from '../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country?: string;
    bio?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.login(email, password);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Login failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.register(userData);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Registration failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        
        try {
          const response = await apiClient.getCurrentUser();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token might be expired, clear auth
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            apiClient.clearAuth();
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          apiClient.clearAuth();
        }
      },

      updateUser: async (userData) => {
        const { user } = get();
        if (!user) return false;

        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.updateUser(user.id, userData);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error || 'Update failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Update failed',
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const token = apiClient.isAuthenticated() ? localStorage.getItem('zh_love_token') : null;
        const user = apiClient.getCurrentUserFromStorage();
        
        if (token && user) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
          apiClient.setToken(token);
        }
      },
    }),
    {
      name: 'zh-love-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth store when module loads
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
} 