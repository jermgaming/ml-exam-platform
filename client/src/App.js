import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ExamPortal from './pages/ExamPortal';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Helper to check role
  const getRole = () => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).user.role;
    } catch (e) { return null; }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} />} />
        
        <Route path="/admin" element={
          getRole() === 'admin' ? <AdminDashboard token={token} /> : <Navigate to="/" />
        } />
        
        <Route path="/exam" element={
          getRole() === 'student' ? <ExamPortal /> : <Navigate to="/" />
        } />
      </Routes>
    </Router>
  );
}

export default App;