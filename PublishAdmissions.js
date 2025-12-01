import React, { useState, useEffect } from 'react';

const PublishAdmissions = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all applications for admin
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/applications');
                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const data = await response.json();
                setApplications(data);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError('Failed to load applications. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Handle status update (Accept, Reject, Waitlist)
    const handleStatusUpdate = async (applicationId, status) => {
        try {
            const response = await fetch(`http://localhost:8081/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            // Update UI after successful status change
            setApplications(applications.map(app => 
                app.id === applicationId ? { ...app, status } : app
            ));
            
            alert(`Application status updated to ${status} successfully!`);
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Failed to update application status. Please try again.');
        }
    };

    // Refresh applications list
    const refreshApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8081/api/applications');
            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get display names
    const getDisplayNames = (application) => {
        return {
            institutionName: application.institution_name || application.institutionName || application.institution_name || 'N/A',
            courseName: application.course_name || application.courseName || application.course_name || 'N/A',
            studentName: application.name || application.studentName || 'N/A',
            studentEmail: application.email || application.studentEmail || 'N/A'
        };
    };

    if (loading) {
        return (
            <div>
                <h2>Publish Admissions</h2>
                <p>Loading applications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Publish Admissions</h2>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={refreshApplications}>Try Again</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Publish Admissions</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={refreshApplications} 
                    style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#35424a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh Applications
                </button>
            </div>

            {applications.length === 0 ? (
                <p>No applications found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Institution</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Course</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((application) => {
                            const { institutionName, courseName, studentName, studentEmail } = getDisplayNames(application);
                            
                            return (
                                <tr key={application.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{studentName}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{studentEmail}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{institutionName}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{courseName}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: 
                                                application.status === 'Accepted' ? '#d4edda' :
                                                application.status === 'Rejected' ? '#f8d7da' :
                                                application.status === 'Waitlist' ? '#fff3cd' : '#e2e3e5',
                                            color: 
                                                application.status === 'Accepted' ? '#155724' :
                                                application.status === 'Rejected' ? '#721c24' :
                                                application.status === 'Waitlist' ? '#856404' : '#383d41',
                                            fontWeight: 'bold'
                                        }}>
                                            {application.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        {(!application.status || application.status === 'Pending') && (
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button 
                                                    onClick={() => handleStatusUpdate(application.id, 'Accepted')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(application.id, 'Rejected')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(application.id, 'Waitlist')}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#ffc107',
                                                        color: 'black',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Waitlist
                                                </button>
                                            </div>
                                        )}
                                        {application.status === 'Accepted' && (
                                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>Accepted</span>
                                        )}
                                        {application.status === 'Rejected' && (
                                            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Rejected</span>
                                        )}
                                        {application.status === 'Waitlist' && (
                                            <span style={{ color: '#856404', fontWeight: 'bold' }}>Waitlisted</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p>Total Applications: {applications.length}</p>
                <p>
                    Accepted: {applications.filter(app => app.status === 'Accepted').length} | 
                    Rejected: {applications.filter(app => app.status === 'Rejected').length} | 
                    Waitlisted: {applications.filter(app => app.status === 'Waitlist').length} | 
                    Pending: {applications.filter(app => !app.status || app.status === 'Pending').length}
                </p>
            </div>
        </div>
    );
};

export default PublishAdmissions;