 import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CompanyHeader from './CompanyHeader';

const CompanyLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/company/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/company/jobs', label: 'Job Postings', icon: '💼' },
    { path: '/company/applicants', label: 'Applicants', icon: '👥' },
    { path: '/company/profile', label: 'Company Profile', icon: '🏢' }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('companyUser');
    localStorage.removeItem('userRole');
    navigate('/company/login');
  };

  return (
    <div className="company-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Company Portal</h3>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <CompanyHeader 
          onMenuToggle={() => setSidebarOpen(true)}
        />
        
        <div className="content-area">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CompanyLayout;
