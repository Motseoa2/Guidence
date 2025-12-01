import React, { useState, useEffect } from 'react';

const DeleteInstitution = ({ institutions, setInstitutions }) => {
    const [institutionToDelete, setInstitutionToDelete] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedInstitutionDetails, setSelectedInstitutionDetails] = useState(null);

    // Fetch institutions when component mounts
    const fetchInstitutions = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/institutions');
            if (!response.ok) {
                throw new Error('Failed to fetch institutions');
            }
            const data = await response.json();
            setInstitutions(data);
        } catch (error) {
            console.error('Error fetching institutions:', error);
            setError('Failed to load institutions. Please try again.');
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, [setInstitutions]);

    // Update selected institution details when selection changes
    useEffect(() => {
        if (institutionToDelete) {
            const institution = institutions.find(inst => inst.id === institutionToDelete);
            setSelectedInstitutionDetails(institution);
        } else {
            setSelectedInstitutionDetails(null);
        }
        setError('');
        setSuccess('');
        setShowConfirmation(false);
    }, [institutionToDelete, institutions]);

    const handleDeleteInstitution = async () => {
        if (!institutionToDelete) {
            setError("Please select an institution to delete");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:8081/api/institutions/${institutionToDelete}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess('Institution deleted successfully!');
                
                // Update the local state to remove the deleted institution
                const updatedInstitutions = institutions.filter(inst => inst.id !== institutionToDelete);
                setInstitutions(updatedInstitutions);
                
                // Reset the selection and confirmation
                setInstitutionToDelete('');
                setShowConfirmation(false);
                setSelectedInstitutionDetails(null);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccess('');
                }, 3000);

            } else {
                throw new Error(result.error || 'Failed to delete institution');
            }
        } catch (error) {
            console.error('Error deleting institution:', error);
            setError(error.message || 'Failed to delete institution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInstitutionChange = (e) => {
        setInstitutionToDelete(e.target.value);
        setError('');
        setSuccess('');
    };

    const openConfirmation = () => {
        if (!institutionToDelete) {
            setError("Please select an institution first");
            return;
        }
        setShowConfirmation(true);
    };

    const closeConfirmation = () => {
        setShowConfirmation(false);
    };

    const getAssociatedDataCount = async (institutionId) => {
        // This would typically fetch counts of faculties and courses associated with the institution
        // For now, we'll return a placeholder
        try {
            const facultiesResponse = await fetch('http://localhost:8081/api/faculties');
            const coursesResponse = await fetch('http://localhost:8081/api/courses');
            
            if (facultiesResponse.ok && coursesResponse.ok) {
                const faculties = await facultiesResponse.json();
                const courses = await coursesResponse.json();
                
                const facultyCount = faculties.filter(f => f.institutionId === institutionId).length;
                const courseCount = courses.filter(c => c.institutionId === institutionId).length;
                
                return { facultyCount, courseCount };
            }
        } catch (error) {
            console.error('Error fetching associated data:', error);
        }
        
        return { facultyCount: '?', courseCount: '?' };
    };

    const [associatedData, setAssociatedData] = useState({ facultyCount: 0, courseCount: 0 });

    useEffect(() => {
        if (institutionToDelete) {
            getAssociatedDataCount(institutionToDelete).then(data => {
                setAssociatedData(data);
            });
        }
    }, [institutionToDelete]);

    return (
        <div style={{ 
            maxWidth: '800px', 
            margin: '20px 0',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
        }}>
            <h2 style={{ marginBottom: '20px', color: '#dc3545' }}>Delete Institution</h2>
            
            {/* Success Message */}
            {success && (
                <div style={{
                    color: '#155724',
                    backgroundColor: '#d4edda',
                    padding: '12px',
                    margin: '10px 0',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px'
                }}>
                    ✅ {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    color: '#721c24',
                    backgroundColor: '#f8d7da',
                    padding: '12px',
                    margin: '10px 0',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Institution Selection */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Select Institution to Delete *
                </label>
                <select 
                    value={institutionToDelete} 
                    onChange={handleInstitutionChange}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: loading ? '#f5f5f5' : 'white'
                    }}
                    disabled={loading}
                >
                    <option value="">Choose an institution to delete...</option>
                    {Array.isArray(institutions) && institutions.map((institution) => (
                        <option key={institution.id} value={institution.id}>
                            {institution.name} - {institution.email} {institution.status === 'inactive' ? '(Inactive)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Institution Details */}
            {selectedInstitutionDetails && (
                <div style={{ 
                    margin: '20px 0', 
                    padding: '15px', 
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px'
                }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>
                        Institution Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <strong>Name:</strong> {selectedInstitutionDetails.name}
                        </div>
                        <div>
                            <strong>Email:</strong> {selectedInstitutionDetails.email}
                        </div>
                        <div>
                            <strong>Address:</strong> {selectedInstitutionDetails.address || selectedInstitutionDetails.location || 'N/A'}
                        </div>
                        <div>
                            <strong>Contact:</strong> {selectedInstitutionDetails.contact || 'N/A'}
                        </div>
                        <div>
                            <strong>Status:</strong> 
                            <span style={{ 
                                color: selectedInstitutionDetails.status === 'active' ? '#28a745' : '#dc3545',
                                fontWeight: 'bold',
                                marginLeft: '5px'
                            }}>
                                {selectedInstitutionDetails.status || 'active'}
                            </span>
                        </div>
                        <div>
                            <strong>Associated Data:</strong> {associatedData.facultyCount} faculties, {associatedData.courseCount} courses
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Message */}
            {institutionToDelete && (
                <div style={{ 
                    margin: '15px 0', 
                    padding: '15px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#856404' }}>
                        ⚠️ Critical Warning: 
                    </p>
                    <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                        <li>This action cannot be undone</li>
                        <li>All associated faculties will be permanently deleted</li>
                        <li>All associated courses will be permanently deleted</li>
                        <li>Student applications for these courses will be affected</li>
                    </ul>
                </div>
            )}

            {/* Delete Button */}
            <button 
                onClick={openConfirmation}
                disabled={!institutionToDelete || loading}
                style={{
                    padding: '12px 24px',
                    backgroundColor: !institutionToDelete || loading ? '#6c757d' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !institutionToDelete || loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginRight: '10px'
                }}
            >
                {loading ? 'Processing...' : 'Delete Institution'}
            </button>

            {/* Reset Selection Button */}
            {institutionToDelete && (
                <button 
                    onClick={() => {
                        setInstitutionToDelete('');
                        setError('');
                        setSuccess('');
                        setShowConfirmation(false);
                    }}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Cancel Selection
                </button>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>
                            🚨 Confirm Deletion
                        </h3>
                        
                        <p style={{ marginBottom: '20px' }}>
                            Are you sure you want to delete <strong>"{selectedInstitutionDetails?.name}"</strong>?
                        </p>
                        
                        <div style={{ 
                            backgroundColor: '#fff3cd',
                            padding: '15px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>
                                This will permanently delete:
                            </p>
                            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                                <li>Institution: {selectedInstitutionDetails?.name}</li>
                                <li>{associatedData.facultyCount} associated faculties</li>
                                <li>{associatedData.courseCount} associated courses</li>
                            </ul>
                        </div>

                        <p style={{ fontWeight: 'bold', color: '#dc3545' }}>
                            This action cannot be undone!
                        </p>

                        <div style={{ marginTop: '25px' }}>
                            <button 
                                onClick={handleDeleteInstitution}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: loading ? '#6c757d' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginRight: '10px'
                                }}
                            >
                                {loading ? 'Deleting...' : 'Yes, Delete Permanently'}
                            </button>
                            
                            <button 
                                onClick={closeConfirmation}
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Institutions List */}
            <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>
                    Current Institutions ({Array.isArray(institutions) ? institutions.length : 0})
                </h3>
                
                {Array.isArray(institutions) && institutions.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institutions.map((institution, index) => (
                                    <tr 
                                        key={institution.id}
                                        style={{ 
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #dee2e6'
                                        }}
                                    >
                                        <td style={{ padding: '12px' }}>
                                            <strong>{institution.name}</strong>
                                        </td>
                                        <td style={{ padding: '12px' }}>{institution.email}</td>
                                        <td style={{ padding: '12px' }}>
                                            {institution.address || institution.location}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                color: institution.status === 'active' ? '#28a745' : '#dc3545',
                                                fontWeight: 'bold'
                                            }}>
                                                {institution.status || 'active'}
                                            </span>
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
                        color: '#6c757d',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                    }}>
                        No institutions found in the system.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteInstitution;