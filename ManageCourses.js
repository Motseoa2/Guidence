import React, { useState, useEffect } from 'react';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterInstitution, setFilterInstitution] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('');
    const [institutions, setInstitutions] = useState([]);
    const [faculties, setFaculties] = useState([]);

    // Fetch all courses
    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            alert('Failed to load courses');
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

    // Fetch all faculties
    const fetchFaculties = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/faculties');
            const data = await response.json();
            setFaculties(data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    // Delete course
    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Course deleted successfully.');
                fetchCourses();
            } else {
                alert('Failed to delete course.');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        }
    };

    // Filter courses based on selected institution and faculty
    const filteredCourses = courses.filter(course => {
        const matchesInstitution = !filterInstitution || course.institutionId === filterInstitution;
        const matchesFaculty = !filterFaculty || course.facultyId === filterFaculty;
        return matchesInstitution && matchesFaculty;
    });

    // Get filtered faculties based on selected institution
    const getFilteredFaculties = () => {
        if (!filterInstitution) return faculties;
        return faculties.filter(faculty => faculty.institutionId === filterInstitution);
    };

    // Load data on component mount
    useEffect(() => {
        fetchCourses();
        fetchInstitutions();
        fetchFaculties();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2>Manage Courses</h2>
            
            {/* Filters */}
            <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <h4 style={{ marginBottom: '15px' }}>Filter Courses</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Filter by Institution
                        </label>
                        <select 
                            value={filterInstitution} 
                            onChange={(e) => {
                                setFilterInstitution(e.target.value);
                                setFilterFaculty(''); // Reset faculty filter when institution changes
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">All Institutions</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Filter by Faculty
                        </label>
                        <select 
                            value={filterFaculty} 
                            onChange={(e) => setFilterFaculty(e.target.value)}
                            disabled={!filterInstitution}
                            style={{ 
                                width: '100%', 
                                padding: '8px', 
                                borderRadius: '4px', 
                                border: '1px solid #ccc',
                                backgroundColor: !filterInstitution ? '#f5f5f5' : 'white'
                            }}
                        >
                            <option value="">All Faculties</option>
                            {getFilteredFaculties().map(faculty => (
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name}
                                </option>
                            ))}
                        </select>
                        {!filterInstitution && (
                            <small style={{ color: '#666' }}>Select an institution to filter by faculty</small>
                        )}
                    </div>
                </div>
            </div>

            {/* Course List */}
            {filteredCourses.length > 0 ? (
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
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Faculty</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Course Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Course Code</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Min Credits</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {course.institution_name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {course.faculty_name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                        {course.name}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {course.code}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {course.minCredits}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {course.description || 'No description'}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        <button 
                                            onClick={() => handleDeleteCourse(course.id)}
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
                    <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No Courses Found</h3>
                    <p style={{ color: '#6c757d' }}>
                        {filterInstitution || filterFaculty 
                            ? 'No courses match your current filters. Try adjusting your filters.' 
                            : 'No courses have been created yet. Add your first course using the "Add Course" section.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;