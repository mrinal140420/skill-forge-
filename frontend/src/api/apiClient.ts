import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from store or localStorage
    const token = useAuthStore.getState().token || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth
      useAuthStore.getState().logout();
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;


// Auth APIs
export const authAPI = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  me: () => apiClient.get('/auth/me'),
};

// Courses APIs
export const coursesAPI = {
  getAll: () => apiClient.get('/api/courses'),
  getById: (id) => apiClient.get(`/api/courses/${id}`),
  getEnrolled: () => apiClient.get('/api/my-courses'),
  enroll: (courseId) => apiClient.post(`/api/courses/${courseId}/enroll`),
};

// Learning APIs
export const learningAPI = {
  getLearning: (courseId, moduleId) =>
    apiClient.get(`/api/learning/${courseId}/${moduleId}`),
  submitProgress: (courseId, moduleId, progress) =>
    apiClient.post(`/api/learning/${courseId}/${moduleId}/progress`, {
      progress,
    }),
};

// Quiz APIs
export const quizAPI = {
  getQuiz: (courseId, moduleId) =>
    apiClient.get(`/api/quiz/${courseId}/${moduleId}`),
  submitQuiz: (courseId, moduleId, answers) =>
    apiClient.post(`/api/quiz/${courseId}/${moduleId}/submit`, { answers }),
};
