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

// Simple in-memory cache for configuration endpoints
let scoringConfigCache: { data: any; ts: number } | null = null;
const SCORING_CONFIG_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Ensure we have a valid token (refresh if needed) before sending the request
    const token = await authService.ensureValidAccessToken();
    // Axios v1 may use AxiosHeaders; set header safely without violating types
    if (token) {
      if ((config.headers as any)?.set) {
        (config.headers as any).set('Authorization', `Bearer ${token}`);
      } else {
        (config.headers as any) = {
          ...(config.headers as any),
          Authorization: `Bearer ${token}`,
        };
      }
    } else if ((config.headers as any)) {
      if ((config.headers as any).set) {
        (config.headers as any).set('Authorization', undefined as any);
      } else if ((config.headers as any).Authorization) {
        delete (config.headers as any).Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
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

  getFunnelStats: async (year?: string, month?: string): Promise<any> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get('/candidates/funnel_stats/', { params });
    return response.data;
  },

  getAverageTimePerStage: async (year?: string, month?: string): Promise<any> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get('/candidates/average_time_per_stage/', { params });
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

  getScoringConfig: async (): Promise<any> => {
    const now = Date.now();
    if (scoringConfigCache && now - scoringConfigCache.ts < SCORING_CONFIG_TTL_MS) {
      return scoringConfigCache.data;
    }
    const response = await api.get('/candidates/scoring_config/');
    scoringConfigCache = { data: response.data, ts: now };
    return response.data;
  },

  updateScoringConfig: async (weights: any): Promise<any> => {
    const response = await api.post('/candidates/update_scoring_config/', { weights });
    return response.data;
  },

  resetScoringConfig: async (): Promise<any> => {
    const response = await api.post('/candidates/reset_scoring_config/');
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

export const positionsAPI = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/positions/');
    return response.data;
  },
};

export const questionnaireApi = {
  // Templates
  getTemplates: async (): Promise<any[]> => {
    const response = await api.get('/questionnaires/');
    return response.data;
  },

  getTemplate: async (id: number): Promise<any> => {
    const response = await api.get(`/questionnaires/${id}/`);
    return response.data;
  },

  getActiveTemplate: async (positionKey: string): Promise<any> => {
    const response = await api.get('/questionnaires/active/', {
      params: { position_key: positionKey },
    });
    return response.data;
  },

  getStepsForPosition: async (positionKey: string): Promise<any> => {
    const response = await api.get('/questionnaires/steps-for-position/', {
      params: { position_key: positionKey },
    });
    return response.data;
  },

  createTemplate: async (data: any): Promise<any> => {
    const response = await api.post('/questionnaires/', data);
    return response.data;
  },

  updateTemplate: async (id: number, data: any): Promise<any> => {
    const response = await api.patch(`/questionnaires/${id}/`, data);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/questionnaires/${id}/`);
  },

  activateTemplate: async (id: number): Promise<any> => {
    const response = await api.post(`/questionnaires/${id}/activate/`);
    return response.data;
  },

  deactivateTemplate: async (id: number): Promise<any> => {
    const response = await api.post(`/questionnaires/${id}/deactivate/`);
    return response.data;
  },

  updateTemplateStep: async (id: number, stepNumber: number): Promise<any> => {
    const response = await api.post(`/questionnaires/${id}/update_step/`, {
      step_number: stepNumber,
    });
    return response.data;
  },

  getTemplateStats: async (id: number): Promise<any> => {
    const response = await api.get(`/questionnaires/${id}/stats/`);
    return response.data;
  },

  // Questions
  getQuestions: async (templateId?: number): Promise<any[]> => {
    const params = templateId ? { template_id: templateId } : {};
    const response = await api.get('/questions/', { params });
    return response.data;
  },

  createQuestion: async (data: any): Promise<any> => {
    const response = await api.post('/questions/', data);
    return response.data;
  },

  updateQuestion: async (id: number, data: any): Promise<any> => {
    const response = await api.patch(`/questions/${id}/`, data);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}/`);
  },

  // Options
  getOptions: async (questionId?: number): Promise<any[]> => {
    const params = questionId ? { question_id: questionId } : {};
    const response = await api.get('/question-options/', { params });
    return response.data;
  },

  createOption: async (data: any): Promise<any> => {
    const response = await api.post('/question-options/', data);
    return response.data;
  },

  updateOption: async (id: number, data: any): Promise<any> => {
    const response = await api.patch(`/question-options/${id}/`, data);
    return response.data;
  },

  deleteOption: async (id: number): Promise<void> => {
    await api.delete(`/question-options/${id}/`);
  },

  // Responses
  submitResponse: async (data: any): Promise<any> => {
    const response = await api.post('/questionnaire-responses/submit/', data);
    return response.data;
  },

  getResponses: async (params?: any): Promise<any[]> => {
    const response = await api.get('/questionnaire-responses/', { params });
    return response.data;
  },

  getResponse: async (id: number): Promise<any> => {
    const response = await api.get(`/questionnaire-responses/${id}/`);
    return response.data;
  },

  // Analytics
  getAnalyticsByPosition: async (positionKey?: string): Promise<any[]> => {
    const params = positionKey ? { position_key: positionKey } : {};
    const response = await api.get('/questionnaire-responses/analytics/by-position/', { params });
    return response.data;
  },

  getOptionDistribution: async (questionId: number): Promise<any[]> => {
    const response = await api.get('/questionnaire-responses/analytics/option-distribution/', {
      params: { question_id: questionId },
    });
    return response.data;
  },
};

export default api;
