import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './jobs.css';

const JobPosting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    applicationDeadline: ''
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/jobs/${id}`);
      const job = await response.json();
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
          new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
      });
    } catch (error) {
      setError('Failed to fetch job details');
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
    setError('');

    try {
      const companyUser = JSON.parse(localStorage.getItem('companyUser'));
      if (!companyUser) {
        navigate('/company/login');
        return;
      }

      const jobData = {
        ...formData,
        companyId: companyUser.id,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        qualifications: formData.qualifications.split(',').map(q => q.trim()),
        skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()),
        salary: parseFloat(formData.salary)
      };

      const url = id ? `http://localhost:8081/api/jobs/${id}` : 'http://localhost:8081/api/jobs';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(id ? 'Job updated successfully!' : 'Job posted successfully!');
        navigate('/company/jobs');
      } else {
        setError(data.error || 'Failed to post job');
      }
    } catch (error) {
      setError('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-posting-container">
      <div className="job-posting-form">
        <h2>{id ? 'Edit Job' : 'Post New Job'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Form fields remain the same */}
          <div className="form-group">
            <label>Job Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Software Engineer"
            />
          </div>

          <div className="form-group">
            <label>Job Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Detailed job description..."
            />
          </div>

          <div className="form-group">
            <label>Requirements (one per line):</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Bachelor's degree in Computer Science&#10;2+ years of experience..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Maseru, Lesotho"
              />
            </div>

            <div className="form-group">
              <label>Salary (LSL):</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                placeholder="e.g., 15000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Type:</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange} required>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level:</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} required>
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Qualifications (comma separated):</label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              required
              placeholder="e.g., BSc Computer Science, Diploma in IT"
            />
          </div>

          <div className="form-group">
            <label>Skills Required (comma separated):</label>
            <input
              type="text"
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              required
              placeholder="e.g., JavaScript, React, Node.js, MongoDB"
            />
          </div>

          <div className="form-group">
            <label>Application Deadline:</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : (id ? 'Update Job' : 'Post Job')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobPosting;