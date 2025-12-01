 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyHeader = ({ onMenuToggle }) => {
  const [company, setCompany] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const companyUser = JSON.parse(localStorage.getItem('companyUser'));
    setCompany(companyUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('companyUser');
    localStorage.removeItem('userRole');
    navigate('/company/login');
  };

  const handleProfile = () => {
    navigate('/company/profile');
    setShowDropdown(false);
  };

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <header className="company-header">
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={onMenuToggle}
        >
          ☰
        </button>
        <h1 className="header-title">Company Dashboard</h1>
      </div>

      <div className="header-right">
        <div className="company-info">
          <span className="company-name">{company.name}</span>
          <span className={`company-status ${company.approved ? 'approved' : 'pending'}`}>
            {company.approved ? '✓ Verified' : '⏳ Pending'}
          </span>
        </div>

        <div className="header-actions">
          <button 
            className="btn-notifications"
            onClick={() => navigate('/company/notifications')}
          >
            🔔
          </button>

          <div className="user-dropdown">
            <button 
              className="user-menu-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="user-avatar">
                {company.name.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">{company.name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleProfile} className="dropdown-item">
                  👤 Company Profile
                </button>
                <button onClick={handleLogout} className="dropdown-item">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default CompanyHeader;
