import axios from 'axios';
import { Candidate, CandidateStats } from '../types';
import { authService } from './auth';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authService.refreshAccessToken();
        const token = authService.getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login or handle as needed
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const candidateAPI = {
  getAll: async (params = {}): Promise<Candidate[]> => {
    const response = await api.get<Candidate[]>('/candidates/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Candidate> => {
    const response = await api.get<Candidate>(`/candidates/${id}/`);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Candidate> => {
    const response = await api.patch<Candidate>(`/candidates/${id}/update_status/`, { status });
    return response.data;
  },

  updateNotes: async (id: number, notes: string): Promise<Candidate> => {
    const response = await api.patch<Candidate>(`/candidates/${id}/`, { notes });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/candidates/${id}/`);
  },

  getStats: async (): Promise<CandidateStats> => {
    const response = await api.get<CandidateStats>('/candidates/stats/');
    return response.data;
  },
};

export default api;
