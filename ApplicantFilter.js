 import React from 'react';

const ApplicantFilter = ({ filters, setFilters, jobs, totalApplicants, filteredCount }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="applicant-filters">
      <div className="filter-header">
        <h3>Filters</h3>
        <span className="applicant-count">
          Showing {filteredCount} of {totalApplicants} applicants
        </span>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label>Minimum Match Score:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minScore}
            onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))}
          />
          <span>{filters.minScore}%</span>
        </div>

        <div className="filter-group">
          <label>Application Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Job Position:</label>
          <select
            value={filters.jobId}
            onChange={(e) => handleFilterChange('jobId', e.target.value)}
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setFilters({ minScore: 0, status: 'all', jobId: 'all' })}
          className="btn-clear"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ApplicantFilter;