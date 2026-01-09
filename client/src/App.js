import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ExamPortal from './pages/ExamPortal';

// Protected Route Components
const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace />;
};

const StudentRoute = ({ children }) => {
  const { isStudent } = useAuth();
  return isStudent ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();
  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isStudent) return <Navigate to="/exam" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />

      <Route path="/exam" element={
        <StudentRoute>
          <ExamPortal />
        </StudentRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;