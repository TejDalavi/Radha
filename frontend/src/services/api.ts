import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
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
      error.message = 'The request timed out. Please ensure the backend is running and check your connection.';
    } else if (!error.response) {
      error.message = 'Network error: Cannot reach the backend server. Is it running on port 8000?';
    }
    return Promise.reject(error);
  }
);
