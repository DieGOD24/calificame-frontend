import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Tasks
export const getTasks = (taskType?: string, status?: string) =>
  api.get('/tasks', { params: { task_type: taskType, status } });
export const getTask = (taskId: string) => api.get(`/tasks/${taskId}`);
export const cancelTask = (taskId: string) => api.delete(`/tasks/${taskId}`);

// Institutions
export const getInstitutions = () => api.get('/institutions');
export const createInstitution = (data: { name: string; slug: string; logo_url?: string; primary_color?: string }) =>
  api.post('/institutions', data);
export const getInstitution = (id: string) => api.get(`/institutions/${id}`);
export const updateInstitution = (id: string, data: Record<string, unknown>) =>
  api.put(`/institutions/${id}`, data);
export const deleteInstitution = (id: string) => api.delete(`/institutions/${id}`);
export const getInstitutionMembers = (id: string) => api.get(`/institutions/${id}/members`);
export const inviteMember = (id: string, data: { email: string; role: string }) =>
  api.post(`/institutions/${id}/members/invite`, data);
export const acceptInvitation = (token: string) =>
  api.post(`/institutions/invitations/${token}/accept`);
export const removeMember = (institutionId: string, memberId: string) =>
  api.delete(`/institutions/${institutionId}/members/${memberId}`);

// Analytics
export const getProjectAnalytics = (projectId: string) =>
  api.get(`/analytics/projects/${projectId}`);
export const getStudentProgress = (studentId: string) =>
  api.get(`/analytics/students/${studentId}`);
export const getInstitutionAnalytics = (id: string) =>
  api.get(`/analytics/institutions/${id}`);

// PDF Generator
export const analyzePdfImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  return api.post('/pdf-generator/analyze', formData);
};
export const cropImage = (file: File, x: number, y: number, width: number, height: number) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/pdf-generator/crop?x=${x}&y=${y}&width=${width}&height=${height}`, formData);
};
export const generatePdf = (files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  return api.post('/pdf-generator/generate', formData, { responseType: 'blob' });
};

// Admin
export const listUsers = () => api.get('/auth/users');
export const updateUserRole = (userId: string, role: string) =>
  api.patch(`/auth/users/${userId}/role`, { role });
