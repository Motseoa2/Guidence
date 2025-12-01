import React, { useState, useEffect } from 'react';
import './profile.css';

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      if (!companyUser) return;

      const response = await fetch(`http://localhost:8081/api/companies/${companyUser.id}`);
      const companyData = await response.json();
      
      setCompany(companyData);
      setFormData({
        name: companyData.name || '',
        email: companyData.email || '',
        industry: companyData.industry || '',
        location: companyData.location || '',
        description: companyData.description || ''
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      
      const response = await fetch(`http://localhost:8081/api/companies/${companyUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Update local storage
        const updatedUser = { ...companyUser, ...formData };
        localStorage.setItem('companyUser', JSON.stringify(updatedUser));
        
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!company) return <div>Loading...</div>;

  return (
    <div className="company-profile-container">
      <div className="profile-header">
        <h2>Company Profile</h2>
        <div className={`approval-status ${company.approved ? 'approved' : 'pending'}`}>
          {company.approved ? '✓ Approved' : '⏳ Pending Approval'}
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Company Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Industry:</label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>

        <div className="profile-stats">
          <h3>Account Information</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Registration Date:</label>
              <span>{new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="stat-item">
              <label>Account Status:</label>
              <span>{company.approved ? 'Active' : 'Pending Approval'}</span>
            </div>
            <div className="stat-item">
              <label>Verification Status:</label>
              <span>{company.verified ? 'Verified' : 'Not Verified'}</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default CompanyProfile;