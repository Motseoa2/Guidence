import React, { useState } from 'react';

const JobManagement = ({ jobs, companies, fetchDashboardData }) => {
  const [newJob, setNewJob] = useState({
    title: '', 
    description: '', 
    companyId: '', 
    location: '', 
    salary: '', 
    jobType: 'full-time', 
    applicationDeadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAddJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!newJob.title || !newJob.description || !newJob.companyId || !newJob.location) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        setLoading(false);
        return;
      }

      // Validate salary is a number if provided
      if (newJob.salary && isNaN(newJob.salary)) {
        setMessage({ type: 'error', text: 'Salary must be a valid number' });
        setLoading(false);
        return;
      }

      // Validate deadline is in the future
      if (newJob.applicationDeadline) {
        const deadline = new Date(newJob.applicationDeadline);
        const today = new Date();
        if (deadline <= today) {
          setMessage({ type: 'error', text: 'Application deadline must be in the future' });
          setLoading(false);
          return;
        }
      }

      const API_BASE = 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...newJob,
          salary: newJob.salary ? parseInt(newJob.salary) : null,
          applicationDeadline: newJob.applicationDeadline || null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: '🎉 Job posted successfully! It will now appear in job listings.' 
        });
        
        // Reset form
        setNewJob({ 
          title: '', 
          description: '', 
          companyId: '', 
          location: '', 
          salary: '', 
          jobType: 'full-time', 
          applicationDeadline: '' 
        });
        
        // Refresh dashboard data
        if (fetchDashboardData) {
          fetchDashboardData();
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || data.message || 'Failed to post job. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error posting job:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewJob(prev => ({ ...prev, [field]: value }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  // Get current date in YYYY-MM-DD format for deadline min attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get date 30 days from now for deadline max attribute
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 365); // 1 year max
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="administration-content">
      <div className="management-header">
        <h2>Job Management</h2>
        <p>Post and manage job opportunities for students</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="management-section">
        <div className="section-header">
          <h3>📝 Post New Job Opportunity</h3>
          <span className="section-badge">New</span>
        </div>
        
        <form onSubmit={handleAddJob} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input 
                type="text" 
                value={newJob.title} 
                onChange={(e) => handleInputChange('title', e.target.value)} 
                placeholder="e.g., Software Engineer Intern"
                required 
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Company *</label>
              <select 
                value={newJob.companyId} 
                onChange={(e) => handleInputChange('companyId', e.target.value)} 
                required
                disabled={loading || companies.length === 0}
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {companies.length === 0 && (
                <small className="helper-text">No companies available. Please add companies first.</small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input 
                type="text" 
                value={newJob.location} 
                onChange={(e) => handleInputChange('location', e.target.value)} 
                placeholder="e.g., Maseru, Lesotho"
                required 
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Salary (M)</label>
              <input 
                type="number" 
                value={newJob.salary} 
                onChange={(e) => handleInputChange('salary', e.target.value)} 
                placeholder="e.g., 15000"
                min="0"
                disabled={loading}
              />
              <small className="helper-text">Monthly salary in Maloti (optional)</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Type *</label>
              <select 
                value={newJob.jobType} 
                onChange={(e) => handleInputChange('jobType', e.target.value)} 
                required
                disabled={loading}
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Application Deadline</label>
              <input 
                type="date" 
                value={newJob.applicationDeadline} 
                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)} 
                min={getTodayDate()}
                max={getMaxDate()}
                disabled={loading}
              />
              <small className="helper-text">Optional - Leave empty for no deadline</small>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea 
              value={newJob.description} 
              onChange={(e) => handleInputChange('description', e.target.value)} 
              rows="4" 
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              required 
              disabled={loading}
            />
            <small className="helper-text">
              {newJob.description.length}/1000 characters
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setNewJob({ 
                  title: '', description: '', companyId: '', location: '', 
                  salary: '', jobType: 'full-time', applicationDeadline: '' 
                });
                setMessage({ type: '', text: '' });
              }}
              disabled={loading}
            >
              Clear Form
            </button>
            <button 
              type="submit" 
              className="submit-btn primary"
              disabled={loading || !newJob.title || !newJob.description || !newJob.companyId || !newJob.location}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Posting Job...
                </>
              ) : (
                '🚀 Post Job Opportunity'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Jobs Preview */}
      {jobs && jobs.length > 0 && (
        <div className="management-section">
          <div className="section-header">
            <h3>📋 Recent Job Postings</h3>
            <span className="section-badge">{jobs.length} Jobs</span>
          </div>
          <div className="jobs-preview">
            {jobs.slice(0, 3).map(job => (
              <div key={job.id} className="job-preview-card">
                <h4>{job.title}</h4>
                <p className="company">{job.companyName}</p>
                <p className="location">{job.location}</p>
                <span className={`job-type ${job.jobType}`}>{job.jobType}</span>
              </div>
            ))}
            {jobs.length > 3 && (
              <div className="view-all-jobs">
                <p>... and {jobs.length - 3} more jobs</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .administration-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .management-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .management-header h2 {
          color: #2d3748;
          margin-bottom: 8px;
        }

        .management-header p {
          color: #718096;
          font-size: 1.1rem;
        }

        .management-section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f7fafc;
        }

        .section-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 1.3rem;
        }

        .section-badge {
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .message {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .message.success {
          background: #f0fff4;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }

        .message.error {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .helper-text {
          color: #718096;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .cancel-btn, .submit-btn {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #718096;
        }

        .cancel-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .submit-btn.primary {
          background: #667eea;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn.primary:hover:not(:disabled) {
          background: #5a67d8;
        }

        .submit-btn.primary:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .jobs-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .job-preview-card {
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .job-preview-card h4 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          color: #2d3748;
        }

        .job-preview-card .company {
          font-weight: 600;
          color: #667eea;
          margin: 0 0 4px 0;
          font-size: 0.9rem;
        }

        .job-preview-card .location {
          color: #718096;
          margin: 0 0 8px 0;
          font-size: 0.8rem;
        }

        .job-type {
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .view-all-jobs {
          text-align: center;
          padding: 20px;
          color: #718096;
          font-style: italic;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default JobManagement;