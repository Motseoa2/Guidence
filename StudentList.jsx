import React, { useState, useEffect } from 'react';

const AllStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [editData, setEditData] = useState({});
    const [password, setPassword] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAllStudents();
    }, []);

    const fetchAllStudents = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('http://localhost:8081/api/students');
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setEditData({ 
            name: student.name || '', 
            email: student.email || '',
            oldEmail: student.email // Keep original email for update
        });
        setPassword('');
        setUpdateError('');
        setUpdateSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setUpdateError('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setUpdateError('');
        setUpdateSuccess('');

        if (!password) {
            setUpdateError('Password is required for verification.');
            setActionLoading(false);
            return;
        }

        if (!editData.name || !editData.email) {
            setUpdateError('Name and email are required.');
            setActionLoading(false);
            return;
        }

        try {
            // Verify password
            const verifyResponse = await fetch('http://localhost:8081/api/student/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: editingStudent.email, 
                    password 
                }),
            });

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                setUpdateError(errorData.message || 'Password verification failed.');
                setActionLoading(false);
                return;
            }

            // Update student profile
            const updateResponse = await fetch('http://localhost:8081/api/students/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editData.name,
                    email: editData.email,
                    oldEmail: editData.oldEmail
                }),
            });

            if (updateResponse.ok) {
                setUpdateSuccess('Student profile updated successfully!');
                
                // Refresh the students list
                setTimeout(() => {
                    fetchAllStudents();
                    setEditingStudent(null);
                }, 1500);
            } else {
                const errorData = await updateResponse.json();
                setUpdateError(errorData.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            setUpdateError('Network error occurred.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to delete "${studentName}"? This will also delete their applications.`)) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/students/${studentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Student deleted successfully!');
                fetchAllStudents();
            } else {
                alert('Failed to delete student.');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Network error occurred.');
        } finally {
            setActionLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingStudent(null);
        setEditData({});
        setPassword('');
        setUpdateError('');
        setUpdateSuccess('');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading students...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error Loading Students</h2>
                <p>{error}</p>
                <button onClick={fetchAllStudents} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="all-students-container">
            <div className="header-section">
                <h2>Registered Students</h2>
                <p className="subtitle">
                    Manage all student accounts in the system
                </p>
            </div>

            {students.length === 0 ? (
                <div className="empty-state">
                    <h3>No Students Found</h3>
                    <p>There are no students registered in the system yet.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Registration Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="student-row">
                                    <td className="student-name">
                                        <strong>{student.name}</strong>
                                    </td>
                                    <td className="student-email">{student.email}</td>
                                    <td className="registration-date">
                                        {student.createdAt ? 
                                            new Date(student.createdAt).toLocaleDateString() : 
                                            'N/A'
                                        }
                                    </td>
                                    <td className="actions">
                                        <button 
                                            onClick={() => handleEditClick(student)}
                                            className="edit-btn"
                                            disabled={actionLoading}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteStudent(student.id, student.name)}
                                            className="delete-btn"
                                            disabled={actionLoading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editingStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Student Profile</h3>
                            <button 
                                onClick={cancelEdit} 
                                className="close-btn"
                                disabled={actionLoading}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdate} className="edit-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleInputChange}
                                    required
                                    disabled={actionLoading}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={editData.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled={actionLoading}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="password">
                                    Verify Password *
                                    <span className="help-text">Enter student's password to confirm changes</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    disabled={actionLoading}
                                    placeholder="Enter current password"
                                />
                            </div>

                            {updateError && (
                                <div className="error-message">
                                    {updateError}
                                </div>
                            )}

                            {updateSuccess && (
                                <div className="success-message">
                                    {updateSuccess}
                                </div>
                            )}

                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="update-btn"
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Updating...' : 'Update Profile'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={cancelEdit}
                                    className="cancel-btn"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .all-students-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .header-section {
                    margin-bottom: 30px;
                }

                .header-section h2 {
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .subtitle {
                    color: #6c757d;
                    font-size: 14px;
                }

                .loading-container,
                .error-container,
                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-container {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    border-radius: 8px;
                    padding: 30px;
                }

                .retry-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 15px;
                }

                .empty-state {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 40px;
                }

                .table-container {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .students-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .students-table th {
                    background: #f8f9fa;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    color: #2c3e50;
                    border-bottom: 2px solid #dee2e6;
                }

                .students-table td {
                    padding: 15px;
                    border-bottom: 1px solid #dee2e6;
                }

                .student-row:hover {
                    background: #f8f9fa;
                }

                .actions {
                    display: flex;
                    gap: 8px;
                }

                .edit-btn, .delete-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                }

                .edit-btn {
                    background: #ffc107;
                    color: #000;
                }

                .edit-btn:hover:not(:disabled) {
                    background: #e0a800;
                }

                .delete-btn {
                    background: #dc3545;
                    color: white;
                }

                .delete-btn:hover:not(:disabled) {
                    background: #c82333;
                }

                .edit-btn:disabled, .delete-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #dee2e6;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6c757d;
                }

                .close-btn:hover:not(:disabled) {
                    color: #343a40;
                }

                .edit-form {
                    padding: 20px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                }

                .help-text {
                    display: block;
                    font-weight: normal;
                    color: #6c757d;
                    font-size: 12px;
                    margin-top: 4px;
                }

                .form-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
                }

                .form-group input:disabled {
                    background: #f8f9fa;
                    cursor: not-allowed;
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    border: 1px solid #f5c6cb;
                }

                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    border: 1px solid #c3e6cb;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }

                .update-btn, .cancel-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }

                .update-btn {
                    background: #007bff;
                    color: white;
                }

                .update-btn:hover:not(:disabled) {
                    background: #0056b3;
                }

                .cancel-btn {
                    background: #6c757d;
                    color: white;
                }

                .cancel-btn:hover:not(:disabled) {
                    background: #545b62;
                }

                .update-btn:disabled, .cancel-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .all-students-container {
                        padding: 10px;
                    }

                    .students-table {
                        font-size: 14px;
                    }

                    .students-table th,
                    .students-table td {
                        padding: 10px 8px;
                    }

                    .actions {
                        flex-direction: column;
                        gap: 5px;
                    }

                    .edit-btn, .delete-btn {
                        padding: 8px 12px;
                        font-size: 11px;
                    }

                    .modal-content {
                        margin: 10px;
                    }

                    .form-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default AllStudents;