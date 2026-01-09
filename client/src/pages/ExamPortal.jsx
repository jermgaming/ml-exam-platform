import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ExamPortal = () => {
  const { logout, user } = useAuth();
  const [showProblem, setShowProblem] = useState(true);

  // Use the link you provided or a local JupyterLite build
  const JUPYTER_ENV_URL = "https://piyushmtech2252.github.io/mle-exam/lab/index.html";

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <header style={{ background: '#333', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>ML Exam - Student View</span>

        {/* Student Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.95em' }}>{user?.name || 'Student'}</div>
            <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{user?.rollNumber || ''}</div>
          </div>

          <button
            onClick={() => alert("Please download your .ipynb file from the notebook and email it to submit.")}
            style={{ padding: '8px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Finish & Submit
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Panel: Question Paper with Toggle */}
        <div style={{
          width: showProblem ? '25%' : '40px',
          transition: 'width 0.3s ease',
          borderRight: '2px solid #ddd',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Toggle Button */}
          <button
            onClick={() => setShowProblem(!showProblem)}
            style={{
              padding: '10px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderBottom: '1px solid #ddd',
              cursor: 'pointer',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {showProblem ? '◀ Hide' : '▶'}
          </button>

          {/* Problem Content */}
          {showProblem && (
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <h3 style={{ marginTop: 0 }}>Problem Statement</h3>
              <p>Load the Iris dataset and perform classification using Random Forest.</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>1. Load Data</li>
                <li>2. Preprocess</li>
                <li>3. Train Model</li>
                <li>4. Calculate Accuracy</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Panel: JupyterLite Environment */}
        <div style={{ flex: 1 }}>
          <iframe
            src={JUPYTER_ENV_URL}
            title="Coding Environment"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamPortal;