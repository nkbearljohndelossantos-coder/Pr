import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestListPage from './pages/RequestListPage';
import RequestDetailPage from './pages/RequestDetailPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import MasterDataManagerPage from './pages/MasterDataManagerPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import BackupPage from './pages/BackupPage';
import SettingsPage from './pages/SettingsPage';
import RuleDesignerPage from './pages/RuleDesignerPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="requests/new" element={<CreateRequestPage />} />
              <Route path="requests/my" element={<RequestListPage mineOnly />} />
              <Route path="requests/all" element={<RequestListPage mineOnly={false} />} />
              <Route path="requests/:id" element={<RequestDetailPage />} />
              <Route path="departments" element={<ProtectedRoute allowedRoles={['admin']}><DepartmentManagementPage /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
              <Route path="master-data" element={<ProtectedRoute allowedRoles={['admin']}><MasterDataManagerPage /></ProtectedRoute>} />
              <Route path="rules" element={<ProtectedRoute allowedRoles={['admin']}><RuleDesignerPage /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'executive']}><ReportsPage /></ProtectedRoute>} />
              <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogsPage /></ProtectedRoute>} />
              <Route path="backups" element={<ProtectedRoute allowedRoles={['admin']}><BackupPage /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
