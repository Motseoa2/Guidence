import React, { useState, useEffect } from 'react';

const CourseManagement = ({ institutions, fetchDashboardData }) => {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [availableFaculties, setAvailableFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    institutionId: '',
    facultyId: '',
    name: '',
    code: '',
    minCredits: '',
    description: '',
    duration: '4 years', // Default value
    requirements: 'Minimum of 4 credits and 2 passes' // Default as per requirements
  });

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error fetching courses from server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all faculties
  const fetchFaculties = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/faculties');
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  // Update available faculties when institution changes
  useEffect(() => {
    if (formData.institutionId) {
      const filteredFaculties = faculties.filter(faculty => 
        faculty.institutionId === formData.institutionId
      );
      setAvailableFaculties(filteredFaculties);
      if (formData.facultyId && !filteredFaculties.find(f => f.id === formData.facultyId)) {
        setFormData(prev => ({ ...prev, facultyId: '' }));
      }
    } else {
      setAvailableFaculties([]);
      setFormData(prev => ({ ...prev, facultyId: '' }));
    }
  }, [formData.institutionId, faculties]);

  // Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/courses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          minCredits: parseInt(formData.minCredits)
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Course added successfully!');
        resetForm();
        fetchCourses();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        throw new Error(result.error || `Failed to add course: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update course
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!editingCourse || !validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          minCredits: parseInt(formData.minCredits)
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Course updated successfully!');
        resetForm();
        setEditingCourse(null);
        fetchCourses();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        throw new Error(result.error || `Failed to update course: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will affect student applications.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Course deleted successfully!');
        fetchCourses();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete course: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  // Start editing a course
  const startEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      institutionId: course.institutionId || '',
      facultyId: course.facultyId || '',
      name: course.name || '',
      code: course.code || '',
      minCredits: course.minCredits || '',
      description: course.description || '',
      duration: course.duration || '4 years',
      requirements: course.requirements || 'Minimum of 4 credits and 2 passes'
    });
    setError('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCourse(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      institutionId: '',
      facultyId: '',
      name: '',
      code: '',
      minCredits: '',
      description: '',
      duration: '4 years',
      requirements: 'Minimum of 4 credits and 2 passes'
    });
    setAvailableFaculties([]);
    setError('');
  };

  // Form validation
  const validateForm = () => {
    if (!formData.institutionId) {
      setError('Please select an institution');
      return false;
    }
    if (!formData.facultyId) {
      setError('Please select a faculty');
      return false;
    }
    if (!formData.name.trim()) {
      setError('Please enter course name');
      return false;
    }
    if (!formData.code.trim()) {
      setError('Please enter course code');
      return false;
    }
    if (!formData.minCredits || parseInt(formData.minCredits) < 4) {
      setError('Minimum credits must be at least 4');
      return false;
    }
    return true;
  };

  // Get institution name by ID
  const getInstitutionName = (institutionId) => {
    const institution = institutions.find(inst => inst.id === institutionId);
    return institution ? institution.name : 'Unknown Institution';
  };

  // Get faculty name by ID
  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  return (
    <div className="administration-content" style={{ padding: '20px' }}>
      <h2>Course Management</h2>
      <p>Manage and update courses across all faculties and institutions.</p>

      {/* Add/Edit Course Form */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
        
        {error && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffe6e6', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #ffcccc'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Institution *
              </label>
              <select
                value={formData.institutionId}
                onChange={(e) => setFormData({...formData, institutionId: e.target.value})}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">Select Institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Faculty *
              </label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                required
                disabled={loading || !formData.institutionId}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: !formData.institutionId ? '#f5f5f5' : 'white'
                }}
              >
                <option value="">{formData.institutionId ? 'Select Faculty' : 'Select institution first'}</option>
                {availableFaculties.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Course Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  setError('');
                }}
                required
                disabled={loading}
                placeholder="e.g., Introduction to Computer Science"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Course Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  setFormData({...formData, code: e.target.value.toUpperCase()});
                  setError('');
                }}
                required
                disabled={loading}
                placeholder="e.g., CS101"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Minimum Credits * (≥4)
              </label>
              <input
                type="number"
                value={formData.minCredits}
                onChange={(e) => {
                  setFormData({...formData, minCredits: e.target.value});
                  setError('');
                }}
                required
                disabled={loading}
                min="4"
                max="200"
                placeholder="e.g., 120"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="4 years">4 years</option>
                <option value="3 years">3 years</option>
                <option value="2 years">2 years</option>
                <option value="1 year">1 year</option>
                <option value="6 months">6 months</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              rows="2"
              disabled={loading}
              placeholder="Entry requirements for this course..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              disabled={loading}
              placeholder="Course description and overview..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : (editingCourse ? 'Update Course' : 'Add Course')}
            </button>
            
            {editingCourse && (
              <button 
                type="button"
                onClick={cancelEdit}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Rest of the component remains the same */}
      {/* ... (courses list table code from previous version) ... */}
      
    </div>
  );
};

export default CourseManagement;