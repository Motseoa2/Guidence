import React, { useState, useEffect } from 'react';

const ViewApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');

    // Fetch applications for the institute
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://localhost:8081/api/applications');
                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }
                const data = await response.json();
                setApplications(data);
                setFilteredApplications(data); // Initialize filtered applications
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError('Failed to load applications. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Filter applications when filters change
    useEffect(() => {
        let filtered = applications;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Filter by course (you might need to adjust this based on your data structure)
        if (courseFilter !== 'all') {
            filtered = filtered.filter(app => 
                app.course_name === courseFilter || app.courseId === courseFilter
            );
        }

        setFilteredApplications(filtered);
    }, [applications, statusFilter, courseFilter]);

    // Handle application status update
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

            // Update local state
            setApplications(prev => prev.map(app => 
                app.id === applicationId ? { ...app, status } : app
            ));
            
            alert(`Application status updated to ${status} successfully!`);
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Failed to update application status. Please try again.');
        }
    };

    // Refresh applications
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

    // Get unique courses for filter
    const uniqueCourses = [...new Set(applications.map(app => app.course_name || app.courseId))];

    if (loading) {
        return (
            <div className="view-applications">
                <h2>View Applications</h2>
                <p>Loading applications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="view-applications">
                <h2>View Applications</h2>
                <p style={{ color: 'red' }}>{error}</p>
                <button onClick={refreshApplications}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="view-applications">
            <div className="applications-header">
                <h2>Student Applications</h2>
                <button 
                    onClick={refreshApplications} 
                    className="refresh-btn"
                >
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Status:</label>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Waitlist">Waitlist</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Course:</label>
                    <select 
                        value={courseFilter} 
                        onChange={(e) => setCourseFilter(e.target.value)}
                    >
                        <option value="all">All Courses</option>
                        {uniqueCourses.map(course => (
                            <option key={course} value={course}>
                                {course}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Applications Summary */}
            <div className="applications-summary">
                <div className="summary-card">
                    <h3>Total Applications</h3>
                    <span className="count">{applications.length}</span>
                </div>
                <div className="summary-card">
                    <h3>Pending</h3>
                    <span className="count pending">
                        {applications.filter(app => !app.status || app.status === 'pending').length}
                    </span>
                </div>
                <div className="summary-card">
                    <h3>Accepted</h3>
                    <span className="count accepted">
                        {applications.filter(app => app.status === 'Accepted').length}
                    </span>
                </div>
                <div className="summary-card">
                    <h3>Rejected</h3>
                    <span className="count rejected">
                        {applications.filter(app => app.status === 'Rejected').length}
                    </span>
                </div>
            </div>

            {/* Applications List */}
            <div className="applications-list">
                <h3>Applications ({filteredApplications.length})</h3>
                
                {filteredApplications.length === 0 ? (
                    <p>No applications found matching your filters.</p>
                ) : (
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Course</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application) => (
                                <tr key={application.id}>
                                    <td>{application.name || 'N/A'}</td>
                                    <td>{application.email || 'N/A'}</td>
                                    <td>{application.course_name || application.courseId || 'N/A'}</td>
                                    <td>
                                        {application.appliedAt 
                                            ? new Date(application.appliedAt).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${application.status || 'pending'}`}>
                                            {application.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        {(!application.status || application.status === 'pending') && (
                                            <div className="action-buttons">
                                                <button 
                                                    onClick={() => handleStatusUpdate(application.id, 'Accepted')}
                                                    className="btn-accept"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(application.id, 'Rejected')}
                                                    className="btn-reject"
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(application.id, 'Waitlist')}
                                                    className="btn-waitlist"
                                                >
                                                    Waitlist
                                                </button>
                                            </div>
                                        )}
                                        {application.status && application.status !== 'pending' && (
                                            <span className="status-final">
                                                {application.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx>{`
                .view-applications {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .applications-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .refresh-btn {
                    padding: 8px 16px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .filters-section {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .filter-group label {
                    font-weight: bold;
                    color: #555;
                }

                .filter-group select {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .applications-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .summary-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }

                .summary-card h3 {
                    margin: 0 0 10px 0;
                    color: #666;
                    font-size: 14px;
                }

                .summary-card .count {
                    font-size: 2rem;
                    font-weight: bold;
                }

                .summary-card .pending { color: #f39c12; }
                .summary-card .accepted { color: #27ae60; }
                .summary-card .rejected { color: #e74c3c; }

                .applications-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .applications-table th,
                .applications-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }

                .applications-table th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    color: #555;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }

                .status-pending { background: #fff3cd; color: #856404; }
                .status-Accepted { background: #d4edda; color: #155724; }
                .status-Rejected { background: #f8d7da; color: #721c24; }
                .status-Waitlist { background: #d1ecf1; color: #0c5460; }

                .action-buttons {
                    display: flex;
                    gap: 5px;
                }

                .btn-accept {
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .btn-reject {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .btn-waitlist {
                    background: #ffc107;
                    color: black;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .status-final {
                    font-weight: bold;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default ViewApplications;