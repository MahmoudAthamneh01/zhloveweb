// API Utils for ZH-Love Gaming Community
// Handles all API calls to the backend

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  country: string;
  rankPoints: number;
  level: number;
  experiencePoints: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  leaderId: number;
  foundedDate: string;
  totalMembers: number;
  clanPoints: number;
  wins: number;
  losses: number;
  winRate: number;
  status: string;
  recruitmentOpen: boolean;
  website: string;
  discordUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Tournament {
  id: number;
  name: string;
  description: string;
  bannerUrl: string;
  tournamentType: string;
  gameMode: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: string;
  organizerId: number;
  rules: string;
  requirements: string;
  createdAt: string;
  updatedAt: string;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  authorId: number;
  categoryId: number;
  postType: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: string;
  lastReplyBy: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
  expires_at: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('zh_love_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zh_love_token', response.data.token);
        localStorage.setItem('zh_love_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country?: string;
    bio?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zh_love_token', response.data.token);
        localStorage.setItem('zh_love_user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zh_love_token');
      localStorage.removeItem('zh_love_user');
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  // User methods
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    return this.request<{ users: User[]; pagination: any }>(`/users?${query.toString()}`);
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Clan methods
  async getClans(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<{ clans: Clan[]; pagination: any }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    return this.request<{ clans: Clan[]; pagination: any }>(`/clans?${query.toString()}`);
  }

  async getClan(id: number): Promise<ApiResponse<Clan>> {
    return this.request<Clan>(`/clans/${id}`);
  }

  async createClan(clanData: Partial<Clan>): Promise<ApiResponse<Clan>> {
    return this.request<Clan>('/clans', {
      method: 'POST',
      body: JSON.stringify(clanData),
    });
  }

  async updateClan(id: number, clanData: Partial<Clan>): Promise<ApiResponse<Clan>> {
    return this.request<Clan>(`/clans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clanData),
    });
  }

  async joinClan(id: number): Promise<ApiResponse<any>> {
    return this.request(`/clans/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveClan(id: number): Promise<ApiResponse<any>> {
    return this.request(`/clans/${id}/leave`, {
      method: 'POST',
    });
  }

  // Tournament methods
  async getTournaments(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<{ tournaments: Tournament[]; pagination: any }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    return this.request<{ tournaments: Tournament[]; pagination: any }>(`/tournaments?${query.toString()}`);
  }

  async getTournament(id: number): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>(`/tournaments/${id}`);
  }

  async createTournament(tournamentData: Partial<Tournament>): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  }

  async joinTournament(id: number): Promise<ApiResponse<any>> {
    return this.request(`/tournaments/${id}/join`, {
      method: 'POST',
    });
  }

  // Forum methods
  async getForumCategories(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/forum/categories');
  }

  async getForumPosts(params?: { page?: number; limit?: number; category?: number }): Promise<ApiResponse<{ posts: ForumPost[]; pagination: any }>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.category) query.append('category', params.category.toString());

    return this.request<{ posts: ForumPost[]; pagination: any }>(`/forum/posts?${query.toString()}`);
  }

  async getForumPost(id: number): Promise<ApiResponse<ForumPost>> {
    return this.request<ForumPost>(`/forum/posts/${id}`);
  }

  async createForumPost(postData: Partial<ForumPost>): Promise<ApiResponse<ForumPost>> {
    return this.request<ForumPost>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Rankings methods
  async getRankings(params?: { page?: number; limit?: number; season?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.season) query.append('season', params.season);

    return this.request<any>(`/rankings?${query.toString()}`);
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUserFromStorage(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('zh_love_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zh_love_token', token);
    }
  }

  clearAuth(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zh_love_token');
      localStorage.removeItem('zh_love_user');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type {
  ApiResponse,
  User,
  Clan,
  Tournament,
  ForumPost,
  AuthResponse,
}; 