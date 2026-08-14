import { Navigate, Route, Routes } from 'react-router-dom';

import { RootLayout } from '@/components/layout/RootLayout';
import CreateProjectPage from '@/pages/CreateProjectPage';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import ProjectDetailsPage from '@/pages/ProjectDetailsPage';
import ProjectsPage from '@/pages/ProjectsPage';
import RegisterPage from '@/pages/RegisterPage';
import ScanDetailsPage from '@/pages/ScanDetailsPage';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

function PlaceholderPage({ title }: { title: string }) {
  return <div>{title}</div>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/projects/:projectId/scans/:scanId" element={<ScanDetailsPage />} />
          <Route path="/analysis" element={<PlaceholderPage title="Analysis" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>

      <Route path="*" element={<PlaceholderPage title="404 Not Found" />} />
    </Routes>
  );
}