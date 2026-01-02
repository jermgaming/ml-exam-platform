import React from 'react';

const ExamPortal = () => {
  // Use the link you provided or a local JupyterLite build
  const JUPYTER_ENV_URL = "https://piyushmtech2252.github.io/mle_exam_kiet/lab/index.html"; 

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <header style={{ background: '#333', color: '#fff', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>ML Exam - Student View</span>
        <button onClick={() => alert("Please download your .ipynb file from the notebook and email it to submit.")}>
          Finish & Submit
        </button>
      </header>
      
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Panel: Question Paper */}
        <div style={{ width: '25%', padding: '20px', borderRight: '2px solid #ddd', overflowY: 'scroll' }}>
          <h3>Problem Statement</h3>
          <p>Load the Iris dataset and perform classification using Random Forest.</p>
          <ul>
            <li>1. Load Data</li>
            <li>2. Preprocess</li>
            <li>3. Train Model</li>
            <li>4. Calculate Accuracy</li>
          </ul>
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