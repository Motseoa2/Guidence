import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './jobs.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      if (!companyUser) return;

      const response = await fetch(`http://localhost:8081/api/jobs?companyId=${companyUser.id}`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/jobs/${jobId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setJobs(jobs.filter(job => job.id !== jobId));
          alert('Job deleted successfully');
        } else {
          alert('Failed to delete job');
        }
      } catch (error) {
        alert('Failed to delete job');
      }
    }
  };

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2>Manage Job Postings</h2>
        <Link to="/company/jobs/new" className="btn-primary">
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs posted yet.</p>
          <Link to="/company/jobs/new" className="btn-primary">
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className={`status ${job.status}`}>{job.status}</span>
              </div>
              <p className="job-type">{job.jobType} • {job.location}</p>
              <p className="salary">Salary: LSL {job.salary?.toLocaleString()}</p>
              <p className="applicants">
                Applicants: {job.applicants ? job.applicants.length : 0}
              </p>
              <p className="deadline">
                Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
              </p>
              <div className="job-actions">
                <Link to={`/company/jobs/edit/${job.id}`} className="btn-edit">
                  Edit
                </Link>
                <button 
                  onClick={() => deleteJob(job.id)} 
                  className="btn-delete"
                >
                  Delete
                </button>
                <Link to={`/company/applicants?job=${job.id}`} className="btn-view">
                  View Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;