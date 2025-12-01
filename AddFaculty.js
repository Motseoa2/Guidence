import React, { useState, useEffect } from 'react';

const AddFaculty = ({ institutions, fetchDashboardData, onFacultyUpdate }) => {
  const [newFaculty, setNewFaculty] = useState({
    institutionId: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableFaculties, setAvailableFaculties] = useState([]);
  const [useMockData, setUseMockData] = useState(false);

  // Mock data for existing faculties (same as in your second component)
  const mockFaculties = {
    "1": [
      { id: 1, name: "Faculty of Humanities", institutionId: "1" },
      { id: 2, name: "Faculty of Science & Technology", institutionId: "1" },
      { id: 3, name: "Faculty of Social Sciences", institutionId: "1" }
    ],
    "2": [
      { id: 4, name: "Faculty of Design & Innovation", institutionId: "2" },
      { id: 5, name: "Faculty of Information Technology", institutionId: "2" }
    ],
    "3": [
      { id: 6, name: "Faculty of Primary Education", institutionId: "3" },
      { id: 7, name: "Faculty of Secondary Education", institutionId: "3" }
    ]
  };

  // Predefined faculties for each institution (same as in your second component)
  const institutionFaculties = {
    "National University of Lesotho": [
      "Faculty of Humanities",
      "Faculty of Science & Technology", 
      "Faculty of Social Sciences",
      "Faculty of Education",
      "Faculty of Health Sciences",
      "Faculty of Agriculture",
      "Faculty of Law",
      "Institute of Extra-Mural Studies",
      "Institute of Southern African Studies"
    ],
    "Limkokwing University of Creative Technology": [
      "Faculty of Design & Innovation",
      "Faculty of Information Technology",
      "Faculty of Business & Management",
      "Faculty of Media & Communication",
      "Faculty of Architecture & Built Environment",
      "Faculty of Fashion & Lifestyle",
      "Faculty of Multimedia Creativity"
    ],
    "Lesotho College of Education": [
      "Faculty of Primary Education",
      "Faculty of Secondary Education", 
      "Faculty of Early Childhood Education",
      "Faculty of Special Needs Education",
      "Faculty of Educational Management",
      "Faculty of Curriculum Studies"
    ],
    "Lerotholi Polytechnic": [
      "Faculty of Engineering & Technology",
      "Faculty of Business Studies",
      "Faculty of Hospitality & Tourism",
      "Faculty of Built Environment",
      "Faculty of Information Technology",
      "Faculty of General Studies"
    ],
    "Lesotho Agricultural College": [
      "Faculty of Crop Production",
      "Faculty of Animal Science",
      "Faculty of Agricultural Engineering", 
      "Faculty of Agribusiness Management",
      "Faculty of Soil Science & Conservation",
      "Faculty of Horticulture"
    ],
    "Centre for Accounting Studies": [
      "Faculty of Accounting & Finance",
      "Faculty of Business Management",
      "Faculty of Information Technology",
      "Faculty of Professional Studies",
      "Faculty of Banking & Finance"
    ],
    "Institute of Development Management": [
      "Faculty of Business Management",
      "Faculty of Public Management",
      "Faculty of Development Studies",
      "Faculty of Information Technology",
      "Faculty of Project Management"
    ],
    "Lesotho School of Nursing": [
      "Faculty of General Nursing",
      "Faculty of Midwifery",
      "Faculty of Community Health Nursing",
      "Faculty of Nursing Education",
      "Faculty of Psychiatric Nursing"
    ],
    "National Health Training College": [
      "Faculty of Nursing Sciences",
      "Faculty of Public Health",
      "Faculty of Clinical Medicine", 
      "Faculty of Pharmacy",
      "Faculty of Laboratory Sciences",
      "Faculty of Health Management"
    ],
    "St. Joseph's College for the Visually Impaired": [
      "Faculty of Special Education",
      "Faculty of Life Skills",
      "Faculty of Vocational Training",
      "Faculty of Braille Studies",
      "Faculty of Assistive Technology"
    ]
  };

  // Fetch faculties when institution changes
  const fetchFaculties = async (institutionId) => {
    if (!institutionId) {
      setAvailableFaculties([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/faculties/${institutionId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableFaculties(data);
        setUseMockData(false);
      } else {
        // If API fails, use mock data
        console.log('API failed, using mock data');
        const mockData = mockFaculties[institutionId] || [];
        setAvailableFaculties(mockData);
        setUseMockData(true);
      }
    } catch (error) {
      // If network error, use mock data
      console.log('Network error, using mock data:', error);
      const mockData = mockFaculties[institutionId] || [];
      setAvailableFaculties(mockData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // Get suggested faculties for quick add
  const getSuggestedFaculties = () => {
    if (!newFaculty.institutionId) return [];
    
    const selectedInstitution = institutions.find(inst => inst.id === newFaculty.institutionId);
    if (!selectedInstitution) return [];
    
    return institutionFaculties[selectedInstitution.name] || [];
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newFaculty.institutionId) {
      setError('Please select an institution');
      return;
    }
    if (!newFaculty.name.trim()) {
      setError('Please enter a faculty name');
      return;
    }
    if (!newFaculty.description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If using mock data, simulate adding to the list
      if (useMockData) {
        const newFacultyObj = {
          id: Date.now(), // Simple ID generation for mock
          name: newFaculty.name.trim(),
          institutionId: newFaculty.institutionId
        };
        setAvailableFaculties(prev => [...prev, newFacultyObj]);
        alert('Faculty added successfully!');
        
        // Notify parent component about the update
        if (onFacultyUpdate) {
          onFacultyUpdate(newFaculty.institutionId, [...availableFaculties, newFacultyObj]);
        }
      } else {
        // Real API call
        const response = await fetch('http://localhost:8081/api/faculties', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            institutionId: newFaculty.institutionId,
            name: newFaculty.name.trim(),
            description: newFaculty.description.trim()
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert('Faculty added successfully!');
          // Refresh the faculties list
          fetchFaculties(newFaculty.institutionId);
          
          // Notify parent component about the update
          if (onFacultyUpdate) {
            onFacultyUpdate(newFaculty.institutionId);
          }
        } else {
          throw new Error(result.error || `Failed to add faculty: ${response.status}`);
        }
      }

      // Reset form
      setNewFaculty({ 
        institutionId: newFaculty.institutionId, // Keep institution selected
        name: '', 
        description: '' 
      });
      
      // Refresh data if callback provided
      if (fetchDashboardData) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      setError(error.message || 'Error adding faculty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (facultyName) => {
    if (!newFaculty.institutionId) {
      alert('Please select an institution first');
      return;
    }

    setLoading(true);
    try {
      // If using mock data, simulate adding to the list
      if (useMockData) {
        const newFacultyObj = {
          id: Date.now(),
          name: facultyName,
          institutionId: newFaculty.institutionId
        };
        setAvailableFaculties(prev => [...prev, newFacultyObj]);
        alert(`Faculty "${facultyName}" added successfully.`);
        
        // Notify parent component about the update
        if (onFacultyUpdate) {
          onFacultyUpdate(newFaculty.institutionId, [...availableFaculties, newFacultyObj]);
        }
      } else {
        // Real API call
        const response = await fetch('http://localhost:8081/api/faculties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            institutionId: newFaculty.institutionId,
            name: facultyName,
            description: ''
          }),
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Faculty "${facultyName}" added successfully.`);
          fetchFaculties(newFaculty.institutionId);
          
          // Notify parent component about the update
          if (onFacultyUpdate) {
            onFacultyUpdate(newFaculty.institutionId);
          }
        } else {
          const errorData = await response.json();
          alert(`Failed to add faculty: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty: Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) {
      return;
    }

    try {
      // If using mock data, simulate deletion
      if (useMockData) {
        setAvailableFaculties(prev => prev.filter(faculty => faculty.id !== facultyId));
        alert('Faculty deleted successfully.');
        
        // Notify parent component about the update
        if (onFacultyUpdate) {
          onFacultyUpdate(newFaculty.institutionId, availableFaculties.filter(faculty => faculty.id !== facultyId));
        }
      } else {
        // Real API call
        const response = await fetch(`http://localhost:8081/api/faculties/${facultyId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Faculty deleted successfully.');
          fetchFaculties(newFaculty.institutionId);
          
          // Notify parent component about the update
          if (onFacultyUpdate) {
            onFacultyUpdate(newFaculty.institutionId);
          }
        } else {
          alert('Failed to delete faculty.');
        }
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Failed to delete faculty.');
    }
  };

  const handleInputChange = (field, value) => {
    setNewFaculty(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
    
    // Fetch faculties when institution changes
    if (field === 'institutionId') {
      fetchFaculties(value);
    }
  };

  const suggestedFaculties = getSuggestedFaculties();
  const selectedInstitutionName = institutions.find(inst => inst.id === newFaculty.institutionId)?.name;

  return (
    <div className="administration-content" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Add New Faculty</h2>
      
      {/* Debug info */}
      {useMockData && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          <strong>Note:</strong> Using mock data for demonstration. Faculties will not be saved to the database.
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          border: '1px solid #ffcccc'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleAddFaculty} className="admin-form" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Select Institution *
          </label>
          <select
            value={newFaculty.institutionId}
            onChange={(e) => handleInputChange('institutionId', e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          >
            <option value="">Select an institution</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Faculty Name *
          </label>
          <input
            type="text"
            value={newFaculty.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={loading}
            placeholder="Enter faculty name (e.g., Faculty of Information Technology)"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description *
          </label>
          <textarea
            value={newFaculty.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="4"
            required
            disabled={loading}
            placeholder="Enter faculty description, programs offered, etc."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
              resize: 'vertical',
              minHeight: '100px',
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = '#007bff';
          }}
        >
          {loading ? (
            <>
              <span style={{ marginRight: '8px' }}>⏳</span>
              Adding Faculty...
            </>
          ) : (
            <>
              <span style={{ marginRight: '8px' }}>➕</span>
              Add Faculty
            </>
          )}
        </button>
      </form>

      {/* Quick Add Suggestions */}
      {newFaculty.institutionId && suggestedFaculties.length > 0 && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            Suggested Faculties for {selectedInstitutionName}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {suggestedFaculties.map((faculty, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(faculty)}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                + {faculty}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display existing faculties with delete option */}
      {newFaculty.institutionId && (
        <div>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>
            Faculties at {selectedInstitutionName}
            {useMockData && <span style={{ fontSize: '14px', color: '#7f8c8d', marginLeft: '10px' }}>(Mock Data)</span>}
          </h2>
          
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#7f8c8d'
            }}>
              Loading faculties...
            </div>
          ) : availableFaculties.length > 0 ? (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Faculty Name</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableFaculties.map((faculty) => (
                    <tr key={faculty.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{faculty.name}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteFaculty(faculty.id)}
                          style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#7f8c8d',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p>No faculties found for this institution. Add your first faculty above.</p>
              {suggestedFaculties.length > 0 && (
                <p style={{ marginTop: '10px' }}>
                  Use the quick-add buttons above to add common faculties for {selectedInstitutionName}.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddFaculty;