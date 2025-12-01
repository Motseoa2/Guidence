import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

// Import all Admin components with proper organization
import AddInstitution from './Forms/AddInstitution';
import AddFaculty from './Forms/AddFaculty';
import AddCourse from './Forms/AddCourse';
import UpdateInstitution from './Forms/UpdateInstitution';

import CompanyManagement from './Management/CompanyManagement';
import DeleteInstitution from './Management/DeleteInstitution';
import FacultyManagement from './Management/FacultyManagement';
import CourseManagement from './Management/CourseManagement';
import JobManagement from './Management/JobManagement';
import Administration from './Management/Administration'; // Add this import

import PublishAdmissions from './Admissions/PublishAdmissions';
import AdmissionConflicts from './Admissions/AdmissionConflicts';
import StudentApplications from './Admissions/StudentApplications';

import SystemReports from './Reports/SystemReports';
import AdminAnalytics from './Analytics/AdminAnalytics';

const API_BASE = 'http://localhost:8081/api';

const Admin = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [admissionConflicts, setAdmissionConflicts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  // ADDED: Function to navigate to homepage
  const handleBackToHome = () => {
    navigate('/'); // Navigates to the homepage
  };

  // ADDED: Enhanced logout function
  const handleLogout = () => {
    // Clear all admin-related storage
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    
    // Call parent logout function if provided
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to homepage
    navigate('/');
  };

  // ADDED: Confirm logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  // ADDED: Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const endpoints = [
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/admin/activity`),
        fetch(`${API_BASE}/institutions`),
        fetch(`${API_BASE}/companies`),
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/applications`),
        fetch(`${API_BASE}/jobs`),
        fetch(`${API_BASE}/notifications/${user?.id}`)
      ];

      // Fetch additional data based on active tab
      if (activeTab === 'job-management' || activeTab === 'admission-conflicts') {
        endpoints.push(fetch(`${API_BASE}/job-applications`));
        
        if (activeTab === 'admission-conflicts') {
          endpoints.push(fetchAdmissionConflicts());
        }
      }

      const [
        statsRes, activityRes, institutionsRes, companiesRes, 
        usersRes, applicationsRes, jobsRes, notificationsRes,
        jobApplicationsRes, conflictsRes
      ] = await Promise.all(endpoints);

      // Handle responses
      if (statsRes?.ok) setStats(await statsRes.json());
      if (activityRes?.ok) setRecentActivity(await activityRes.json());
      if (institutionsRes?.ok) setInstitutions(await institutionsRes.json());
      if (companiesRes?.ok) setCompanies(await companiesRes.json());
      if (usersRes?.ok) setUsers(await usersRes.json());
      if (applicationsRes?.ok) setApplications(await applicationsRes.json());
      if (jobsRes?.ok) setJobs(await jobsRes.json());
      if (notificationsRes?.ok) setNotifications(await notificationsRes.json());
      if (jobApplicationsRes && jobApplicationsRes.ok) setJobApplications(await jobApplicationsRes.json());
      if (conflictsRes && conflictsRes.ok) setAdmissionConflicts(await conflictsRes.json());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmissionConflicts = async () => {
    try {
      const studentsWithMultipleAcceptances = [];
      
      // Group applications by student
      const applicationsByStudent = applications.reduce((acc, app) => {
        if (!acc[app.studentId]) {
          acc[app.studentId] = [];
        }
        acc[app.studentId].push(app);
        return acc;
      }, {});

      // Find students with multiple accepted applications
      for (const [studentId, studentApps] of Object.entries(applicationsByStudent)) {
        const acceptedApps = studentApps.filter(app => app.status === 'Accepted');
        if (acceptedApps.length > 1) {
          studentsWithMultipleAcceptances.push({
            studentId,
            studentName: acceptedApps[0].name,
            acceptedApplications: acceptedApps
          });
        }
      }

      return { ok: true, json: async () => studentsWithMultipleAcceptances };
    } catch (error) {
      console.error('Error fetching admission conflicts:', error);
      return { ok: false };
    }
  };

  // Enhanced dashboard with real metrics
  const renderDashboard = () => (
    <div className="dashboard-content" style={{ backgroundColor: '#BEE8F7', minHeight: '100vh', padding: '20px' }}>
      <div className="stats-grid">
        <div className="stat-card" style={{ backgroundColor: '#FF6B6B' }}>
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>{stats?.totalUsers || users.length || 0}</h3>
            <p>Total Users</p>
            <small>Verified: {users.filter(u => u.verified).length}</small>
          </div>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#4ECDC4' }}>
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats?.totalApplications || applications.length || 0}</h3>
            <p>Applications</p>
            <small>Pending: {applications.filter(a => a.status === 'pending').length}</small>
          </div>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#45B7D1' }}>
          <div className="stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="stat-info">
            <h3>{stats?.institutions || institutions.length || 0}</h3>
            <p>Institutions</p>
          </div>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#96CEB4' }}>
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-info">
            <h3>{stats?.companies || companies.length || 0}</h3>
            <p>Companies</p>
            <small>Approved: {companies.filter(c => c.approved).length}</small>
          </div>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#FFEAA7' }}>
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats?.pendingApprovals || 0}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: '#DDA0DD' }}>
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-info">
            <h3>{jobs.length}</h3>
            <p>Active Jobs</p>
            <small>Applications: {jobApplications.length}</small>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'user' && <i className="fas fa-user-plus"></i>}
                    {activity.type === 'application' && <i className="fas fa-file-import"></i>}
                    {activity.type === 'company' && <i className="fas fa-building"></i>}
                    {!activity.type && <i className="fas fa-info-circle"></i>}
                  </div>
                  <div className="activity-content">
                    <p className="activity-action">{activity.action || 'System activity'}</p>
                    <p className="activity-user">{activity.user || 'System'}</p>
                    <span className="activity-time">
                      {activity.time ? new Date(activity.time).toLocaleString() : 'Recently'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <i className="fas fa-info-circle"></i>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => setActiveTab('add-institution')}>
              <i className="fas fa-plus"></i>
              Add Institution
            </button>
            <button className="action-btn" onClick={() => setActiveTab('administration')}>
              <i className="fas fa-cog"></i>
              Manage Users
            </button>
            <button className="action-btn" onClick={() => setActiveTab('job-management')}>
              <i className="fas fa-briefcase"></i>
              Job Management
            </button>
            <button className="action-btn" onClick={() => setActiveTab('admission-conflicts')}>
              <i className="fas fa-exclamation-triangle"></i>
              Admission Conflicts
            </button>
          </div>
        </div>
      </div>

      {/* System Notifications */}
      <div className="system-notifications">
        <h3>System Notifications</h3>
        <div className="notifications-list">
          {notifications.filter(n => !n.read).length > 0 ? (
            notifications.filter(n => !n.read).slice(0, 3).map(notification => (
              <div key={notification.id} className="notification-item">
                <div className={`notification-type ${notification.type || 'info'}`}>
                  <i className={`fas fa-${
                    notification.type === 'warning' ? 'exclamation-triangle' :
                    notification.type === 'info' ? 'info-circle' : 'check-circle'
                  }`}></i>
                </div>
                <div className="notification-content">
                  <strong>{notification.title || 'Notification'}</strong>
                  <p>{notification.message || 'New system notification'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <i className="fas fa-check-circle"></i>
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      
      // Forms
      case 'add-institution':
        return <AddInstitution institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      case 'add-faculty':
        return <AddFaculty institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      case 'add-course':
        return <AddCourse institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      case 'update-institution':
        return <UpdateInstitution institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      
      // Management
      case 'administration':
        return <Administration 
          users={users} 
          applications={applications} 
          fetchDashboardData={fetchDashboardData} 
        />;
      case 'company-management':
        return <CompanyManagement companies={companies} fetchDashboardData={fetchDashboardData} />;
      case 'delete-institution':
        return <DeleteInstitution institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      case 'faculty-management':
        return <FacultyManagement institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      case 'course-management':
        return <CourseManagement institutions={institutions} fetchDashboardData={fetchDashboardData} />;
      case 'job-management':
        return <JobManagement jobs={jobs} companies={companies} fetchDashboardData={fetchDashboardData} />;
      
      // Admissions
      case 'publish-admissions':
        return <PublishAdmissions applications={applications} fetchDashboardData={fetchDashboardData} />;
      case 'admission-conflicts':
        return <AdmissionConflicts 
          admissionConflicts={admissionConflicts} 
          applications={applications} 
          fetchDashboardData={fetchDashboardData} 
        />;
      case 'student-applications':
        return <StudentApplications applications={applications} fetchDashboardData={fetchDashboardData} />;
      
      // Reports & Analytics
      case 'system-reports':
        return <SystemReports 
          stats={stats}
          users={users}
          applications={applications}
          institutions={institutions}
          companies={companies}
          jobs={jobs}
        />;
      case 'admin-analytics':
        return <AdminAnalytics stats={stats} />;
      
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-dashboard" style={{ backgroundColor: '#BEE8F7', minHeight: '100vh' }}>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <div className="logout-header">
              <h3>🚪 Confirm Logout</h3>
              <p>Are you sure you want to log out?</p>
            </div>
            
            <div className="logout-body">
              <div className="logout-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <p>You will need to log in again to access the admin panel.</p>
                </div>
              </div>
              
              <div className="logout-actions">
                <button 
                  className="logout-cancel-btn"
                  onClick={cancelLogout}
                >
                  Cancel
                </button>
                <button 
                  className="logout-confirm-btn"
                  onClick={handleLogout}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="admin-header" style={{ backgroundColor: '#587EF9' }}>
        <div className="header-left">
          <h1 style={{ color: '#000000' }}>Career Guidance & Employment Platform</h1>
          <span className="admin-badge" style={{ color: '#000000' }}>Admin Panel</span>
        </div>
        <div className="header-right">
          <div className="admin-user-info">
            <span style={{ color: '#000000' }}>Welcome, <strong>{user?.name || 'Admin'}</strong></span>
            {/* ADDED: Home and Logout buttons */}
            <div className="admin-action-buttons">
              <button 
                className="admin-home-btn"
                onClick={handleBackToHome}
                title="Go back to homepage"
              >
                <i className="fas fa-home"></i> Home
              </button>
              <button 
                className="admin-logout-btn"
                onClick={confirmLogout}
                title="Logout from admin account"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-main">
        <nav className="admin-sidebar" style={{ backgroundColor: '#0E6C8E' }}>
          <div className="sidebar-menu">
            {/* Dashboard */}
            <button 
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            
            {/* Institution Management */}
            <div className="menu-section">Institution Management</div>
            <button 
              className={`menu-item ${activeTab === 'add-institution' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-institution')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-plus"></i>
              Add Institution
            </button>
            <button 
              className={`menu-item ${activeTab === 'add-faculty' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-faculty')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-graduation-cap"></i>
              Add Faculty
            </button>
            <button 
              className={`menu-item ${activeTab === 'add-course' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-course')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-book"></i>
              Add Course
            </button>
            <button 
              className={`menu-item ${activeTab === 'faculty-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('faculty-management')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-graduation-cap"></i>
              Manage Faculties
            </button>
            <button 
              className={`menu-item ${activeTab === 'course-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('course-management')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-book"></i>
              Manage Courses
            </button>
            <button 
              className={`menu-item ${activeTab === 'update-institution' ? 'active' : ''}`}
              onClick={() => setActiveTab('update-institution')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-edit"></i>
              Update Institution
            </button>
            <button 
              className={`menu-item ${activeTab === 'delete-institution' ? 'active' : ''}`}
              onClick={() => setActiveTab('delete-institution')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-trash"></i>
              Delete Institution
            </button>
            
            {/* User Management */}
            <div className="menu-section">User Management</div>
            <button 
              className={`menu-item ${activeTab === 'administration' ? 'active' : ''}`}
              onClick={() => setActiveTab('administration')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-users-cog"></i>
              Manage Users & Applications
            </button>
            <button 
              className={`menu-item ${activeTab === 'company-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('company-management')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-building"></i>
              Manage Companies
            </button>
            <button 
              className={`menu-item ${activeTab === 'student-applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('student-applications')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-file-alt"></i>
              Student Applications
            </button>
            
            {/* Admissions */}
            <div className="menu-section">Admissions</div>
            <button 
              className={`menu-item ${activeTab === 'publish-admissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('publish-admissions')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-bullhorn"></i>
              Publish Admissions
            </button>
            <button 
              className={`menu-item ${activeTab === 'admission-conflicts' ? 'active' : ''}`}
              onClick={() => setActiveTab('admission-conflicts')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Admission Conflicts
            </button>
            
            {/* Employment */}
            <div className="menu-section">Employment</div>
            <button 
              className={`menu-item ${activeTab === 'job-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('job-management')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-briefcase"></i>
              Job Management
            </button>
            
            {/* Reports & Analytics */}
            <div className="menu-section">Reports & Analytics</div>
            <button 
              className={`menu-item ${activeTab === 'system-reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('system-reports')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-chart-bar"></i>
              System Reports
            </button>
            <button 
              className={`menu-item ${activeTab === 'admin-analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin-analytics')}
              style={{ color: '#000000' }}
            >
              <i className="fas fa-chart-line"></i>
              Analytics
            </button>
          </div>
        </nav>

        <main className="admin-content" style={{ backgroundColor: '#BEE8F7' }}>
          {loading ? (
            <div className="loading-content">
              <div className="spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;