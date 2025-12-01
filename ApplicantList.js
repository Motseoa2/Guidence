 import React from 'react';
import ApplicantCard from './ApplicantCard';

const ApplicantList = ({ applicants, onStatusUpdate, onFilterChange }) => {
  const getStats = () => {
    const total = applicants.length;
    const pending = applicants.filter(app => app.status === 'pending').length;
    const reviewed = applicants.filter(app => app.status === 'reviewed').length;
    const accepted = applicants.filter(app => app.status === 'accepted').length;
    const rejected = applicants.filter(app => app.status === 'rejected').length;

    return { total, pending, reviewed, accepted, rejected };
  };

  const stats = getStats();

  if (applicants.length === 0) {
    return (
      <div className="applicant-list-empty">
        <div className="empty-state">
          <h3>No Applicants Found</h3>
          <p>There are no job applications matching your current filters.</p>
          <button 
            onClick={() => onFilterChange({ type: 'clear' })}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applicant-list">
      <div className="applicant-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card reviewed">
          <span className="stat-number">{stats.reviewed}</span>
          <span className="stat-label">Reviewed</span>
        </div>
        <div className="stat-card accepted">
          <span className="stat-number">{stats.accepted}</span>
          <span className="stat-label">Accepted</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-number">{stats.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      <div className="applicant-sort">
        <label>Sort by:</label>
        <select onChange={(e) => onFilterChange({ type: 'sort', value: e.target.value })}>
          <option value="score-desc">Match Score (High to Low)</option>
          <option value="score-asc">Match Score (Low to High)</option>
          <option value="date-desc">Application Date (Newest)</option>
          <option value="date-asc">Application Date (Oldest)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>

      <div className="applicant-grid">
        {applicants.map(applicant => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>

      <div className="applicant-actions-bulk">
        <h4>Bulk Actions</h4>
        <div className="bulk-buttons">
          <button 
            onClick={() => onStatusUpdate('all-pending', 'reviewed')}
            className="btn-bulk"
          >
            Mark All as Reviewed
          </button>
          <button 
            onClick={() => onStatusUpdate('all-pending', 'accepted')}
            className="btn-bulk accept"
          >
            Accept All Pending
          </button>
          <button 
            onClick={() => onStatusUpdate('all-pending', 'rejected')}
            className="btn-bulk reject"
          >
            Reject All Pending
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantList;
