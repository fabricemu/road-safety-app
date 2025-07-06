import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './layouts/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LearnerDashboard } from './components/learner/LearnerDashboard';
import HomePage from './pages/HomePage';
import LessonsPage from './pages/LessonsPage';
import LessonDetailPage from './pages/LessonDetailPage';
import QuizPage from './pages/QuizPage';
import QuizDetailPage from './pages/QuizDetailPage';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Auth Pages Component
const AuthPages: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Store last visited route
  useEffect(() => {
    if (!['/auth/login', '/auth/register'].includes(location.pathname)) {
      localStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname]);

  // On app load, if authenticated, redirect to last route
  useEffect(() => {
    if (isAuthenticated) {
      const lastRoute = localStorage.getItem('lastRoute');
      if (lastRoute && lastRoute !== location.pathname && !['/auth/login', '/auth/register'].includes(lastRoute)) {
        navigate(lastRoute, { replace: true });
      }
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/*" element={<AuthPages />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              {isAdmin ? <AdminDashboard /> : <LearnerDashboard />}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Learner Routes */}
      <Route
        path="/lessons"
        element={
          <ProtectedRoute>
            <Layout>
              <LessonsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <LessonDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Layout>
              <QuizPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <QuizDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
