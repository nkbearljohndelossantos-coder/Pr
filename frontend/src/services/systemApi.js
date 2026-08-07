import api from './api';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me')
};

export const requestApi = {
  create: (formData) => api.post('/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  getDashboard: () => api.get('/requests/dashboard')
};

export const departmentApi = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  resetPassword: (id, data) => api.post(`/departments/${id}/reset-password`, data)
};

export const reportApi = {
  exportExcel: (params) => api.get('/system/reports/excel', { params, responseType: 'blob' }),
  exportCsv: (params) => api.get('/system/reports/csv', { params, responseType: 'blob' })
};

export const systemApi = {
  getNotifications: () => api.get('/system/notifications'),
  markNotificationRead: (id) => api.put(`/system/notifications/${id}/read`),
  getAuditLogs: (params) => api.get('/system/audit-logs', { params }),
  getBackups: () => api.get('/system/backups'),
  createBackup: () => api.post('/system/backups'),
  getMasterData: (category) => api.get('/system/master-data', { params: { category } }),
  addMasterData: (data) => api.post('/system/master-data', data),
  toggleMasterData: (id, is_active) => api.put(`/system/master-data/${id}/toggle`, { is_active }),
  getModules: () => api.get('/modules')
};
