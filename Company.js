// Company.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import components with correct file names
import CompanyLogin from './auth/CompanyLogin';
import CompanyRegister from './auth/CompanyRegister';
import CompanyDashboard from './dashboard/CompanyDashboard';
import CompanyProfile from './profile/CompanyProfile';
import JobPosting from './jobs/JobPosting';
import JobList from './jobs/JobList';
import ApplicantManagement from './applicants/ApplicantManagement';

const Company = () => {
  return (
    <div className="company-module">
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/company/dashboard" replace />} />
        
        {/* Auth routes */}
        <Route path="login" element={<CompanyLogin />} />
        <Route path="register" element={<CompanyRegister />} />
        
        {/* Main dashboard */}
        <Route path="dashboard" element={<CompanyDashboard />} />
        
        {/* Profile routes */}
        <Route path="profile" element={<CompanyProfile />} />
        
        {/* Job routes */}
        <Route path="jobs" element={<JobList />} />
        <Route path="jobs/new" element={<JobPosting />} />
        
        {/* Applicant routes */}
        <Route path="applicants" element={<ApplicantManagement />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Company;