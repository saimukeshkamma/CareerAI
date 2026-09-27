import axios from 'axios';
import {
  User, Resume, Job, MatchBreakdown,
  SkillGapItem, Interview, InterviewHistoryItem,
  DashboardData, AnalyticsData, NotificationItem
} from '../types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerai_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        // Only redirect if on protected page
        // localStorage.removeItem('careerai_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  demoLogin: async (userId: number = 1) => {
    const res = await apiClient.post(`/auth/demo-login/${userId}`);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: { email: string; new_password: string }) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },
  googleAuth: async (googleData: { credential?: string; email?: string; name?: string; picture?: string }) => {
    const res = await apiClient.post('/auth/google', googleData);
    return res.data;
  }
};

// Resumes endpoints
export const resumeApi = {
  upload: async (file: File, title?: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const res = await apiClient.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },
  list: async (): Promise<Resume[]> => {
    const res = await apiClient.get('/resumes');
    return res.data;
  },
  get: async (id: number): Promise<Resume> => {
    const res = await apiClient.get(`/resumes/${id}`);
    return res.data;
  },
  activate: async (id: number) => {
    const res = await apiClient.post(`/resumes/${id}/activate`);
    return res.data;
  },
  analyze: async (id: number) => {
    const res = await apiClient.post(`/resumes/${id}/analyze`);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/resumes/${id}`);
    return res.data;
  }
};

// Jobs endpoints
export const jobApi = {
  list: async (params?: { q?: string; work_type?: string; experience_level?: string; industry?: string }): Promise<Job[]> => {
    const res = await apiClient.get('/jobs', { params });
    return res.data;
  },
  get: async (id: number): Promise<Job> => {
    const res = await apiClient.get(`/jobs/${id}`);
    return res.data;
  },
  getMatch: async (id: number): Promise<MatchBreakdown> => {
    const res = await apiClient.get(`/jobs/${id}/match`);
    return res.data;
  },
  toggleSave: async (id: number): Promise<{ saved: boolean; message: string }> => {
    const res = await apiClient.post(`/jobs/${id}/save`);
    return res.data;
  },
  getSaved: async (): Promise<{ saved_id: number; saved_at: string; job: Job }[]> => {
    const res = await apiClient.get('/jobs/saved/all');
    return res.data;
  }
};

// Skills endpoints
export const skillApi = {
  getGaps: async (role?: string): Promise<{
    target_role: string;
    user_skills_identified: string[];
    total_skills_count: number;
    missing_skills_count: number;
    gaps: SkillGapItem[];
  }> => {
    const res = await apiClient.get('/skills/gaps', { params: { role } });
    return res.data;
  }
};

// Interviews endpoints
export const interviewApi = {
  create: async (data: { role: string; interview_type: string; difficulty: string }): Promise<Interview> => {
    const res = await apiClient.post('/interviews', data);
    return res.data;
  },
  list: async (): Promise<InterviewHistoryItem[]> => {
    const res = await apiClient.get('/interviews');
    return res.data;
  },
  get: async (id: number): Promise<Interview> => {
    const res = await apiClient.get(`/interviews/${id}`);
    return res.data;
  },
  submitAnswer: async (interviewId: number, questionId: number, data: { user_answer: string; is_audio?: boolean; audio_duration?: number }) => {
    const res = await apiClient.post(`/interviews/${interviewId}/questions/${questionId}/answer`, data);
    return res.data;
  },
  complete: async (interviewId: number): Promise<Interview> => {
    const res = await apiClient.post(`/interviews/${interviewId}/complete`);
    return res.data;
  }
};

// Dashboard & Analytics endpoints
export const analyticsApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await apiClient.get('/analytics');
    return res.data;
  }
};

// AI Assistant endpoint
export const assistantApi = {
  chat: async (message: string, history: any[] = []) => {
    const res = await apiClient.post('/assistant/chat', { message, history });
    return res.data;
  }
};

// Notifications endpoints
export const notificationApi = {
  list: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await apiClient.post(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.post('/notifications/read-all');
    return res.data;
  }
};

// Profile endpoints
export const profileApi = {
  update: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put('/users/profile', data);
    return res.data;
  },
  deleteAccount: async () => {
    const res = await apiClient.delete('/users/account');
    return res.data;
  }
};
