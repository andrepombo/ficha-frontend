import axios from 'axios';
import { Candidate, CandidateStats } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.patch<Candidate>(`/candidates/${id}/`, { status });
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
