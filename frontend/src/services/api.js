import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT interceptor — attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smogguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smogguard_token');
      localStorage.removeItem('smogguard_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ─── AQI ─────────────────────────────────────────────────────────────────────
export const getCurrentAQI = (city) => api.get(`/aqi/current?city=${encodeURIComponent(city)}`);
export const getAQIForecast = (city) => api.get(`/aqi/forecast?city=${encodeURIComponent(city)}`);
export const getAQIHistory = (city, days) => api.get(`/aqi/history?city=${encodeURIComponent(city)}&days=${days}`);

// ─── Assistant ───────────────────────────────────────────────────────────────
export const sendMessage = (data) => api.post('/assistant/chat', data);
export const getConversations = () => api.get('/assistant/conversations');
export const getMessages = (convId) => api.get(`/assistant/conversations/${convId}/messages`);

// ─── Planner ─────────────────────────────────────────────────────────────────
export const generateRoutine = (data) => api.post('/planner/generate', data);
export const getRoutines = () => api.get('/planner/routines');

// ─── Impact ──────────────────────────────────────────────────────────────────
export const getImpactSummary = () => api.get('/impact/summary');
export const logImpact = (data) => api.post('/impact/log', data);

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const checkAlerts = () => api.get('/alerts/check');
export const getAlertPrefs = () => api.get('/alerts/preferences');
export const updateAlertPrefs = (data) => api.put('/alerts/preferences', data);

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');

export default api;
