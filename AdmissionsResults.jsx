import React from 'react';

const AdmissionsResults = ({ student }) => {
  return (
    <div className="admissions-results-container">
      <div className="header-section">
        <h2>Admissions Results</h2>
        <p className="subtitle">View your admission offers and results</p>
      </div>
      
      <div className="content-section">
        <div className="info-card">
          <h3>Admission Status</h3>
          <p>Your admission results will appear here once they are available.</p>
          <p>Check back later for updates on your applications.</p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsResults;