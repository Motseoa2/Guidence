import React, { useState, useEffect } from 'react';

const ApplicationHistory = ({ student }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [student]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:8081/api/applications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      
      if (student) {
        const studentApplications = data.filter(app => 
          app.email === student.email || app.studentId === student.id
        );
        setApplications(studentApplications);
      } else {
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Accepted': return 'status-accepted';
      case 'Rejected': return 'status-rejected';
      case 'Waitlist': return 'status-waitlist';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'Accepted': return 'Accepted';
      case 'Rejected': return 'Rejected';
      case 'Waitlist': return 'Waitlisted';
      default: return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="application-history-container">
      <div className="header-section">
        <h2>Your Application Status</h2>
        <p className="subtitle">Track the status of your course applications</p>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchApplications} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      <div className="filters-section">
        <label>Filter by Status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Applications</option>
          <option value="pending">Under Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Waitlist">Waitlisted</option>
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="empty-state">
          {applications.length === 0 ? (
            <>
              <h3>No Applications Found</h3>
              <p>You haven't submitted any course applications yet.</p>
              <a href="/students/apply" className="apply-link">
                Start Your First Application
              </a>
            </>
          ) : (
            <>
              <h3>No Applications Match Your Filter</h3>
              <p>Try selecting a different status filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h3 className="course-name">
                  {application.course_name || 'Course Application'}
                </h3>
                <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                  {getStatusDisplayText(application.status)}
                </span>
              </div>
              
              <div className="application-details">
                <div className="detail-item">
                  <strong>Institution:</strong>
                  <span>{application.institution_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <strong>Faculty:</strong>
                  <span>{application.faculty_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <strong>Course:</strong>
                  <span>{application.course_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <strong>Your Credits:</strong>
                  <span>{application.credits || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <strong>Applied On:</strong>
                  <span>
                    {application.appliedAt ? 
                      new Date(application.appliedAt).toLocaleDateString() : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>

              {application.status === 'Waitlist' && (
                <div className="waitlist-notice">
                  <p>📋 You are on the waitlist for this course. You'll be notified if a spot becomes available.</p>
                </div>
              )}

              {application.status === 'Accepted' && (
                <div className="accepted-notice">
                  <p>🎉 Congratulations! Your application has been accepted.</p>
                </div>
              )}

              {application.status === 'Rejected' && (
                <div className="rejected-notice">
                  <p>❌ Unfortunately, your application was not accepted for this course.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory;