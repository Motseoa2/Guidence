 import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      inactive: 'secondary',
      draft: 'warning',
      closed: 'danger'
    };
    
    return (
      <span className={`status-badge ${statusColors[status] || 'secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getApplicantCount = (applicants) => {
    if (!applicants || !Array.isArray(applicants)) return 0;
    return applicants.length;
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-title-section">
          <h3 className="job-title">{job.title}</h3>
          {getStatusBadge(job.status)}
        </div>
        <p className="company-name">{job.companyName}</p>
      </div>

      <div className="job-details">
        <div className="detail-item">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{job.location}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{job.jobType}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Salary:</span>
          <span className="detail-value">LSL {job.salary?.toLocaleString()}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Experience:</span>
          <span className="detail-value">{job.experienceLevel}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Applicants:</span>
          <span className="detail-value applicants-count">
            {getApplicantCount(job.applicants)}
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Deadline:</span>
          <span className="detail-value deadline">
            {formatDate(job.applicationDeadline)}
          </span>
        </div>
      </div>

      <div className="job-description">
        <p>{job.description?.substring(0, 150)}...</p>
      </div>

      <div className="job-skills">
        <div className="skills-label">Required Skills:</div>
        <div className="skills-list">
          {job.skillsRequired?.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {job.skillsRequired?.length > 3 && (
            <span className="skill-tag more">+{job.skillsRequired.length - 3} more</span>
          )}
        </div>
      </div>

      <div className="job-actions">
        <Link 
          to={`/company/jobs/edit/${job.id}`} 
          className="btn btn-edit"
        >
          Edit
        </Link>
        
        <button 
          onClick={() => onDelete(job.id)}
          className="btn btn-delete"
        >
          Delete
        </button>
        
        <Link 
          to={`/company/applicants?job=${job.id}`}
          className="btn btn-applicants"
        >
          View Applicants ({getApplicantCount(job.applicants)})
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
