 import React, { useState } from 'react';

const ApplicantCard = ({ applicant, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(applicant.id, newStatus);
  };

  return (
    <div className="applicant-card">
      <div className="applicant-header">
        <div className="applicant-info">
          <h3>{applicant.studentName}</h3>
          <p className="applicant-email">{applicant.studentEmail}</p>
        </div>
        <div className="applicant-score">
          <span className={`score ${getScoreColor(applicant.matchingScore)}`}>
            {applicant.matchingScore}%
          </span>
        </div>
      </div>

      <div className="applicant-details">
        <p><strong>Applied:</strong> {new Date(applicant.appliedAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> 
          <span className={`status ${applicant.status}`}>{applicant.status}</span>
        </p>
        
        {applicant.coverLetter && (
          <div className="cover-letter">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="toggle-btn"
            >
              {isExpanded ? 'Hide' : 'Show'} Cover Letter
            </button>
            {isExpanded && (
              <div className="cover-letter-content">
                {applicant.coverLetter}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="applicant-actions">
        <select 
          value={applicant.status} 
          onChange={(e) => handleStatusChange(e.target.value)}
          className="status-select"
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>

        <button 
          onClick={() => handleStatusChange('accepted')}
          className="btn-accept"
          disabled={applicant.status === 'accepted'}
        >
          Accept
        </button>

        <button 
          onClick={() => handleStatusChange('rejected')}
          className="btn-reject"
          disabled={applicant.status === 'rejected'}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default ApplicantCard;