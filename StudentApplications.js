import React, { useState, useEffect } from 'react';

const StudentApplications = ({ applications, fetchDashboardData }) => {
    const [allApplications, setAllApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterInstitution, setFilterInstitution] = useState('all');
    const [institutions, setInstitutions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState(null);

    // Get authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    // Check if backend is available
    const checkBackend = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/health', {
                method: 'GET'
            });
            return response.ok;
        } catch (error) {
            console.warn('Backend not available:', error.message);
            return false;
        }
    };

    // Fetch applications if not provided via props
    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const backendAvailable = await checkBackend();
                if (!backendAvailable) {
                    setError('Backend server is not available. Using mock data.');
                    // Load mock data for development
                    loadMockApplications();
                    return;
                }

                const token = getAuthToken();
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                console.log('🔍 Fetching applications from backend...');
                const response = await fetch('http://localhost:8081/api/applications', {
                    headers: headers
                });
                
                console.log('📊 Response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Applications data received:', data);
                    
                    // Format the data properly for the table
                    const formattedApplications = data.map(app => ({
                        id: app.id,
                        _id: app.id,
                        studentName: app.name || app.studentName || 'Unknown Student',
                        studentEmail: app.email || app.studentEmail || '',
                        institution: app.institutionId,
                        institutionName: app.institution_name || app.institutionName || 'Unknown Institution',
                        faculty: app.facultyId,
                        courseId: app.courseId,
                        courseName: app.course_name || app.courseName || 'Unknown Course',
                        status: app.status?.toLowerCase() || 'pending',
                        appliedAt: app.appliedAt || app.createdAt || new Date(),
                        updatedAt: app.updatedAt || app.appliedAt || new Date(),
                        notes: app.notes || ''
                    }));
                    
                    setAllApplications(formattedApplications);
                } else {
                    const errorText = await response.text();
                    console.error('❌ Failed to fetch applications:', errorText);
                    setError(`Failed to load applications: ${response.status} ${response.statusText}`);
                    
                    // Fallback to mock data
                    loadMockApplications();
                }
            } catch (error) {
                console.error('❌ Network error fetching applications:', error);
                setError('Network error. Using mock data for demonstration.');
                loadMockApplications();
            } finally {
                setLoading(false);
            }
        };

        if (!applications) {
            fetchApplications();
        } else {
            setAllApplications(applications);
        }
    }, [applications]);

    // Mock data for development
    const loadMockApplications = () => {
        const mockApplications = [
            {
                id: 'app-001',
                studentName: 'John Smith',
                studentEmail: 'john@example.com',
                institution: 'inst1',
                institutionName: 'University of Nairobi',
                faculty: 'fac1',
                courseId: 'cs101',
                courseName: 'Computer Science',
                status: 'pending',
                appliedAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15')
            },
            {
                id: 'app-002',
                studentName: 'Mary Johnson',
                studentEmail: 'mary@example.com',
                institution: 'inst2',
                institutionName: 'Kenyatta University',
                faculty: 'fac2',
                courseId: 'med101',
                courseName: 'Medicine',
                status: 'admitted',
                appliedAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-14')
            },
            {
                id: 'app-003',
                studentName: 'Robert Kimani',
                studentEmail: 'robert@example.com',
                institution: 'inst3',
                institutionName: 'Strathmore University',
                faculty: 'fac3',
                courseId: 'bus101',
                courseName: 'Business Administration',
                status: 'rejected',
                appliedAt: new Date('2024-01-05'),
                updatedAt: new Date('2024-01-12')
            },
            {
                id: 'app-004',
                studentName: 'Sarah Omondi',
                studentEmail: 'sarah@example.com',
                institution: 'inst1',
                institutionName: 'University of Nairobi',
                faculty: 'fac1',
                courseId: 'eng101',
                courseName: 'Engineering',
                status: 'under_review',
                appliedAt: new Date('2024-01-18'),
                updatedAt: new Date('2024-01-18')
            }
        ];
        
        setAllApplications(mockApplications);
    };

    // Fetch institutions and courses for filtering
    useEffect(() => {
        const fetchData = async () => {
            try {
                const backendAvailable = await checkBackend();
                if (!backendAvailable) {
                    // Use mock data for development
                    const mockInstitutions = [
                        { id: 'inst1', name: 'University of Nairobi' },
                        { id: 'inst2', name: 'Kenyatta University' },
                        { id: 'inst3', name: 'Strathmore University' }
                    ];
                    
                    const mockCourses = [
                        { id: 'cs101', name: 'Computer Science' },
                        { id: 'med101', name: 'Medicine' },
                        { id: 'bus101', name: 'Business Administration' },
                        { id: 'eng101', name: 'Engineering' }
                    ];
                    
                    setInstitutions(mockInstitutions);
                    setCourses(mockCourses);
                    return;
                }

                const token = getAuthToken();
                const headers = {
                    'Content-Type': 'application/json',
                };
                
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const [instResponse, coursesResponse] = await Promise.all([
                    fetch('http://localhost:8081/api/institutions', { headers }),
                    fetch('http://localhost:8081/api/courses', { headers })
                ]);

                if (instResponse.ok) {
                    const instData = await instResponse.json();
                    setInstitutions(Array.isArray(instData) ? instData : []);
                }

                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    setCourses(Array.isArray(coursesData) ? coursesData : []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Filter applications based on status and institution
    const filteredApplications = allApplications.filter(app => {
        const statusMatch = filterStatus === 'all' || app.status === filterStatus;
        const institutionMatch = filterInstitution === 'all' || 
                               app.institution === filterInstitution ||
                               app.institutionId === filterInstitution;
        return statusMatch && institutionMatch;
    });

    // Handle application status update - UPDATED
    const handleStatusUpdate = async (applicationId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change this application to ${newStatus.toUpperCase()}?`)) {
            return;
        }

        setUpdatingId(applicationId);
        setError(null);

        try {
            const backendAvailable = await checkBackend();
            if (!backendAvailable) {
                // Update local state only for mock data
                updateLocalApplicationStatus(applicationId, newStatus);
                alert('⚠️ Backend not available. Status updated locally only.');
                setUpdatingId(null);
                return;
            }

            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('🔄 Updating application:', applicationId, 'to status:', newStatus);
            
            const updateData = {
                status: newStatus.toLowerCase(),
                updatedBy: 'admin', // You can get this from auth context
                notes: `Status changed to ${newStatus}`,
                updatedAt: new Date().toISOString()
            };

            console.log('📦 Sending update data:', updateData);

            // Try PUT endpoint first (this is the new endpoint you added)
            let response = await fetch(`http://localhost:8081/api/applications/${applicationId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(updateData)
            });

            console.log('🔍 PUT Response status:', response.status);

            if (response.ok) {
                const updatedData = await response.json();
                console.log('✅ PUT Update successful:', updatedData);
                
                // Update local state with the response
                updateLocalApplicationStatus(applicationId, newStatus);
                
                alert(`✅ Application status updated to ${newStatus.toUpperCase()} successfully!`);
                
            } else if (response.status === 404) {
                // Try PATCH endpoint as fallback
                console.log('🔄 Trying PATCH endpoint...');
                response = await fetch(`http://localhost:8081/api/applications/${applicationId}`, {
                    method: 'PATCH',
                    headers: headers,
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    const updatedData = await response.json();
                    console.log('✅ PATCH Update successful:', updatedData);
                    
                    updateLocalApplicationStatus(applicationId, newStatus);
                    alert(`✅ Application status updated to ${newStatus.toUpperCase()} successfully!`);
                    
                } else {
                    // Try the status-specific endpoint
                    console.log('🔄 Trying status-specific endpoint...');
                    response = await fetch(`http://localhost:8081/api/applications/${applicationId}/status`, {
                        method: 'PATCH',
                        headers: headers,
                        body: JSON.stringify({ status: newStatus })
                    });

                    if (response.ok) {
                        console.log('✅ Status endpoint update successful');
                        updateLocalApplicationStatus(applicationId, newStatus);
                        alert(`✅ Application status updated to ${newStatus.toUpperCase()} successfully!`);
                        
                    } else {
                        const errorText = await response.text();
                        console.error('❌ All update attempts failed:', errorText);
                        
                        // Update locally for user feedback
                        updateLocalApplicationStatus(applicationId, newStatus);
                        alert(`⚠️ API update failed. Status updated locally only.`);
                    }
                }
            } else {
                const errorText = await response.text();
                console.error('❌ PUT request failed:', errorText);
                
                // Update locally for user feedback
                updateLocalApplicationStatus(applicationId, newStatus);
                alert(`⚠️ API error. Status updated locally only.`);
            }

        } catch (error) {
            console.error('❌ Network error updating application:', error);
            setError('Network error. Status updated locally only.');
            
            // Update locally for user feedback
            updateLocalApplicationStatus(applicationId, newStatus);
            alert('⚠️ Network error. Status updated locally only.');
            
        } finally {
            setUpdatingId(null);
            
            // Refresh dashboard if callback provided
            if (fetchDashboardData) {
                setTimeout(() => fetchDashboardData(), 1000);
            }
        }
    };

    // Helper function to update local state
    const updateLocalApplicationStatus = (applicationId, newStatus) => {
        setAllApplications(prev => prev.map(app => {
            if (app.id === applicationId || app._id === applicationId) {
                return { 
                    ...app, 
                    status: newStatus.toLowerCase(),
                    updatedAt: new Date().toISOString(),
                    notes: `Status changed to ${newStatus}`
                };
            }
            return app;
        }));
    };

    // Get institution name by ID
    const getInstitutionName = (institutionId) => {
        if (!institutionId) return 'Unknown Institution';
        
        const institution = institutions.find(inst => 
            inst.id === institutionId || inst._id === institutionId || inst.institutionId === institutionId
        );
        return institution ? institution.name : 'Unknown Institution';
    };

    // Get course name by ID
    const getCourseName = (courseId) => {
        if (!courseId) return 'Unknown Course';
        
        const course = courses.find(c => 
            c.id === courseId || c._id === courseId || c.courseId === courseId
        );
        return course ? course.name : 'Unknown Course';
    };

    // Get status badge style - UPDATED
    const getStatusBadge = (status) => {
        const normalizedStatus = status?.toLowerCase() || 'pending';
        
        const styles = {
            pending: { 
                backgroundColor: '#fff3cd', 
                color: '#856404', 
                border: '1px solid #ffeaa7',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            submitted: { 
                backgroundColor: '#e2e3e5', 
                color: '#383d41', 
                border: '1px solid #d6d8db',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            under_review: { 
                backgroundColor: '#cce7ff', 
                color: '#004085', 
                border: '1px solid #b3d7ff',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            admitted: { 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                border: '1px solid #c3e6cb',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            accepted: { 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                border: '1px solid #c3e6cb',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            rejected: { 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                border: '1px solid #f5c6cb',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            waitlisted: { 
                backgroundColor: '#e9ecef', 
                color: '#495057', 
                border: '1px solid #dee2e6',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        };
        return styles[normalizedStatus] || styles.pending;
    };

    // Get counts for statistics
    const getStatusCounts = () => {
        const counts = {
            all: allApplications.length,
            pending: allApplications.filter(app => 
                app.status === 'pending' || app.status === 'submitted'
            ).length,
            under_review: allApplications.filter(app => 
                app.status === 'under_review'
            ).length,
            admitted: allApplications.filter(app => 
                app.status === 'admitted' || app.status === 'accepted'
            ).length,
            rejected: allApplications.filter(app => 
                app.status === 'rejected'
            ).length,
            waitlisted: allApplications.filter(app => 
                app.status === 'waitlisted'
            ).length
        };
        return counts;
    };

    // Format date safely
    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        
        try {
            // Handle Firebase timestamp format
            if (dateValue.seconds) {
                return new Date(dateValue.seconds * 1000).toLocaleDateString();
            }
            // Handle ISO string or Date object
            const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
            return date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    // Format date with time
    const formatDateTime = (dateValue) => {
        if (!dateValue) return 'N/A';
        
        try {
            const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
            return date.toLocaleString();
        } catch (error) {
            return formatDate(dateValue);
        }
    };

    // Refresh applications data
    const handleRefresh = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = getAuthToken();
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:8081/api/applications', {
                headers: headers
            });
            
            if (response.ok) {
                const data = await response.json();
                const formattedApplications = data.map(app => ({
                    id: app.id,
                    _id: app.id,
                    studentName: app.name || app.studentName || 'Unknown Student',
                    studentEmail: app.email || app.studentEmail || '',
                    institution: app.institutionId,
                    institutionName: app.institution_name || app.institutionName || 'Unknown Institution',
                    faculty: app.facultyId,
                    courseId: app.courseId,
                    courseName: app.course_name || app.courseName || 'Unknown Course',
                    status: app.status?.toLowerCase() || 'pending',
                    appliedAt: app.appliedAt || app.createdAt || new Date(),
                    updatedAt: app.updatedAt || app.appliedAt || new Date(),
                    notes: app.notes || ''
                }));
                
                setAllApplications(formattedApplications);
                alert('✅ Applications data refreshed successfully!');
            } else {
                alert('❌ Failed to refresh applications data');
            }
        } catch (error) {
            console.error('Error refreshing applications:', error);
            alert('❌ Network error refreshing data');
        } finally {
            setLoading(false);
        }
    };

    const statusCounts = getStatusCounts();

    return (
        <div className="administration-content" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2>Student Applications</h2>
                    <p>View and manage all student course applications across institutions.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {error && (
                        <div style={{ 
                            backgroundColor: '#f8d7da', 
                            color: '#721c24', 
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Refreshing...' : '🔄 Refresh Data'}
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px', 
                marginBottom: '25px' 
            }}>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>{statusCounts.all}</h3>
                    <p style={{ margin: 0 }}>Total Applications</p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#ffc107', 
                    color: '#212529', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>{statusCounts.pending}</h3>
                    <p style={{ margin: 0 }}>Pending</p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#17a2b8', 
                    color: 'white', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>{statusCounts.under_review}</h3>
                    <p style={{ margin: 0 }}>Under Review</p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>{statusCounts.admitted}</h3>
                    <p style={{ margin: 0 }}>Admitted</p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>{statusCounts.rejected}</h3>
                    <p style={{ margin: 0 }}>Rejected</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr auto', 
                gap: '15px', 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Filter by Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value="all">All Statuses ({statusCounts.all})</option>
                        <option value="pending">Pending ({statusCounts.pending})</option>
                        <option value="submitted">Submitted ({allApplications.filter(app => app.status === 'submitted').length})</option>
                        <option value="under_review">Under Review ({statusCounts.under_review})</option>
                        <option value="admitted">Admitted ({statusCounts.admitted})</option>
                        <option value="accepted">Accepted ({allApplications.filter(app => app.status === 'accepted').length})</option>
                        <option value="rejected">Rejected ({statusCounts.rejected})</option>
                        <option value="waitlisted">Waitlisted ({statusCounts.waitlisted})</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Filter by Institution
                    </label>
                    <select
                        value={filterInstitution}
                        onChange={(e) => setFilterInstitution(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value="all">All Institutions</option>
                        {institutions.map(inst => (
                            <option key={inst.id || inst._id} value={inst.id || inst._id}>
                                {inst.name || 'Unknown Institution'}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
                    <button
                        onClick={() => {
                            setFilterStatus('all');
                            setFilterInstitution('all');
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>Loading applications...</div>
                </div>
            ) : filteredApplications.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#6c757d',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    {allApplications.length === 0 ? 'No applications found.' : 'No applications match your filters.'}
                    {error && <div style={{ marginTop: '10px', color: '#dc3545' }}>{error}</div>}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Institution</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Course</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Applied Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application, index) => {
                                const applicationId = application.id || application._id;
                                const isUpdating = updatingId === applicationId;
                                const currentStatus = application.status?.toLowerCase() || 'pending';
                                const cannotUpdate = ['admitted', 'accepted', 'rejected'].includes(currentStatus);
                                
                                return (
                                    <tr 
                                        key={applicationId}
                                        style={{ 
                                            backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                            borderBottom: '1px solid #dee2e6'
                                        }}
                                    >
                                        <td style={{ padding: '12px' }}>
                                            <div>
                                                <strong>{application.studentName}</strong>
                                                {application.studentEmail && (
                                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                                        {application.studentEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {application.institutionName || getInstitutionName(application.institution)}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {application.courseName || getCourseName(application.courseId)}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {formatDateTime(application.appliedAt)}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={getStatusBadge(currentStatus)}>
                                                {currentStatus ? currentStatus.toUpperCase() : 'PENDING'}
                                            </span>
                                            {application.notes && (
                                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                    {application.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {isUpdating ? (
                                                <div style={{ color: '#666', fontSize: '12px' }}>Updating...</div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    {/* Show Admit button for non-admitted/accepted */}
                                                    {!['admitted', 'accepted'].includes(currentStatus) && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(applicationId, 'admitted')}
                                                            disabled={isUpdating}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                opacity: isUpdating ? 0.6 : 1
                                                            }}
                                                            title="Admit Student"
                                                        >
                                                            Admit
                                                        </button>
                                                    )}
                                                    
                                                    {/* Show Reject button for non-rejected */}
                                                    {currentStatus !== 'rejected' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(applicationId, 'rejected')}
                                                            disabled={isUpdating}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                opacity: isUpdating ? 0.6 : 1
                                                            }}
                                                            title="Reject Application"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                    
                                                    {/* Show Under Review for non-reviewed statuses */}
                                                    {!['under_review', 'admitted', 'accepted', 'rejected', 'waitlisted'].includes(currentStatus) && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(applicationId, 'under_review')}
                                                            disabled={isUpdating}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#17a2b8',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                opacity: isUpdating ? 0.6 : 1
                                                            }}
                                                            title="Mark Under Review"
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                    
                                                    {/* Show Waitlist button */}
                                                    {currentStatus !== 'waitlisted' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(applicationId, 'waitlisted')}
                                                            disabled={isUpdating}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                opacity: isUpdating ? 0.6 : 1
                                                            }}
                                                            title="Move to Waitlist"
                                                        >
                                                            Waitlist
                                                        </button>
                                                    )}
                                                    
                                                    {/* Reset to Pending button for decided applications */}
                                                    {cannotUpdate && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(applicationId, 'pending')}
                                                            disabled={isUpdating}
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#ffc107',
                                                                color: '#212529',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                opacity: isUpdating ? 0.6 : 1
                                                            }}
                                                            title="Reset to Pending"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Legend */}
            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                <strong>Status Legend:</strong>
                <div style={{ display: 'flex', gap: '15px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={getStatusBadge('pending')}>PENDING</span>
                    <span style={getStatusBadge('submitted')}>SUBMITTED</span>
                    <span style={getStatusBadge('under_review')}>UNDER REVIEW</span>
                    <span style={getStatusBadge('admitted')}>ADMITTED</span>
                    <span style={getStatusBadge('accepted')}>ACCEPTED</span>
                    <span style={getStatusBadge('rejected')}>REJECTED</span>
                    <span style={getStatusBadge('waitlisted')}>WAITLISTED</span>
                </div>
                {error && (
                    <div style={{ marginTop: '10px', color: '#721c24' }}>
                        ⚠️ Note: {error} Changes will only be reflected locally.
                    </div>
                )}
            </div>

            {/* Debug Info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    border: '1px dashed #ccc',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    <strong>Debug Info:</strong>
                    <div>Total Applications: {allApplications.length}</div>
                    <div>Filtered: {filteredApplications.length}</div>
                    <div>Backend Status: {error ? '❌ Offline' : '✅ Online'}</div>
                    <div>Sample ID: {allApplications[0]?.id || 'N/A'}</div>
                </div>
            )}
        </div>
    );
};

export default StudentApplications;