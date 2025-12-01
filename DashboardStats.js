import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardStats = ({ stats }) => {
  const navigate = useNavigate();

  // ADDED: Function to navigate to homepage
  const handleBackToHome = () => {
    navigate('/'); // Navigates to the homepage
  };

  return (
    <div className="dashboard-stats">
      {/* ADDED: Home button */}
      <button 
        className="home-btn"
        onClick={handleBackToHome}
        title="Go back to homepage"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          zIndex: '10'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        🏠 Home
      </button>
      
      <div className="stat-card">
        <h3>Active Jobs</h3>
        <p>{stats.activeJobs}</p>
      </div>
      <div className="stat-card">
        <h3>Total Applicants</h3>
        <p>{stats.totalApplicants}</p>
      </div>
      <div className="stat-card">
        <h3>Interview Ready</h3>
        <p>{stats.interviewReady}</p>
      </div>
    </div>
  );
};

export default DashboardStats;