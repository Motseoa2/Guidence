import React, { useState, useEffect } from 'react';

const PublishAdmissions = () => {
    const [currentInstitute, setCurrentInstitute] = useState(null);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [publishing, setPublishing] = useState(false);

    // Get current institute and load data
    useEffect(() => {
        const instituteUser = JSON.parse(localStorage.getItem('instituteUser'));
        if (instituteUser) {
            setCurrentInstitute(instituteUser);
            fetchApplications(instituteUser.id);
            fetchCourses(instituteUser.id);
        }
    }, []);

    // Fetch applications for current institute
    const fetchApplications = async (instituteId) => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/applications');
            if (!response.ok) throw new Error('Failed to fetch applications');
            const data = await response.json();
            
            // Filter applications for current institute and enrich with student/course details
            const instituteApplications = data.filter(app => app.institutionId === instituteId);
            
            const enrichedApplications = await Promise.all(
                instituteApplications.map(async (app) => {
                    try {
                        // Get student details
                        const studentResponse = await fetch(`http://localhost:8081/api/students/${app.studentId}`);
                        const student = studentResponse.ok ? await studentResponse.json() : { name: 'Unknown Student' };
                        
                        // Get course details
                        const courseResponse = await fetch(`http://localhost:8081/api/courses/${app.courseId}`);
                        const course = courseResponse.ok ? await courseResponse.json() : { name: 'Unknown Course' };
                        
                        return {
                            ...app,
                            student_name: student.name,
                            course_name: course.name
                        };
                    } catch (error) {
                        return app;
                    }
                })
            );
            
            setApplications(enrichedApplications);
            setFilteredApplications(enrichedApplications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setMessage('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    // Fetch courses for current institute
    const fetchCourses = async (instituteId) => {
        try {
            const response = await fetch('http://localhost:8081/api/courses');
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();
            
            // Filter courses for current institute
            const instituteCourses = data.filter(course => course.institutionId === instituteId);
            setCourses(instituteCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    // Filter applications based on selected course and status
    useEffect(() => {
        let filtered = applications;
        
        if (selectedCourse && selectedCourse !== 'all') {
            filtered = filtered.filter(app => app.courseId === selectedCourse);
        }
        
        if (selectedStatus && selectedStatus !== 'all') {
            filtered = filtered.filter(app => app.status === selectedStatus);
        }
        
        setFilteredApplications(filtered);
    }, [selectedCourse, selectedStatus, applications]);

    // Handle application status change
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8081/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setMessage(`Application status updated to ${newStatus}`);
                // Refresh applications
                fetchApplications(currentInstitute.id);
            } else {
                setMessage('Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            setMessage('Error updating application status');
        }
    };

    // Publish admissions (mark all as final)
    const handlePublishAdmissions = async () => {
        if (!window.confirm('Are you sure you want to publish admissions? This will notify all students of their final status.')) {
            return;
        }

        setPublishing(true);
        setMessage('');

        try {
            // Update all applications to mark them as published
            const publishPromises = applications.map(app => 
                fetch(`http://localhost:8081/api/applications/${app.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ published: true, publishedAt: new Date() }),
                })
            );

            await Promise.all(publishPromises);
            setMessage('✅ Admissions published successfully! Students have been notified.');
            
            // Refresh applications
            fetchApplications(currentInstitute.id);
        } catch (error) {
            console.error('Error publishing admissions:', error);
            setMessage('❌ Failed to publish admissions');
        } finally {
            setPublishing(false);
        }
    };

    // Get status count
    const getStatusCount = (status) => {
        return applications.filter(app => app.status === status).length;
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Accepted':
                return { bg: '#d4edda', color: '#155724', text: 'Admitted' };
            case 'Rejected':
                return { bg: '#f8d7da', color: '#721c24', text: 'Rejected' };
            case 'Waitlist':
                return { bg: '#fff3cd', color: '#856404', text: 'Waitlisted' };
            default:
                return { bg: '#e2e3e5', color: '#383d41', text: 'Pending' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2>Publish Admissions</h2>
            
            {message && (
                <div style={{ 
                    padding: '10px', 
                    margin: '10px 0', 
                    backgroundColor: message.includes('✅') ? '#e8f5e8' : '#ffebee',
                    color: message.includes('✅') ? '#2e7d32' : '#c62828',
                    borderRadius: '4px',
                    border: `1px solid ${message.includes('✅') ? '#c8e6c9' : '#ffcdd2'}`
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

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#e8f5e8', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #c8e6c9'
                }}>
                    <h3 style={{ margin: '0', color: '#2e7d32' }}>{applications.length}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#2e7d32' }}>Total Applications</p>
                </div>
                
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#fff3cd', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #ffeaa7'
                }}>
                    <h3 style={{ margin: '0', color: '#856404' }}>{getStatusCount('pending')}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#856404' }}>Pending Review</p>
                </div>
                
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #c3e6cb'
                }}>
                    <h3 style={{ margin: '0', color: '#155724' }}>{getStatusCount('Accepted')}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#155724' }}>Admitted</p>
                </div>
                
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8d7da', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #f5c6cb'
                }}>
                    <h3 style={{ margin: '0', color: '#721c24' }}>{getStatusCount('Rejected')}</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#721c24' }}>Rejected</p>
                </div>
            </div>

            {/* Filters and Actions */}
            <div style={{ 
                marginBottom: '20px', 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Filter by Course
                        </label>
                        <select 
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Filter by Status
                        </label>
                        <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="Accepted">Admitted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Waitlist">Waitlisted</option>
                        </select>
                    </div>

                    <button 
                        onClick={handlePublishAdmissions}
                        disabled={publishing || applications.length === 0}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: publishing ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (publishing || applications.length === 0) ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {publishing ? 'Publishing...' : '📢 Publish Admissions'}
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <h3>Student Applications ({filteredApplications.length})</h3>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading applications...</p>
                </div>
            ) : filteredApplications.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Student Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Course</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Applied Date</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Current Status</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application) => {
                                const statusBadge = getStatusBadge(application.status);
                                return (
                                    <tr key={application.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                            {application.student_name || 'Unknown Student'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            {application.course_name || 'Unknown Course'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: statusBadge.bg,
                                                color: statusBadge.color,
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {statusBadge.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <select 
                                                value={application.status || 'pending'}
                                                onChange={(e) => handleStatusChange(application.id, e.target.value)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="Accepted">Admit</option>
                                                <option value="Rejected">Reject</option>
                                                <option value="Waitlist">Waitlist</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
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
                    <h4 style={{ color: '#6c757d' }}>No Applications Found</h4>
                    <p style={{ color: '#6c757d' }}>
                        {applications.length === 0 
                            ? 'No students have applied to your courses yet.' 
                            : 'No applications match your current filters.'}
                    </p>
                </div>
            )}

            {/* Instructions */}
            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                backgroundColor: '#fff3cd', 
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
            }}>
                <h4 style={{ color: '#856404', marginTop: '0' }}>📋 How to Publish Admissions:</h4>
                <ol style={{ color: '#856404', marginBottom: '0' }}>
                    <li>Review all student applications using the filters above</li>
                    <li>Set the status for each application (Admit/Reject/Waitlist)</li>
                    <li>Click "Publish Admissions" to notify all students of their results</li>
                    <li>Once published, students will be able to see their admission status</li>
                </ol>
            </div>
        </div>
    );
};

export default PublishAdmissions;