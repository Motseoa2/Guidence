import React, { useState, useEffect } from 'react';

const DeleteInstitution = ({ institutions, setInstitutions }) => {
    const [institutionToDelete, setInstitutionToDelete] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const handleDeleteInstitution = async () => {
        if (!institutionToDelete) {
            alert("Please select an institution to delete");
            return;
        }

        if (deleteConfirm !== 'DELETE') {
            alert("Please type 'DELETE' in the confirmation box to proceed");
            return;
        }

        const selectedInstitution = institutions.find(inst => inst.id === institutionToDelete);
        if (!selectedInstitution) {
            alert("Selected institution not found");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // First, check if there are any dependencies
            const checkResponse = await fetch(`http://localhost:8081/api/institutions/${institutionToDelete}/dependencies`);
            
            if (!checkResponse.ok) {
                throw new Error('Failed to check institution dependencies');
            }

            const dependencies = await checkResponse.json();
            
            if (dependencies.hasDependencies) {
                const confirmMessage = `This institution has ${dependencies.facultiesCount} faculties and ${dependencies.coursesCount} courses. ` +
                    `Deleting it will also remove all associated faculties and courses. Are you sure you want to continue?`;
                
                if (!window.confirm(confirmMessage)) {
                    setLoading(false);
                    return;
                }
            }

            // Proceed with deletion
            const response = await fetch(`http://localhost:8081/api/institutions/${institutionToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Institution deleted successfully");
                
                // Update the local state to remove the deleted institution
                const updatedInstitutions = institutions.filter(inst => inst.id !== institutionToDelete);
                setInstitutions(updatedInstitutions);
                
                // Reset the selection and confirmation
                setInstitutionToDelete('');
                setDeleteConfirm('');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete institution');
            }
        } catch (error) {
            console.error('Error deleting institution:', error);
            setError(error.message || 'Failed to delete institution. Please try again.');
            alert(`Failed to delete institution: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInstitutionChange = (e) => {
        setInstitutionToDelete(e.target.value);
        setDeleteConfirm(''); // Clear confirmation when institution changes
        setError(''); // Clear error when user changes selection
    };

    const selectedInstitution = institutions.find(inst => inst.id === institutionToDelete);

    return (
        <div style={{ maxWidth: '800px', margin: '20px 0', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Delete Institution</h1>
            
            {error && (
                <div style={{
                    color: '#721c24',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '30px'
            }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Select Institution to Delete
                    </label>
                    <select 
                        value={institutionToDelete} 
                        onChange={handleInstitutionChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                        disabled={loading}
                    >
                        <option value="">Choose an institution...</option>
                        {Array.isArray(institutions) && institutions.map((institution) => (
                            <option key={institution.id} value={institution.id}>
                                {institution.name} - {institution.location} ({institution.email})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedInstitution && (
                    <>
                        <div style={{ 
                            margin: '20px 0', 
                            padding: '15px', 
                            backgroundColor: '#fff3cd', 
                            border: '1px solid #ffeaa7',
                            borderRadius: '4px'
                        }}>
                            <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ Warning</h4>
                            <p style={{ margin: 0, color: '#856404' }}>
                                You are about to delete <strong>{selectedInstitution.name}</strong>. This action will:
                            </p>
                            <ul style={{ margin: '10px 0', color: '#856404' }}>
                                <li>Permanently delete the institution</li>
                                <li>Remove all associated faculties</li>
                                <li>Remove all associated courses</li>
                                <li>Affect any students associated with this institution</li>
                            </ul>
                            <p style={{ margin: '10px 0 0 0', color: '#856404', fontWeight: 'bold' }}>
                                This action cannot be undone!
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Type "DELETE" to confirm *
                            </label>
                            <input
                                type="text"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                placeholder="Type DELETE here to confirm"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    textTransform: 'uppercase'
                                }}
                                disabled={loading}
                            />
                        </div>

                        <button 
                            onClick={handleDeleteInstitution} 
                            disabled={!institutionToDelete || loading || deleteConfirm !== 'DELETE'}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: (!institutionToDelete || loading || deleteConfirm !== 'DELETE') ? '#6c757d' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (!institutionToDelete || loading || deleteConfirm !== 'DELETE') ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                width: '100%'
                            }}
                        >
                            {loading ? 'Deleting...' : `Delete ${selectedInstitution.name}`}
                        </button>
                    </>
                )}
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>
                    Current Institutions ({institutions.length})
                </h3>
                {Array.isArray(institutions) && institutions.length > 0 ? (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {institutions.map((institution, index) => (
                                    <tr 
                                        key={institution.id} 
                                        style={{ 
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #eee'
                                        }}
                                    >
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{institution.name}</td>
                                        <td style={{ padding: '12px' }}>{institution.email}</td>
                                        <td style={{ padding: '12px' }}>{institution.location}</td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                                            {institution.id}
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
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <p>No institutions found in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteInstitution;