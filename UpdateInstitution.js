import React, { useState, useEffect } from 'react';

const UpdateInstitution = ({ institutions, setInstitutions }) => {
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        address: '', 
        contact: '', 
        description: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Reset messages when selection changes
    useEffect(() => {
        setError('');
        setSuccess('');
    }, [selectedInstitution]);

    // Populate form when institution is selected
    useEffect(() => {
        if (selectedInstitution) {
            const institution = institutions.find(inst => inst.id === selectedInstitution);
            if (institution) {
                setFormData({
                    name: institution.name || '',
                    email: institution.email || '',
                    address: institution.address || institution.location || '', // Support both address and location
                    contact: institution.contact || '',
                    description: institution.description || '',
                    status: institution.status || 'active'
                });
            }
        } else {
            // Reset form when no institution is selected
            setFormData({ 
                name: '', 
                email: '', 
                address: '', 
                contact: '', 
                description: '',
                status: 'active'
            });
        }
    }, [selectedInstitution, institutions]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!selectedInstitution) {
            setError('Please select an institution to update');
            return;
        }

        // Validation
        if (!formData.name.trim()) {
            setError('Institution name is required');
            return;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return;
        }
        if (!formData.address.trim()) {
            setError('Address is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:8081/api/institutions/${selectedInstitution}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    address: formData.address.trim(),
                    contact: formData.contact.trim(),
                    description: formData.description.trim(),
                    status: formData.status
                })
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess('Institution updated successfully!');
                
                // Update the institutions list in parent component
                const updatedInstitutions = institutions.map(inst => 
                    inst.id === selectedInstitution 
                        ? { ...inst, ...formData }
                        : inst
                );
                setInstitutions(updatedInstitutions);

                // Reset form after successful update
                setTimeout(() => {
                    setSelectedInstitution('');
                    setSuccess('');
                }, 2000);

            } else {
                throw new Error(result.error || `Failed to update institution: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating institution:', error);
            setError(error.message || 'Failed to update institution. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleReset = () => {
        setSelectedInstitution('');
        setFormData({ 
            name: '', 
            email: '', 
            address: '', 
            contact: '', 
            description: '',
            status: 'active'
        });
        setError('');
        setSuccess('');
    };

    return (
        <div className="update-container" style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
        }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Update Institution</h2>
            
            {/* Success Message */}
            {success && (
                <div style={{ 
                    color: '#155724', 
                    backgroundColor: '#d4edda', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    marginBottom: '15px',
                    border: '1px solid #c3e6cb'
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
                    borderRadius: '4px', 
                    marginBottom: '15px',
                    border: '1px solid #f5c6cb'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Institution Selection */}
            <div className="form-section" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Select Institution to Update *
                </label>
                <select 
                    value={selectedInstitution} 
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                >
                    <option value="">Choose an institution...</option>
                    {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>
                            {inst.name} {inst.status === 'inactive' ? '(Inactive)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Update Form */}
            {selectedInstitution && (
                <form onSubmit={handleUpdate} className="update-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Institution Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Enter institution name"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Enter email address"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Contact Number
                            </label>
                            <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) => handleInputChange('contact', e.target.value)}
                                disabled={loading}
                                placeholder="Enter contact number"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Address *
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter full address"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows="4"
                            disabled={loading}
                            placeholder="Enter institution description"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ marginRight: '8px' }}>⏳</span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <span style={{ marginRight: '8px' }}>💾</span>
                                    Update Institution
                                </>
                            )}
                        </button>

                        <button 
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Help Text */}
            {!selectedInstitution && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#e9ecef', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#495057'
                }}>
                    <strong>💡 Tip:</strong> Select an institution from the dropdown above to edit its details. 
                    All fields marked with * are required.
                </div>
            )}
        </div>
    );
};

export default UpdateInstitution;