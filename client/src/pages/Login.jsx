import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ rollNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', formData);
      login(res.data.token);

      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/exam');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>ML Exam Portal Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Roll Number / Admin ID"
          value={formData.rollNumber}
          onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
        />
        <br /><br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;