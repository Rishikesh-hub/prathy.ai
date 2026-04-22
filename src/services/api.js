import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prathy_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ──────────────────────────────────────────────
// BACKEND-CONNECTED INTERACTION SERVICE
// ──────────────────────────────────────────────

export const getDrugs = async () => {
  const response = await api.get('/drugs');
  return response.data.drugs;
};

export const getFoods = async () => {
  const response = await api.get('/foods');
  return response.data.foods;
};

export const predictInteraction = async (drug, food, age, weight, diseases = []) => {
  const response = await api.post('/predict', { drug, food, age, weight, diseases });
  return response.data;
};

export const getHistory = async () => {
  await new Promise(r => setTimeout(r, 600));
  const raw = localStorage.getItem('prathy_history');
  return raw ? JSON.parse(raw) : [];
};

export const saveToHistory = (result) => {
  const raw = localStorage.getItem('prathy_history');
  const history = raw ? JSON.parse(raw) : [];
  history.unshift({ ...result, id: Date.now() });
  localStorage.setItem('prathy_history', JSON.stringify(history.slice(0, 50)));
};

// ──────────────────────────────────────────────
// API Methods
// ──────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    await new Promise(r => setTimeout(r, 800));
    if (!email || !password) throw new Error('Email and password are required.');
    const mockUser = {
      id: 'usr_' + Math.random().toString(36).slice(2),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      age: null, gender: null, weight: null, conditions: [], allergies: [],
    };
    return { user: mockUser, token: 'mock_jwt_' + Date.now() };
  },

  signup: async (name, email, password) => {
    await new Promise(r => setTimeout(r, 1000));
    if (!name || !email || !password) throw new Error('All fields are required.');
    const mockUser = { id: 'usr_' + Math.random().toString(36).slice(2), name, email, age: null, gender: null, weight: null, conditions: [], allergies: [] };
    return { user: mockUser, token: 'mock_jwt_' + Date.now() };
  },
};

export default api;
