import api from './api';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me')
};

export const requestApi = {
  create: (formData) => api.post('/requests', formData),
  list: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  update: (id, formData) => api.put(`/requests/${id}`, formData),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  getDashboard: () => api.get('/requests/dashboard')
};

export const departmentApi = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
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
  getEmployees: () => api.get('/system/employees'),
  getModules: () => api.get('/modules'),
  getSettings: () => api.get('/system/settings'),
  updateSettings: (data) => api.put('/system/settings', data),
  sendTestEmail: (target_email) => api.post('/system/settings/test-email', { target_email }),
  getUsers: () => api.get('/system/users'),
  updateUser: (id, data) => api.put(`/system/users/${id}`, data),
  deleteUser: (id) => api.delete(`/system/users/${id}`)
};
