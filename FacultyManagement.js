import React, { useState, useEffect } from 'react';

const FacultyManagement = ({ institutions, fetchDashboardData }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    institutionId: '',
    name: '',
    description: ''
  });

  // Fetch all faculties
  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/faculties');
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      } else {
        alert('Failed to fetch faculties');
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      alert('Error fetching faculties');
    } finally {
      setLoading(false);
    }
  };

  // Add new faculty
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!formData.institutionId || !formData.name || !formData.description) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/faculties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Faculty added successfully!');
        setFormData({ institutionId: '', name: '', description: '' });
        fetchFaculties();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add faculty: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Error adding faculty');
    } finally {
      setLoading(false);
    }
  };

  // Update faculty
  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    if (!editingFaculty) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/faculties/${editingFaculty.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Faculty updated successfully!');
        setEditingFaculty(null);
        setFormData({ institutionId: '', name: '', description: '' });
        fetchFaculties();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to update faculty: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating faculty:', error);
      alert('Error updating faculty');
    } finally {
      setLoading(false);
    }
  };

  // Delete faculty
  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/faculties/${facultyId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Faculty deleted successfully!');
        fetchFaculties();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete faculty: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Error deleting faculty');
    }
  };

  // Start editing a faculty
  const startEditFaculty = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      institutionId: faculty.institutionId,
      name: faculty.name,
      description: faculty.description
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingFaculty(null);
    setFormData({ institutionId: '', name: '', description: '' });
  };

  // Get institution name by ID
  const getInstitutionName = (institutionId) => {
    const institution = institutions.find(inst => inst.id === institutionId);
    return institution ? institution.name : 'Unknown Institution';
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  return (
    <div className="administration-content" style={{ padding: '20px' }}>
      <h2>Faculty Management</h2>
      <p>Manage and update faculties across all institutions.</p>

      {/* Add/Edit Faculty Form */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
        <form onSubmit={editingFaculty ? handleUpdateFaculty : handleAddFaculty}>
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
                Faculty Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                disabled={loading}
                placeholder="Enter faculty name"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              required
              disabled={loading}
              placeholder="Enter faculty description"
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
              {loading ? 'Processing...' : (editingFaculty ? 'Update Faculty' : 'Add Faculty')}
            </button>
            
            {editingFaculty && (
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

      {/* Faculties List */}
      <div>
        <h3>Existing Faculties ({faculties.length})</h3>
        {loading ? (
          <div>Loading faculties...</div>
        ) : faculties.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            No faculties found. Add your first faculty above.
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {faculties.map(faculty => (
              <div 
                key={faculty.id}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#333',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '8px'
                }}>
                  {faculty.name}
                </h4>
                
                <p style={{ 
                  margin: '5px 0', 
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <strong>Institution:</strong> {getInstitutionName(faculty.institutionId)}
                </p>
                
                <p style={{ 
                  margin: '10px 0', 
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {faculty.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '10px',
                  marginTop: '15px',
                  borderTop: '1px solid #eee',
                  paddingTop: '15px'
                }}>
                  <button 
                    onClick={() => startEditFaculty(faculty)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteFaculty(faculty.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                {faculty.createdAt && (
                  <p style={{ 
                    margin: '10px 0 0 0', 
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    Created: {new Date(faculty.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyManagement;