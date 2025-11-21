import axios from 'axios';
import { Checklist, CreateChecklistData, UpdateChecklistData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const authService = {
  getCurrentUser: async () => {
    const response = await api.get('/auth/current');
    return response.data;
  },

  login: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  logout: async () => {
    await api.get('/auth/logout');
  },
};

export const checklistService = {
  getAll: async (): Promise<Checklist[]> => {
    const response = await api.get('/api/checklists');
    return response.data;
  },

  getById: async (id: string): Promise<Checklist> => {
    const response = await api.get(`/api/checklists/${id}`);
    return response.data;
  },

  create: async (data: CreateChecklistData): Promise<Checklist> => {
    const response = await api.post('/api/checklists', data);
    return response.data;
  },

  update: async (id: string, data: UpdateChecklistData): Promise<Checklist> => {
    const response = await api.put(`/api/checklists/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/checklists/${id}`);
  },

  share: async (id: string, userIds: string[]): Promise<Checklist> => {
    const response = await api.post(`/api/checklists/${id}/share`, { userIds });
    return response.data;
  },
};

export default api;
