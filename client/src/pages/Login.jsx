import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ rollNumber: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/exam');
    } catch (err) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>ML Exam Portal Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" placeholder="Roll Number / Admin ID" 
          onChange={e => setFormData({...formData, rollNumber: e.target.value})} 
        />
        <br /><br />
        <input 
          type="password" placeholder="Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} 
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;