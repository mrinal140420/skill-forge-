import apiClient from './apiClient';

export const adminAPI = {
  getSuperDashboard: () => apiClient.get('/api/admin/dashboard/summary'),
  getCourseAdminDashboard: () => apiClient.get('/api/admin/course-admin/dashboard/summary'),
  getUsers: () => apiClient.get('/api/admin/users'),
  getMyCourses: () => apiClient.get('/api/admin/my-courses'),
  updateCourse: (courseId: number | string, payload: any) =>
    apiClient.put(`/api/admin/courses/${courseId}`, payload),
  createInstructor: (name: string, email: string) =>
    apiClient.post('/api/admin/create-instructor', { name, email }),
  createStudent: (name: string, email: string) =>
    apiClient.post('/api/admin/create-student', { name, email }),
  createUser: (name: string, email: string, role: string) =>
    apiClient.post('/api/admin/create-user', { name, email, role }),
  deleteUser: (userId: number | string) =>
    apiClient.delete(`/api/admin/users/${userId}`),
  deleteInstructor: (instructorId: number | string) =>
    apiClient.delete(`/api/admin/instructor/${instructorId}`),
  assignCourseAdmin: (userId: number | string, courseId: number | string) =>
    apiClient.post(`/api/admin/assign-course-admin/${userId}/${courseId}`),
  getDoubts: (courseId?: number | string) =>
    apiClient.get('/api/admin/doubts', { params: courseId ? { courseId } : {} }),
  replyToDoubt: (doubtId: number | string, reply: string) =>
    apiClient.post(`/api/admin/doubts/${doubtId}/reply`, { reply }),
};

export const doubtsAPI = {
  submit: (payload: {
    courseId: number;
    title: string;
    description: string;
    moduleId?: string;
  }) => apiClient.post('/api/doubts', payload),
  getMine: () => apiClient.get('/api/doubts'),
};
