import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard = ({ token }) => {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      setStudents(res.data.students);
    } catch (err) {
      alert('Upload Failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
        <h3>1. Upload Student Excel</h3>
        <p>Excel format: Columns "Name" and "RollNumber"</p>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Generates Credentials</button>
      </div>

      {students.length > 0 && (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Generated Password (COPY THIS)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={idx}>
                <td>{s.name}</td>
                <td>{s.rollNumber}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;