import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    apiClient.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get('/api/auth/me'),
};

// ---- Chat ----
export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    apiClient.post('/api/chat/message', { message, sessionId }),
  getHistory: (sessionId: string) =>
    apiClient.get(`/api/chat/history/${sessionId}`),
};

// ---- Board ----
export const boardApi = {
  getPosts: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/api/board/posts', { params }),
  getPost: (id: string) => apiClient.get(`/api/board/posts/${id}`),
  createPost: (data: { title: string; content: string }) =>
    apiClient.post('/api/board/posts', data),
  createReply: (postId: string, content: string) =>
    apiClient.post(`/api/board/posts/${postId}/reply`, { content }),
  deletePost: (id: string) => apiClient.delete(`/api/board/posts/${id}`),
};

// ---- Dashboard ----
export const dashboardApi = {
  getStats: () => apiClient.get('/api/dashboard/stats'),
  getActivity: (days?: number) => apiClient.get('/api/dashboard/activity', { params: { days } }),
  getTopUsers: () => apiClient.get('/api/dashboard/top-users'),
  getRecentActivity: () => apiClient.get('/api/dashboard/recent-activity'),
};
