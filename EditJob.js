 import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    qualifications: '',
    skillsRequired: '',
    experienceLevel: 'entry',
    applicationDeadline: '',
    status: 'active'
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/jobs/${id}`);
      const job = response.data;
      
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements?.join('\n') || '',
        location: job.location || '',
        salary: job.salary || '',
        jobType: job.jobType || 'full-time',
        qualifications: job.qualifications?.join(', ') || '',
        skillsRequired: job.skillsRequired?.join(', ') || '',
        experienceLevel: job.experienceLevel || 'entry',
        applicationDeadline: job.applicationDeadline ? 
          new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        status: job.status || 'active'
      });
    } catch (error) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
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
    setSaving(true);
    setError('');

    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      
      const jobData = {
        ...formData,
        companyId: companyUser.id,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        qualifications: formData.qualifications.split(',').map(q => q.trim()),
        skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()),
        salary: parseFloat(formData.salary)
      };

      await axios.put(`http://localhost:8081/api/jobs/${id}`, jobData);
      alert('Job updated successfully!');
      navigate('/company/jobs');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  return (
    <div className="edit-job-container">
      <div className="edit-job-header">
        <h2>Edit Job Posting</h2>
        <button 
          onClick={() => navigate('/company/jobs')}
          className="btn-back"
        >
          Back to Jobs
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Type *</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level *</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
              >
                <option value="entry">Entry Level</option>
                <option value="junior">Junior (1-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (5+ years)</option>
                <option value="lead">Lead/Principal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Details & Requirements</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Maseru, Lesotho or Remote"
              />
            </div>

            <div className="form-group">
              <label>Salary (LSL) *</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                placeholder="e.g., 25000"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Requirements (one per line) *</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Bachelor's degree in relevant field&#10;2+ years of experience in...&#10;Strong communication skills"
            />
          </div>

          <div className="form-group">
            <label>Qualifications (comma separated)</label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="e.g., BSc Computer Science, Diploma in IT, Certifications"
            />
          </div>

          <div className="form-group">
            <label>Skills Required (comma separated) *</label>
            <input
              type="text"
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              required
              placeholder="e.g., JavaScript, React, Node.js, MongoDB, Git"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Application Settings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Application Deadline *</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/company/jobs')}
            className="btn-cancel"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="btn-save"
          >
            {saving ? 'Updating...' : 'Update Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
