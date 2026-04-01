import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CreateStartup } from './pages/startup/CreateStartup';
import { ResultsPage } from './pages/startup/ResultsPage';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isApproved } = useAuthStore();
  if (!token || !isApproved) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <CreateStartup />
            </ProtectedRoute>
          } />
          <Route path="/results/:id" element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
