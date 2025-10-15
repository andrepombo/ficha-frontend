import axios from 'axios';

const API_BASE_URL = '/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/token/`, {
        username,
        password,
      });

      const { access, refresh } = response.data;
      
      // Store tokens
      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Clear tokens
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<{ access: string }>(`${API_BASE_URL}/token/refresh/`, {
        refresh: this.refreshToken,
      });

      this.accessToken = response.data.access;
      localStorage.setItem('access_token', response.data.access);

      return response.data.access;
    } catch (error) {
      // If refresh fails, logout the user
      await this.logout();
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async getCurrentUser(): Promise<User | null> {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await axios.get<User>(`${API_BASE_URL}/user/`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
