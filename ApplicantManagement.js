import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApplicantCard from './ApplicantCard';
import ApplicantFilter from './ApplicantFilter';
import './applicants.css';

const ApplicantManagement = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minScore: 0,
    status: 'all',
    jobId: 'all'
  });
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get('job');

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    filterApplicants();
  }, [applicants, filters]);

  useEffect(() => {
    if (jobFilter) {
      setFilters(prev => ({ ...prev, jobId: jobFilter }));
    }
  }, [jobFilter]);

  const fetchApplicants = async () => {
    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      if (!companyUser) return;

      const response = await fetch(
        `http://localhost:8081/api/job-applications/company/${companyUser.id}`
      );
      const data = await response.json();
      setApplicants(data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplicants = () => {
    let filtered = [...applicants];

    // Filter by minimum score
    if (filters.minScore > 0) {
      filtered = filtered.filter(app => app.matchingScore >= filters.minScore);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Filter by job
    if (filters.jobId !== 'all') {
      filtered = filtered.filter(app => app.jobId === filters.jobId);
    }

    setFilteredApplicants(filtered);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8081/api/job-applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setApplicants(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));

        alert(`Application status updated to ${newStatus}`);
      } else {
        alert('Failed to update application status');
      }
    } catch (error) {
      alert('Failed to update application status');
    }
  };

  const getJobsList = () => {
    const jobIds = [...new Set(applicants.map(app => app.jobId))];
    return jobIds.map(jobId => {
      const app = applicants.find(a => a.jobId === jobId);
      return { id: jobId, title: app.jobTitle || 'Unknown Job' };
    });
  };

  if (loading) return <div>Loading applicants...</div>;

  return (
    <div className="applicant-management-container">
      <div className="applicant-header">
        <h2>Applicant Management</h2>
        <p>Review and manage job applications</p>
      </div>

      <ApplicantFilter
        filters={filters}
        setFilters={setFilters}
        jobs={getJobsList()}
        totalApplicants={applicants.length}
        filteredCount={filteredApplicants.length}
      />

      <div className="applicants-grid">
        {filteredApplicants.length === 0 ? (
          <div className="no-applicants">
            <p>No applicants match your current filters.</p>
          </div>
        ) : (
          filteredApplicants.map(applicant => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onStatusUpdate={updateApplicationStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicantManagement;