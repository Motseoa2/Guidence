// dashboard/CompanyDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [company, setCompany] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    newApplications: 0,
    interviewScheduled: 0
  });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const companyUser = localStorage.getItem('companyUser');
      const userRole = localStorage.getItem('userRole');
      
      if (!companyUser || userRole !== 'company') {
        navigate('/company/login');
        return;
      }

      const companyData = JSON.parse(companyUser);
      setCompany(companyData);
      fetchDashboardData(companyData);
    } catch (error) {
      console.error('Authentication check failed:', error);
      navigate('/company/login');
    }
  };

  const fetchDashboardData = async (companyData) => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchCompanyStats(companyData),
        fetchRecentApplicants(companyData),
        fetchJobStatistics(companyData)
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async (companyData) => {
    try {
      // Use the new company profile endpoint to get stats
      const response = await fetch('http://localhost:8081/api/company/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('companyToken') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData({
            totalJobs: data.stats.totalJobs || 0,
            activeJobs: data.stats.activeJobs || 0,
            totalApplicants: data.stats.totalApplications || 0,
            newApplications: data.stats.pendingApplications || 0,
            interviewScheduled: 0 // You can add this to your backend later
          });
          return;
        }
      }

      // Fallback: If the new endpoint fails, use individual API calls
      await fetchFallbackStats(companyData);
    } catch (error) {
      console.error('Error fetching company stats:', error);
      await fetchFallbackStats(companyData);
    }
  };

  const fetchFallbackStats = async (companyData) => {
    try {
      // Fetch jobs using company ID
      const jobsResponse = await fetch(`http://localhost:8081/api/jobs?companyId=${companyData.id}`);
      
      let totalJobs = 0;
      let activeJobs = 0;

      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        totalJobs = jobs.length;
        activeJobs = jobs.filter(job => job.status === 'active').length;
      }

      // Fetch applications using the new company applications endpoint
      const appsResponse = await fetch(`http://localhost:8081/api/company/applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('companyToken') || ''}`
        }
      });

      let totalApplicants = 0;
      let newApplications = 0;

      if (appsResponse.ok) {
        const data = await appsResponse.json();
        if (data.success) {
          totalApplicants = data.applications.length;
          newApplications = data.applications.filter(app => app.status === 'pending').length;
        }
      }

      setDashboardData({
        totalJobs,
        activeJobs,
        totalApplicants,
        newApplications,
        interviewScheduled: 0
      });
    } catch (error) {
      console.error('Error in fallback stats:', error);
      throw error;
    }
  };

  const fetchRecentApplicants = async (companyData) => {
    try {
      const response = await fetch('http://localhost:8081/api/company/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('companyToken') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const recent = data.applications
            .sort((a, b) => new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt))
            .slice(0, 3)
            .map(applicant => ({
              id: applicant.id,
              name: applicant.studentName || applicant.name || 'Applicant',
              position: applicant.jobTitle || 'Applied Position',
              status: applicant.status || 'New',
              date: new Date(applicant.appliedAt || applicant.createdAt).toLocaleDateString(),
              avatar: '👤',
              matchingScore: applicant.matchingScore || 'N/A'
            }));
          setRecentApplicants(recent);
          return;
        }
      }

      // Fallback: Set empty array if no applicants
      setRecentApplicants([]);
    } catch (error) {
      console.error('Error fetching recent applicants:', error);
      setRecentApplicants([]);
    }
  };

  const fetchJobStatistics = async (companyData) => {
    try {
      const response = await fetch(`http://localhost:8081/api/jobs?companyId=${companyData.id}`);
      
      if (response.ok) {
        const jobs = await response.json();
        
        const statusCounts = jobs.reduce((acc, job) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {});

        const stats = [
          { status: 'Active', count: statusCounts.active || 0, color: '#10b981' },
          { status: 'Draft', count: statusCounts.draft || 0, color: '#f59e0b' },
          { status: 'Closed', count: statusCounts.closed || 0, color: '#ef4444' },
          { status: 'Pending', count: statusCounts.pending || 0, color: '#6b7280' }
        ].filter(item => item.count > 0);

        setJobStats(stats);
      } else {
        setJobStats([]);
      }
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      setJobStats([]);
    }
  };

  // ADDED: Function to navigate to homepage
  const handleBackToHome = () => {
    navigate('/'); // Navigates to the homepage
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Clear all company-related storage
    localStorage.removeItem('companyUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyToken');
    navigate('/company/login');
  };

  const StatsCard = ({ title, value, change, icon, color, onClick }) => (
    <div 
      className={`stats-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stats-icon" style={{ backgroundColor: color }}>{icon}</div>
      <div className="stats-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && <span className="change positive">+{change}%</span>}
      </div>
    </div>
  );

  const ApplicationChart = () => {
    return (
      <div className="chart-container">
        <h4>Applications Trend</h4>
        <div className="chart">
          {dashboardData.totalApplicants > 0 ? (
            <div className="chart-bars">
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: `${Math.min(dashboardData.totalApplicants * 10, 100)}%` }}
                  data-value={dashboardData.totalApplicants}
                ></div>
                <span className="bar-label">Total</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: `${Math.min(dashboardData.newApplications * 20, 100)}%` }}
                  data-value={dashboardData.newApplications}
                ></div>
                <span className="bar-label">New</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar" 
                  style={{ height: `${Math.min(dashboardData.interviewScheduled * 20, 100)}%` }}
                  data-value={dashboardData.interviewScheduled}
                ></div>
                <span className="bar-label">Interviews</span>
              </div>
            </div>
          ) : (
            <div className="no-data-chart">
              <p>📊 Application data will appear here once you start receiving applications</p>
              <button 
                className="post-job-btn"
                onClick={() => handleNavigation('/company/jobs/new')}
              >
                Post Your First Job
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const JobStatusChart = () => {
    const totalJobs = dashboardData.totalJobs;
    
    return (
      <div className="chart-container">
        <h4>Job Status</h4>
        <div className="pie-chart">
          {totalJobs > 0 ? (
            <>
              <div className="pie" style={{ 
                background: `conic-gradient(
                  #10b981 0% ${(dashboardData.activeJobs / totalJobs) * 100}%,
                  #f59e0b ${(dashboardData.activeJobs / totalJobs) * 100}% ${((dashboardData.activeJobs + (dashboardData.totalJobs - dashboardData.activeJobs)) / totalJobs) * 100}%,
                  #6b7280 ${((dashboardData.activeJobs + (dashboardData.totalJobs - dashboardData.activeJobs)) / totalJobs) * 100}% 100%
                )` 
              }}>
                <div className="center">
                  <span>{dashboardData.activeJobs}/{totalJobs}</span>
                  <small>Active</small>
                </div>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="dot active"></span>
                  <span>Active ({dashboardData.activeJobs})</span>
                </div>
                <div className="legend-item">
                  <span className="dot inactive"></span>
                  <span>Other ({totalJobs - dashboardData.activeJobs})</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-pie">
              <p>No jobs posted yet</p>
              <button 
                className="post-job-btn"
                onClick={() => handleNavigation('/company/jobs/new')}
              >
                Create Job
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="company-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Company Dashboard</h1>
            <p>Manage your job postings and applicants</p>
          </div>
          
          {company && (
            <div className="user-info">
              <span>Welcome, <strong>{company.name}</strong></span>
              <div className="header-actions">
                {/* ADDED: Home button */}
                <button 
                  className="home-btn"
                  onClick={handleBackToHome}
                  title="Go back to homepage"
                >
                  🏠 Home
                </button>
                <button 
                  className="profile-btn"
                  onClick={() => handleNavigation('/company/profile')}
                >
                  Profile
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button className="retry-btn" onClick={() => fetchDashboardData(company)}>
            Retry
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-overview">
        <StatsCard 
          title="Total Jobs" 
          value={dashboardData.totalJobs} 
          icon="💼"
          color="#3b82f6"
          onClick={() => handleNavigation('/company/jobs')}
        />
        <StatsCard 
          title="Active Jobs" 
          value={dashboardData.activeJobs} 
          icon="✅"
          color="#10b981"
        />
        <StatsCard 
          title="Total Applicants" 
          value={dashboardData.totalApplicants} 
          icon="👥"
          color="#8b5cf6"
          onClick={() => handleNavigation('/company/applicants')}
        />
        <StatsCard 
          title="New Applications" 
          value={dashboardData.newApplications} 
          icon="🆕"
          color="#f59e0b"
        />
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Action Cards */}
          <div className="dashboard-actions">
            <div 
              className="action-card"
              onClick={() => handleNavigation('/company/jobs/new')}
            >
              <div className="action-icon">📝</div>
              <div className="action-content">
                <h3>Post New Job</h3>
                <p>Create a new job opportunity and attract top talent</p>
              </div>
            </div>

            <div 
              className="action-card"
              onClick={() => handleNavigation('/company/jobs')}
            >
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>Manage Jobs</h3>
                <p>View, edit, and manage your job postings</p>
              </div>
            </div>

            <div 
              className="action-card"
              onClick={() => handleNavigation('/company/applicants')}
            >
              <div className="action-icon">👥</div>
              <div className="action-content">
                <h3>View Applicants</h3>
                <p>Review candidates and schedule interviews</p>
              </div>
            </div>

            <div 
              className="action-card"
              onClick={() => handleNavigation('/company/profile')}
            >
              <div className="action-icon">🏢</div>
              <div className="action-content">
                <h3>Company Profile</h3>
                <p>Update your company information and settings</p>
              </div>
            </div>
          </div>

          {/* Application Trend Chart */}
          <ApplicationChart />
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Job Status Chart */}
          <JobStatusChart />

          {/* Recent Activity */}
          <div className="recent-activity">
            <div className="activity-header">
              <h4>Recent Applicants</h4>
              <button 
                className="view-all-btn"
                onClick={() => handleNavigation('/company/applicants')}
              >
                View All
              </button>
            </div>
            <div className="activity-list">
              {recentApplicants.length > 0 ? (
                recentApplicants.map(applicant => (
                  <div key={applicant.id} className="activity-item">
                    <div className="activity-avatar">
                      {applicant.avatar}
                    </div>
                    <div className="activity-content">
                      <h5>{applicant.name}</h5>
                      <p>{applicant.position}</p>
                      <div className="activity-meta">
                        <span className="date">{applicant.date}</span>
                        {applicant.matchingScore !== 'N/A' && (
                          <span className="match-score">Match: {applicant.matchingScore}%</span>
                        )}
                      </div>
                    </div>
                    <div className={`activity-status status-${applicant.status.toLowerCase()}`}>
                      {applicant.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-applicants">
                  <p>No recent applicants</p>
                  <button 
                    className="post-job-btn"
                    onClick={() => handleNavigation('/company/jobs/new')}
                  >
                    Post a Job to Get Applicants
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;