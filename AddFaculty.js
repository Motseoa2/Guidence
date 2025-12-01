import React, { useState, useEffect } from 'react';

const AddFaculty = () => {
    const [faculties, setFaculties] = useState([]);
    const [facultyName, setFacultyName] = useState('');
    const [facultyDescription, setFacultyDescription] = useState('');
    const [facultyToEdit, setFacultyToEdit] = useState(null);
    const [editFacultyName, setEditFacultyName] = useState('');
    const [editFacultyDescription, setEditFacultyDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [currentInstitute, setCurrentInstitute] = useState(null);

    // Get current institute on component mount
    useEffect(() => {
        const instituteUser = JSON.parse(localStorage.getItem('instituteUser'));
        if (instituteUser) {
            setCurrentInstitute(instituteUser);
            fetchFaculties(instituteUser.id);
        }
    }, []);

    const fetchFaculties = async (instituteId) => {
        try {
            const response = await fetch('http://localhost:8081/api/faculties');
            if (!response.ok) throw new Error('Failed to fetch faculties');
            const data = await response.json();
            
            // Filter faculties to show only current institute's faculties
            const instituteFaculties = data.filter(faculty => 
                faculty.institutionId === instituteId
            );
            
            setFaculties(instituteFaculties);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            setMessage('Error loading faculties');
        }
    };

    const handleAddOrUpdateFaculty = async (event) => {
        event.preventDefault();
        
        if (!currentInstitute) {
            setMessage('Error: No institute user found. Please log in again.');
            return;
        }

        const nameToUse = facultyToEdit ? editFacultyName : facultyName;
        const descriptionToUse = facultyToEdit ? editFacultyDescription : facultyDescription;

        if (!nameToUse.trim()) {
            setMessage('Please enter a faculty name');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            if (facultyToEdit) {
                // Update existing faculty
                const response = await fetch(`http://localhost:8081/api/faculties/${facultyToEdit.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        name: editFacultyName,
                        description: editFacultyDescription,
                        institutionId: currentInstitute.id
                    }),
                });

                const responseData = await response.json();
                if (!response.ok) throw new Error(responseData.error || 'Failed to update faculty');
                
                setMessage('Faculty updated successfully!');
            } else {
                // Add new faculty
                const response = await fetch('http://localhost:8081/api/faculties', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        name: facultyName,
                        description: facultyDescription,
                        institutionId: currentInstitute.id
                    }),
                });

                const responseData = await response.json();
                if (!response.ok) throw new Error(responseData.error || 'Failed to add faculty');
                
                setMessage('Faculty added successfully!');
            }

            // Refresh data and reset form
            await fetchFaculties(currentInstitute.id);
            resetForm();
            
        } catch (error) {
            console.error('Error saving faculty:', error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFaculty = (faculty) => {
        setFacultyToEdit(faculty);
        setEditFacultyName(faculty.name);
        setEditFacultyDescription(faculty.description || '');
    };

    const handleDeleteFaculty = async (facultyId) => {
        if (!window.confirm('Are you sure you want to delete this faculty? This will also delete all courses under this faculty.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/faculties/${facultyId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete faculty');

            setMessage('Faculty deleted successfully!');
            await fetchFaculties(currentInstitute.id);
        } catch (error) {
            console.error('Error deleting faculty:', error);
            setMessage('Error deleting faculty');
        }
    };

    const resetForm = () => {
        setFacultyName('');
        setFacultyDescription('');
        setFacultyToEdit(null);
        setEditFacultyName('');
        setEditFacultyDescription('');
    };

    const cancelEdit = () => {
        resetForm();
        setMessage('');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>{facultyToEdit ? 'Edit Faculty' : 'Add New Faculty'}</h2>
            
            {message && (
                <div style={{ 
                    padding: '10px', 
                    margin: '10px 0', 
                    backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
                    color: message.includes('Error') ? '#c62828' : '#2e7d32',
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}

            {/* Current Institute Info */}
            {currentInstitute && (
                <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #bbdefb'
                }}>
                    <strong>Your Institution:</strong> {currentInstitute.name}
                </div>
            )}

            <form onSubmit={handleAddOrUpdateFaculty} style={{ 
                marginBottom: '30px', 
                padding: '20px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Faculty Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Faculty of Information Technology"
                            value={facultyToEdit ? editFacultyName : facultyName}
                            onChange={(e) => facultyToEdit ? setEditFacultyName(e.target.value) : setFacultyName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Description
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Computer Science and IT programs"
                            value={facultyToEdit ? editFacultyDescription : facultyDescription}
                            onChange={(e) => facultyToEdit ? setEditFacultyDescription(e.target.value) : setFacultyDescription(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: loading ? '#6c757d' : facultyToEdit ? '#28a745' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Saving...' : (facultyToEdit ? 'Update Faculty' : 'Add Faculty')}
                    </button>
                    
                    {facultyToEdit && (
                        <button 
                            type="button"
                            onClick={cancelEdit}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h3>Your Faculties ({faculties.length})</h3>
            {faculties.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Faculty Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculties.map((faculty) => (
                                <tr key={faculty.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                        {faculty.name}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {faculty.description || 'No description'}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => handleEditFaculty(faculty)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#ffc107',
                                                    color: 'black',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
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
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                }}>
                    <h4 style={{ color: '#6c757d' }}>No Faculties Yet</h4>
                    <p style={{ color: '#6c757d' }}>Add your first faculty above to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AddFaculty;