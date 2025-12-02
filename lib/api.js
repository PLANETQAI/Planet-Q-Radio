import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

console.log('API Client: Base URL set to', process.env.NEXT_PUBLIC_BASE_URL);

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('API Client: Received 401 Unauthorized. Logging out.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
