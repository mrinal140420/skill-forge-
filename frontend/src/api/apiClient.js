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
  getAll: (params = {}) =>
    apiClient.get('/courses', { params }),
  getById: (id) => apiClient.get(`/courses/${id}`),
  create: (course) => apiClient.post('/courses', course),
};

// Enrollments APIs
export const enrollmentsAPI = {
  enroll: (courseId) =>
    apiClient.post('/enrollments', { courseId }),
  getMyEnrollments: () => apiClient.get('/enrollments/me'),
  getById: (id) => apiClient.get(`/enrollments/${id}`),
};

// Progress APIs
export const progressAPI = {
  markComplete: (courseId, moduleId) =>
    apiClient.post('/progress/complete', { courseId, moduleId }),
  getMyProgress: () => apiClient.get('/progress/me'),
  submitQuiz: (courseId, moduleId, answers, timeTakenSec) =>
    apiClient.post('/quiz/submit', {
      courseId,
      moduleId,
      answers,
      timeTakenSec,
    }),
};

// Recommendations APIs
export const recommendationsAPI = {
  getRecommendations: () =>
    apiClient.get('/recommendations/me'),
};
