import React, { useState, useEffect } from 'react';

const AddCourse = ({ institutions }) => {
    const [institution, setInstitution] = useState('');
    const [faculty, setFaculty] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [minCredits, setMinCredits] = useState('');
    const [availableFaculties, setAvailableFaculties] = useState([]);
    const [courses, setCourses] = useState([]);
    const [allFaculties, setAllFaculties] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFaculties = async (institutionId) => {
        try {
            const response = await fetch(`http://localhost:8081/api/faculties`);
            if (!response.ok) {
                throw new Error('Failed to fetch faculties');
            }
            const data = await response.json();
            // Filter faculties by institution
            const filteredFaculties = data.filter(f => f.institutionId === institutionId);
            setAvailableFaculties(filteredFaculties);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            alert('Error fetching faculties');
        }
    };

    const fetchAllFaculties = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/faculties');
            if (!response.ok) {
                throw new Error('Failed to fetch faculties');
            }
            const data = await response.json();
            setAllFaculties(data);
        } catch (error) {
            console.error('Error fetching all faculties:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/courses');
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            alert('Error fetching courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!institution || !faculty || !courseName || !courseCode || !minCredits) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    facultyId: faculty,
                    name: courseName, // Changed from courseName to name for consistency
                    code: courseCode, // Changed from courseCode to code for consistency
                    minCredits: parseInt(minCredits),
                    institutionId: institution
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Course added successfully");
                resetFields();
                fetchCourses(); // Refresh the course list
            } else {
                alert(result.error || 'Failed to add course');
            }
        } catch (error) {
            console.error('Error adding course:', error);
            alert('Failed to add course - check console for details');
        } finally {
            setLoading(false);
        }
    };

    const resetFields = () => {
        setInstitution('');
        setFaculty('');
        setCourseName('');
        setCourseCode('');
        setMinCredits('');
        setAvailableFaculties([]);
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
                alert('Course deleted successfully.');
                fetchCourses(); // Refresh the course list
            } else {
                const result = await response.json();
                alert(result.error || 'Failed to delete course.');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course.');
        }
    };

    useEffect(() => {
        if (institution) {
            fetchFaculties(institution);
        } else {
            setAvailableFaculties([]);
            setFaculty('');
        }
    }, [institution]);

    useEffect(() => {
        fetchCourses();
        fetchAllFaculties();
    }, []);

    // Helper function to find institution and faculty names
    const getInstitutionAndFacultyNames = (course) => {
        const institutionObj = institutions.find(inst => inst.id === course.institutionId);
        const facultyObj = allFaculties.find(f => f.id === course.facultyId);
        
        return {
            institutionName: institutionObj?.name || 'N/A',
            facultyName: facultyObj?.name || 'N/A'
        };
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Add Course</h2>
            <form onSubmit={handleAddCourse} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Institution: </label>
                    <select 
                        value={institution} 
                        onChange={(e) => setInstitution(e.target.value)} 
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">Select Institution</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>
                                {inst.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Faculty: </label>
                    <select 
                        value={faculty} 
                        onChange={(e) => setFaculty(e.target.value)} 
                        required 
                        disabled={!institution}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: !institution ? '#f5f5f5' : 'white' }}
                    >
                        <option value="">Select Faculty</option>
                        {availableFaculties.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Course Name: </label>
                    <input
                        type="text"
                        placeholder="Course Name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Course Code: </label>
                    <input
                        type="text"
                        placeholder="Course Code"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Minimum Credits: </label>
                    <input
                        type="number"
                        placeholder="Minimum Credits"
                        value={minCredits}
                        onChange={(e) => setMinCredits(e.target.value)}
                        required
                        min="1"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: loading ? '#6c757d' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Adding Course...' : 'Add Course'}
                </button>
            </form>

            <h3>Course List</h3>
            {loading ? (
                <div>Loading courses...</div>
            ) : (
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Institution</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Faculty</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Course Name</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Course Code</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Minimum Credits</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length > 0 ? (
                            courses.map(course => {
                                const { institutionName, facultyName } = getInstitutionAndFacultyNames(course);
                                
                                return (
                                    <tr key={course.id}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{institutionName}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{facultyName}</td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {course.name || course.courseName || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {course.code || course.courseCode || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {course.minCredits || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <button 
                                                onClick={() => handleDeleteCourse(course.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    No courses available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AddCourse;