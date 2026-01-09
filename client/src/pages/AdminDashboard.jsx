import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Calculate Stats (Memoized for performance)
  const stats = useMemo(() => {
    const total = students.length;
    const online = students.filter(s => s.isOnline).length;
    return { total, online };
  }, [students]);

  // Fetch Live Status - wrapped in useCallback to fix dependency warning
  const fetchLiveStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveStatus]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload Successful! Credentials generated.');
      // Fetch fresh data to get correct isOnline status
      await fetchLiveStatus();
    } catch (err) {
      console.error(err);
      alert('Upload Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#f8f9fa', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <strong>Active Students: </strong>
            <span style={{ color: 'green', fontSize: '1.2em' }}>{stats.online}</span> / {stats.total}
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div style={{ background: '#fff', border: '1px solid #e1e4e8', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>📂 Upload Student Excel</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="file" accept=".xlsx, .xls" onChange={e => setFile(e.target.files[0])} />
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{ padding: '8px 16px', cursor: uploading ? 'not-allowed' : 'pointer', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            {uploading ? 'Generating...' : 'Generate Credentials'}
          </button>
        </div>
        <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
          Required Columns: <strong>Name</strong>, <strong>RollNumber</strong>
        </p>
      </div>

      {/* Monitor Section */}
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Live Monitor</h3>
        <button
          onClick={fetchLiveStatus}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Live Status'}
        </button>
      </div>

      {/* Data Table */}
      {students.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Roll Number</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Password</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s._id || idx} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    backgroundColor: s.isOnline ? '#d4edda' : '#f8d7da',
                    color: s.isOnline ? '#155724' : '#721c24'
                  }}>
                    {s.isOnline ? '● Online' : '○ Offline'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{s.name}</td>
                <td style={{ padding: '12px' }}>{s.rollNumber}</td>
                <td style={{ padding: '12px', fontFamily: 'monospace', color: '#d63384' }}>
                  {s.password}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888', border: '2px dashed #ddd' }}>
          No students found. Upload an Excel file to begin.
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;