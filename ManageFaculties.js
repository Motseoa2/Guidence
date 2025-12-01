import React, { useState, useEffect } from 'react';

const ManageFaculties = () => {
    const [faculties, setFaculties] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all faculties
    const fetchFaculties = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/faculties');
            const data = await response.json();
            setFaculties(data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            alert('Failed to load faculties');
        }
    };

    // Fetch institutions
    const fetchInstitutions = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/institutions');
            const data = await response.json();
            setInstitutions(data);
        } catch (error) {
            console.error('Error fetching institutions:', error);
        }
    };

    // Delete faculty
    const handleDeleteFaculty = async (facultyId) => {
        if (!window.confirm('Are you sure you want to delete this faculty? This will also delete all courses under this faculty.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/faculties/${facultyId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Faculty deleted successfully.');
                fetchFaculties();
            } else {
                alert('Failed to delete faculty.');
            }
        } catch (error) {
            console.error('Error deleting faculty:', error);
            alert('Failed to delete faculty');
        }
    };

    // Get institution name by ID
    const getInstitutionName = (institutionId) => {
        const institution = institutions.find(inst => inst.id === institutionId);
        return institution ? institution.name : 'N/A';
    };

    // Load data on component mount
    useEffect(() => {
        fetchFaculties();
        fetchInstitutions();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Manage Faculties</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                View and manage all faculties. Deleting a faculty will also remove all associated courses.
            </p>

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
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Institution</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Faculty Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculties.map(faculty => (
                                <tr key={faculty.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {getInstitutionName(faculty.institutionId)}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                        {faculty.name}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {faculty.description || 'No description provided'}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        <button 
                                            onClick={() => handleDeleteFaculty(faculty.id)}
                                            style={{
                                                padding: '5px 10px',
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
                    <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No Faculties Found</h3>
                    <p style={{ color: '#6c757d' }}>No faculties have been created yet. Add your first faculty using the "Add Faculty" section.</p>
                </div>
            )}
        </div>
    );
};

export default ManageFaculties;