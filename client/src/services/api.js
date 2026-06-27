import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-trip-risk-briefing-t4.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token if it exists in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('manivtha_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated states
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if necessary
      localStorage.removeItem('manivtha_token');
      // For general app layout, let Context handle user reset
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const aiService = {
  generateBriefing: async (briefingData) => {
    // briefingData format: { adminName, routeFrom, routeTo, season, vehicleType, duration, notes, selectedModel, lowTokenMode }
    const response = await api.post('/generate', briefingData);
    return response.data;
  }
};

export const historyService = {
  getAllHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },
  getHistoryById: async (id) => {
    const response = await api.get(`/history/${id}`);
    return response.data;
  },
  deleteHistoryById: async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  },
  clearAllHistory: async () => {
    const response = await api.delete('/history');
    return response.data;
  }
};

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    // feedbackData format: { generationId, rating, liked, comment }
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  }
};

export const analyticsService = {
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  }
};

export const templateService = {
  getTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },
  createTemplate: async (templateData) => {
    // templateData format: { templateName, routeFrom, routeTo, season, vehicleType }
    const response = await api.post('/templates', templateData);
    return response.data;
  }
};

export default api;
