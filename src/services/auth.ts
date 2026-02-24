import axios from 'axios';

const API_BASE_URL = '/api';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || '12345';
const ENABLE_DEMO_LOGIN = import.meta.env.VITE_ENABLE_DEMO_LOGIN !== 'false';

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
    is_superuser?: boolean;
  };
}

export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
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
    if (ENABLE_DEMO_LOGIN && password === DEMO_PASSWORD) {
      const demoUser: User = {
        id: 0,
        username: username || 'demo',
        email: username || 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        is_superuser: false,
      };

      const access = 'demo-access-token';
      const refresh = 'demo-refresh-token';

      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(demoUser));

      return { access, refresh, user: demoUser };
    }

    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/token/`, {
        username,
        password,
      });

      const { access, refresh, user } = response.data;
      
      // Store tokens
      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

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
    if (this.isDemoSession() && this.accessToken) {
      return this.accessToken;
    }

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

  isDemoSession(): boolean {
    return this.accessToken === 'demo-access-token' || this.refreshToken === 'demo-refresh-token';
  }

  // Decode a JWT without verifying signature to read payload
  private decodeJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Check if access token is expired (with buffer)
  isAccessTokenExpired(bufferSeconds: number = 30): boolean {
    if (this.isDemoSession()) return false;
    if (!this.accessToken) return true;
    const payload = this.decodeJwt(this.accessToken);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now + bufferSeconds;
  }

  // Ensure we have a valid (non-expired) access token before making requests
  async ensureValidAccessToken(): Promise<string | null> {
    if (this.isDemoSession() && this.accessToken) {
      return this.accessToken;
    }

    if (!this.accessToken && this.refreshToken) {
      // No access token but refresh exists
      try {
        return await this.refreshAccessToken();
      } catch {
        return null;
      }
    }
    if (this.isAccessTokenExpired()) {
      try {
        return await this.refreshAccessToken();
      } catch {
        return null;
      }
    }
    return this.accessToken;
  }
}

export const authService = new AuthService();
export default authService;
