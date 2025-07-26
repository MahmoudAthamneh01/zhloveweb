import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  level: number;
  xp: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  rank: string;
  points: number;
  clanId?: number;
  clanName?: string;
  clanRole?: string;
  badges: string[];
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
  message: string;
}

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// API Functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

const registerAPI = async (userData: RegisterData): Promise<RegisterResponse> => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

const refreshTokenAPI = async (refreshToken: string): Promise<LoginResponse> => {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
};

const getUserAPI = async (token: string): Promise<User> => {
  return apiRequest('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Zustand Store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await loginAPI(email, password);
            
            set({
              user: response.user,
              token: response.token,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Set up automatic token refresh
            scheduleTokenRefresh(response.token);
            
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null,
              refreshToken: null,
            });
            throw error;
          }
        },

        register: async (userData: RegisterData) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await registerAPI(userData);
            
            set({
              user: response.user,
              token: response.token,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Set up automatic token refresh
            scheduleTokenRefresh(response.token);
            
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Registration failed',
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null,
              refreshToken: null,
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          // Clear any scheduled token refresh
          if (refreshTimeoutId) {
            clearTimeout(refreshTimeoutId);
            refreshTimeoutId = null;
          }
        },

        refreshAuth: async () => {
          try {
            const { refreshToken } = get();
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }
            
            const response = await refreshTokenAPI(refreshToken);
            
            set({
              user: response.user,
              token: response.token,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              error: null,
            });
            
            // Schedule next refresh
            scheduleTokenRefresh(response.token);
            
            return response;
            
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Force logout on refresh failure
            get().logout();
            throw error;
          }
        },

        updateUser: (userData: Partial<User>) => {
          const { user } = get();
          if (user) {
            set({
              user: { ...user, ...userData },
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'zh-love-auth',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          // Set up token refresh on app startup if user is authenticated
          if (state?.isAuthenticated && state?.token) {
            scheduleTokenRefresh(state.token);
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Token refresh scheduling
let refreshTimeoutId: NodeJS.Timeout | null = null;

const scheduleTokenRefresh = (token: string) => {
  try {
    // Decode JWT to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
    
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }
    
    refreshTimeoutId = setTimeout(() => {
      useAuthStore.getState().refreshAuth().catch(console.error);
    }, refreshTime);
    
  } catch (error) {
    console.error('Failed to schedule token refresh:', error);
  }
};

// HTTP Interceptor for automatic token refresh
export const createAuthenticatedRequest = (token: string) => {
  return async (endpoint: string, options: RequestInit = {}) => {
    const authenticatedOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, authenticatedOptions);
      
      // Handle token expiry
      if (response.status === 401) {
        const authStore = useAuthStore.getState();
        try {
          await authStore.refreshAuth();
          // Retry request with new token
          const newToken = useAuthStore.getState().token;
          if (newToken) {
            authenticatedOptions.headers = {
              ...authenticatedOptions.headers,
              'Authorization': `Bearer ${newToken}`,
            };
            return fetch(`${API_BASE_URL}${endpoint}`, authenticatedOptions);
          }
        } catch (refreshError) {
          // If refresh fails, logout user
          authStore.logout();
          throw new Error('Authentication expired. Please login again.');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  };
};

// Utility hooks
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    clearError,
    setLoading,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    clearError,
    setLoading,
  };
};

// Export types for use in components
export type { User, AuthState, RegisterData, LoginResponse, RegisterResponse }; 