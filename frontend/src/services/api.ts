import axios from 'axios';

export const api = axios.create({
  baseURL: "https://radha-2-74si.onrender.com", // ✅ FIXED
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const stateStr = localStorage.getItem('auth-storage');
  if (stateStr) {
    try {
      const state = JSON.parse(stateStr).state;
      if (state && state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'The request timed out. Please check backend connection.';
    } else if (!error.response) {
      error.message = 'Network error: Cannot reach backend.';
    }
    return Promise.reject(error);
  }
);
