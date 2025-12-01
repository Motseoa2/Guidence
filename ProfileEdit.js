import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    phone: '',
    size: '',
    founded: ''
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      if (!companyUser) {
        navigate('/company/login');
        return;
      }

      const response = await axios.get(`http://localhost:8081/api/companies/${companyUser.id}`);
      const companyData = response.data;
      
      setFormData({
        name: companyData.name || '',
        email: companyData.email || '',
        industry: companyData.industry || '',
        location: companyData.location || '',
        description: companyData.description || '',
        website: companyData.website || '',
        phone: companyData.phone || '',
        size: companyData.size || '',
        founded: companyData.founded || ''
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      
      await axios.patch(`http://localhost:8081/api/companies/${companyUser.id}`, formData);
      
      // Update local storage
      const updatedUser = { ...companyUser, ...formData };
      localStorage.setItem('companyUser', JSON.stringify(updatedUser));
      
      setMessage('Profile updated successfully!');
      
      setTimeout(() => {
        navigate('/company/profile');
      }, 2000);
    } catch (error) {
      setMessage('Failed to update profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/company/profile');
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <h2>Edit Company Profile</h2>
        <p>Update your company information</p>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Industry *</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Maseru, Lesotho"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Size</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                name="founded"
                value={formData.founded}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="e.g., 2010"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+266 1234 5678"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Company Description</h3>
          
          <div className="form-group">
            <label>About Your Company *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe your company's mission, values, culture, and what makes you unique..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-save"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;