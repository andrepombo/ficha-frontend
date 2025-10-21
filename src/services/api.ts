import axios from 'axios';
import { Candidate, CandidateStats, Interview, InterviewStats, User } from '../types';
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

  getInterviews: async (candidateId: number): Promise<Interview[]> => {
    const response = await api.get<Interview[]>(`/candidates/${candidateId}/interviews/`);
    return response.data;
  },

  exportPDF: async (filters: any): Promise<Blob> => {
    const response = await api.get('/candidates/export_pdf/', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  exportExcel: async (filters: any): Promise<Blob> => {
    const response = await api.get('/candidates/export_excel/', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  exportAnalyticsPDF: async (year?: string): Promise<Blob> => {
    const response = await api.get('/candidates/export_analytics_pdf/', {
      params: year ? { year } : {},
      responseType: 'blob',
    });
    return response.data;
  },

  exportAnalyticsExcel: async (year?: string): Promise<Blob> => {
    const response = await api.get('/candidates/export_analytics_excel/', {
      params: year ? { year } : {},
      responseType: 'blob',
    });
    return response.data;
  },

  getFilterOptions: async (): Promise<any> => {
    const response = await api.get('/candidates/filter_options/');
    return response.data;
  },

  getFunnelStats: async (year?: string): Promise<any> => {
    const response = await api.get('/candidates/funnel_stats/', {
      params: year ? { year } : {},
    });
    return response.data;
  },

  calculateScore: async (id: number): Promise<any> => {
    const response = await api.post(`/candidates/${id}/calculate_score/`);
    return response.data;
  },

  recalculateAllScores: async (): Promise<any> => {
    const response = await api.post('/candidates/recalculate_all_scores/');
    return response.data;
  },

  getScoreDistribution: async (filters?: any): Promise<any> => {
    const response = await api.get('/candidates/score_distribution/', {
      params: filters || {},
    });
    return response.data;
  },
};

export const interviewAPI = {
  getAll: async (params = {}): Promise<Interview[]> => {
    const response = await api.get<Interview[]>('/interviews/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Interview> => {
    const response = await api.get<Interview>(`/interviews/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Interview>): Promise<Interview> => {
    const response = await api.post<Interview>('/interviews/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Interview>): Promise<Interview> => {
    const response = await api.patch<Interview>(`/interviews/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/interviews/${id}/`);
  },

  updateStatus: async (id: number, status: string): Promise<Interview> => {
    const response = await api.patch<Interview>(`/interviews/${id}/update_status/`, { status });
    return response.data;
  },

  addFeedback: async (id: number, feedback: string, rating?: number): Promise<Interview> => {
    const response = await api.patch<Interview>(`/interviews/${id}/add_feedback/`, { feedback, rating });
    return response.data;
  },

  getUpcoming: async (): Promise<Interview[]> => {
    const response = await api.get<Interview[]>('/interviews/upcoming/');
    return response.data;
  },

  getCalendar: async (month?: number, year?: number): Promise<Interview[]> => {
    const params = month && year ? { month, year } : {};
    const response = await api.get<Interview[]>('/interviews/calendar/', { params });
    return response.data;
  },

  getStats: async (): Promise<InterviewStats> => {
    const response = await api.get<InterviewStats>('/interviews/stats/');
    return response.data;
  },
};

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/');
    return response.data;
  },
};

export default api;
