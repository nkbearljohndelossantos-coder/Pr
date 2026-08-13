import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';

// Pages
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

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><RequestListPage /></ProtectedRoute>} />
            <Route path="/requests/new" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
            <Route path="/requests/:id/edit" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
            <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><DepartmentManagementPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
            <Route path="/master-data" element={<ProtectedRoute><MasterDataManagerPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/backups" element={<ProtectedRoute><BackupPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
