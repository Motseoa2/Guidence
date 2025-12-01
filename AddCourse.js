import React, { useState, useEffect } from 'react';

const AddCourse = () => {
    const [currentInstitute, setCurrentInstitute] = useState(null);
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [minCredits, setMinCredits] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Get current institute and load data
    useEffect(() => {
        const instituteUser = JSON.parse(localStorage.getItem('instituteUser'));
        if (instituteUser) {
            setCurrentInstitute(instituteUser);
            fetchFaculties(instituteUser.id);
            fetchCourses(instituteUser.id);
        }
    }, []);

    // Fetch faculties for current institute
    const fetchFaculties = async (instituteId) => {
        try {
            const response = await fetch('http://localhost:8081/api/faculties');
            if (!response.ok) throw new Error('Failed to fetch faculties');
            const data = await response.json();
            
            // Filter faculties for current institute only
            const instituteFaculties = data.filter(faculty => faculty.institutionId === instituteId);
            setFaculties(instituteFaculties);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            setMessage('Failed to load faculties');
        }
    };

    // Fetch courses for current institute
    const fetchCourses = async (instituteId) => {
        try {
            const response = await fetch('http://localhost:8081/api/courses');
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();
            
            // Filter courses for current institute and enrich with faculty names
            const instituteCourses = data.filter(course => course.institutionId === instituteId);
            
            // Enrich with faculty names
            const enrichedCourses = await Promise.all(
                instituteCourses.map(async (course) => {
                    try {
                        const facultyResponse = await fetch(`http://localhost:8081/api/faculties/${course.facultyId}`);
                        if (facultyResponse.ok) {
                            const faculty = await facultyResponse.json();
                            return {
                                ...course,
                                faculty_name: faculty.name
                            };
                        }
                        return course;
                    } catch (error) {
                        return course;
                    }
                })
            );
            
            setCourses(enrichedCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        
        if (!currentInstitute) {
            setMessage('Error: No institute found. Please log in again.');
            return;
        }

        if (!selectedFaculty || !courseName || !courseCode || !minCredits) {
            setMessage("Please fill all required fields");
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Create the course data object with ALL required fields
            const courseData = {
                facultyId: selectedFaculty,
                name: courseName, // This is the field that was missing
                code: courseCode,
                minCredits: parseInt(minCredits),
                description: courseDescription || '', // Ensure description is never undefined
                institutionId: currentInstitute.id
            };

            console.log('Sending course data:', courseData); // Debug log

            const response = await fetch('http://localhost:8081/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData),
            });

            const data = await response.json();
            console.log('Response from server:', data); // Debug log

            if (response.ok) {
                setMessage("✅ Course added successfully!");
                resetFields();
                fetchCourses(currentInstitute.id);
            } else {
                setMessage(`❌ Failed to add course: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding course:', error);
            setMessage('❌ Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetFields = () => {
        setSelectedFaculty('');
        setCourseName('');
        setCourseCode('');
        setMinCredits('');
        setCourseDescription('');
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessage('✅ Course deleted successfully.');
                fetchCourses(currentInstitute.id);
            } else {
                setMessage('❌ Failed to delete course.');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            setMessage('❌ Failed to delete course');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Add New Course</h2>
            
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

            {/* Add Course Form */}
            <form onSubmit={handleAddCourse} style={{ 
                marginBottom: '30px', 
                padding: '20px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    {/* Faculty Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Faculty *
                        </label>
                        <select 
                            value={selectedFaculty} 
                            onChange={(e) => setSelectedFaculty(e.target.value)} 
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Select Faculty</option>
                            {faculties.map(faculty => (
                                <option key={faculty.id} value={faculty.id}>
                                    {faculty.name}
                                </option>
                            ))}
                        </select>
                        {faculties.length === 0 && (
                            <small style={{ color: '#dc3545' }}>
                                No faculties available. Please add faculties first.
                            </small>
                        )}
                    </div>

                    {/* Course Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Course Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Bachelor of Computer Science"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    {/* Course Code */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Course Code *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., BCS101"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {/* Minimum Credits */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Minimum Credits *
                        </label>
                        <input
                            type="number"
                            placeholder="e.g., 120"
                            value={minCredits}
                            onChange={(e) => setMinCredits(e.target.value)}
                            required
                            min="1"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {/* Course Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Description
                        </label>
                        <input
                            type="text"
                            placeholder="Course description"
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || faculties.length === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: (loading || faculties.length === 0) ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (loading || faculties.length === 0) ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Adding Course...' : 'Add Course'}
                </button>

                {faculties.length === 0 && (
                    <div style={{ marginTop: '10px', color: '#dc3545' }}>
                        <strong>Note:</strong> You need to add faculties first before you can add courses.
                    </div>
                )}
            </form>

            {/* Course List */}
            <h3>Your Courses ({courses.length})</h3>
            {courses.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Faculty</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Course Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Course Code</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Credits</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id} style={{ borderBottom: '1px solid #dee2e6' }}>
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
                                                padding: '6px 12px',
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
                    <h4 style={{ color: '#6c757d' }}>No Courses Yet</h4>
                    <p style={{ color: '#6c757d' }}>
                        {faculties.length === 0 
                            ? 'Add faculties first, then come back to add courses.' 
                            : 'Add your first course using the form above.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AddCourse;