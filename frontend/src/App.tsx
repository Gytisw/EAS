import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';
import TaskConfigsListPage from './pages/TaskConfigsPage/TaskConfigsListPage';
import TaskConfigFormPage from './pages/TaskConfigsPage/TaskConfigFormPage';
import SchedulesListPage from './pages/SchedulesPage/SchedulesListPage';
import ScheduleFormPage from './pages/SchedulesPage/ScheduleFormPage';
import './App.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading application...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


const AppNavigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      {isAuthenticated && <Link to="/task-configs" style={{ marginRight: '10px' }}>Task Configs</Link>}
      {isAuthenticated && <Link to="/schedules" style={{ marginRight: '10px' }}>Schedules</Link>}
      {!isAuthenticated && <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>}
      {isAuthenticated && (
        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline', padding: '0', fontSize: 'inherit', marginLeft: '10px' }}>
          Logout
        </button>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavigation />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />
          
          {/* TaskConfigs Routes */}
          <Route path="/task-configs" element={
            <ProtectedRoute>
              <TaskConfigsListPage />
            </ProtectedRoute>
          } />
          <Route path="/task-configs/new" element={
            <ProtectedRoute>
              <TaskConfigFormPage />
            </ProtectedRoute>
          } />
          <Route path="/task-configs/:id/edit" element={
            <ProtectedRoute>
              <TaskConfigFormPage />
            </ProtectedRoute>
          } />

          {/* Schedules Routes */}
          <Route path="/schedules" element={
            <ProtectedRoute>
              <SchedulesListPage />
            </ProtectedRoute>
          } />
          <Route path="/schedules/new" element={
            <ProtectedRoute>
              <ScheduleFormPage />
            </ProtectedRoute>
          } />
          <Route path="/schedules/:id/edit" element={
            <ProtectedRoute>
              <ScheduleFormPage />
            </ProtectedRoute>
          } />
          {/* Add other routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
