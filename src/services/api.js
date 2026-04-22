import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prathy_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Drug / Food lists ────────────────────────────────────────
export const getDrugs = async () => {
  const response = await api.get('/drugs');
  return response.data.drugs;
};

export const getFoods = async () => {
  const response = await api.get('/foods');
  return response.data.foods;
};

// ── Prediction ───────────────────────────────────────────────
export const predictInteraction = async (drug, food, age, weight, diseases = []) => {
  const response = await api.post('/predict', { drug, food, age, weight, diseases });
  return response.data;
};

// ── History (FIX: reads from MongoDB, falls back to localStorage) ──
export const getHistory = async () => {
  try {
    const response = await api.get('/interactions');
    return response.data.data || [];
  } catch {
    const raw = localStorage.getItem('prathy_history');
    return raw ? JSON.parse(raw) : [];
  }
};

export const saveToHistory = (result) => {
  // Keep a local backup copy as well
  const raw = localStorage.getItem('prathy_history');
  const history = raw ? JSON.parse(raw) : [];
  history.unshift({ ...result, id: result.id || Date.now() });
  localStorage.setItem('prathy_history', JSON.stringify(history.slice(0, 50)));
};

// ── Auth (FIX: now calls real Express endpoints) ─────────────
export const authService = {
  login: async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required.');
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  signup: async (name, email, password) => {
    if (!name || !email || !password) throw new Error('All fields are required.');
    const res = await api.post('/auth/signup', { name, email, password });
    return res.data;
  },
};

export default api;
