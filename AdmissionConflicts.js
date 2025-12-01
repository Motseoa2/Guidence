import React, { useState, useEffect } from 'react';

const AdmissionConflicts = ({ admissionConflicts, applications, fetchDashboardData }) => {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [institutions, setInstitutions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedConflict, setSelectedConflict] = useState(null);
    const [resolutionLoading, setResolutionLoading] = useState(false);

    // Fetch data if not provided via props
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch conflicts if not provided
                if (!admissionConflicts) {
                    const conflictsResponse = await fetch('http://localhost:8081/api/admission-conflicts');
                    if (conflictsResponse.ok) {
                        const conflictsData = await conflictsResponse.json();
                        setConflicts(conflictsData);
                    }
                } else {
                    setConflicts(admissionConflicts);
                }

                // Fetch additional data
                const [instResponse, coursesResponse, studentsResponse] = await Promise.all([
                    fetch('http://localhost:8081/api/institutions'),
                    fetch('http://localhost:8081/api/courses'),
                    fetch('http://localhost:8081/api/students')
                ]);

                if (instResponse.ok) {
                    const instData = await instResponse.json();
                    setInstitutions(instData);
                }

                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    setCourses(coursesData);
                }

                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    setStudents(studentsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [admissionConflicts]);

    // Get student name by ID
    const getStudentName = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    };

    // Get institution name by ID
    const getInstitutionName = (institutionId) => {
        const institution = institutions.find(inst => inst.id === institutionId);
        return institution ? institution.name : 'Unknown Institution';
    };

    // Get course name by ID
    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown Course';
    };

    // Resolve conflict by selecting one institution
    const resolveConflict = async (studentId, selectedInstitutionId, selectedCourseId) => {
        if (!window.confirm(`Confirm admission for ${getStudentName(studentId)} at ${getInstitutionName(selectedInstitutionId)}? This will reject other admissions.`)) {
            return;
        }

        setResolutionLoading(true);
        try {
            const response = await fetch('http://localhost:8081/api/admission-conflicts/resolve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId,
                    selectedInstitutionId,
                    selectedCourseId,
                    rejectedInstitutionIds: conflicts
                        .find(c => c.studentId === studentId)
                        .admissions
                        .filter(adm => adm.institutionId !== selectedInstitutionId)
                        .map(adm => adm.institutionId)
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Admission conflict resolved successfully!');
                
                // Remove resolved conflict from list
                setConflicts(prev => prev.filter(c => c.studentId !== studentId));
                setSelectedConflict(null);

                // Refresh dashboard data
                if (fetchDashboardData) {
                    fetchDashboardData();
                }
            } else {
                throw new Error(result.error || 'Failed to resolve conflict');
            }
        } catch (error) {
            console.error('Error resolving conflict:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setResolutionLoading(false);
        }
    };

    // Auto-resolve conflict (select the first admission)
    const autoResolveConflict = async (studentId) => {
        const conflict = conflicts.find(c => c.studentId === studentId);
        if (!conflict || conflict.admissions.length === 0) return;

        const firstAdmission = conflict.admissions[0];
        await resolveConflict(studentId, firstAdmission.institutionId, firstAdmission.courseId);
    };

    // Get student email
    const getStudentEmail = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? student.email : 'N/A';
    };

    // Get student academic info
    const getStudentAcademicInfo = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? {
            credits: student.credits || 'N/A',
            passes: student.passes || 'N/A',
            gpa: student.gpa || 'N/A'
        } : { credits: 'N/A', passes: 'N/A', gpa: 'N/A' };
    };

    // Calculate priority score (for sorting)
    const calculatePriority = (conflict) => {
        const academicInfo = getStudentAcademicInfo(conflict.studentId);
        let score = 0;
        
        // Higher credits = higher priority
        if (academicInfo.credits !== 'N/A') score += parseInt(academicInfo.credits) || 0;
        
        // More passes = higher priority
        if (academicInfo.passes !== 'N/A') score += (parseInt(academicInfo.passes) || 0) * 10;
        
        // Higher GPA = higher priority
        if (academicInfo.gpa !== 'N/A') score += (parseFloat(academicInfo.gpa) || 0) * 100;
        
        return score;
    };

    // Sort conflicts by priority
    const sortedConflicts = [...conflicts].sort((a, b) => calculatePriority(b) - calculatePriority(a));

    return (
        <div className="administration-content" style={{ padding: '20px' }}>
            <h2>Admission Conflict Resolution</h2>
            <p>Resolve students with multiple admission offers across institutions.</p>

            {/* Statistics */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px', 
                marginBottom: '25px' 
            }}>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#ffc107', 
                    color: '#212529', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>{sortedConflicts.length}</h3>
                    <p style={{ margin: 0 }}>Pending Conflicts</p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#17a2b8', 
                    color: 'white', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>
                        {sortedConflicts.reduce((total, conflict) => total + conflict.admissions.length, 0)}
                    </h3>
                    <p style={{ margin: 0 }}>Total Offers</p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '2rem' }}>
                        {new Set(sortedConflicts.map(c => c.studentId)).size}
                    </h3>
                    <p style={{ margin: 0 }}>Unique Students</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>Loading admission conflicts...</div>
                </div>
            ) : sortedConflicts.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#28a745',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px dashed #28a745'
                }}>
                    <h3>✅ No Admission Conflicts</h3>
                    <p>All student admissions have been properly resolved.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {sortedConflicts.map((conflict, index) => (
                        <div 
                            key={conflict.studentId}
                            style={{ 
                                border: '2px solid #ffc107',
                                borderRadius: '8px',
                                padding: '20px',
                                backgroundColor: '#fffdf7',
                                position: 'relative'
                            }}
                        >
                            {/* Conflict Header */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '15px'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#856404' }}>
                                        🚨 {getStudentName(conflict.studentId)}
                                    </h3>
                                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                                        Email: {getStudentEmail(conflict.studentId)} | 
                                        Student ID: {conflict.studentId}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        backgroundColor: '#ffc107', 
                                        color: '#856404',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {conflict.admissions.length} ADMISSIONS
                                    </div>
                                    <button
                                        onClick={() => autoResolveConflict(conflict.studentId)}
                                        disabled={resolutionLoading}
                                        style={{
                                            marginTop: '8px',
                                            padding: '6px 12px',
                                            backgroundColor: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: resolutionLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Auto-Resolve
                                    </button>
                                </div>
                            </div>

                            {/* Student Academic Info */}
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '10px',
                                marginBottom: '15px',
                                padding: '10px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px'
                            }}>
                                <div>
                                    <strong>Credits:</strong> {getStudentAcademicInfo(conflict.studentId).credits}
                                </div>
                                <div>
                                    <strong>Passes:</strong> {getStudentAcademicInfo(conflict.studentId).passes}
                                </div>
                                <div>
                                    <strong>GPA:</strong> {getStudentAcademicInfo(conflict.studentId).gpa}
                                </div>
                                <div>
                                    <strong>Priority Score:</strong> {calculatePriority(conflict)}
                                </div>
                            </div>

                            {/* Admission Offers */}
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ marginBottom: '10px', color: '#495057' }}>
                                    Admission Offers ({conflict.admissions.length})
                                </h4>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {conflict.admissions.map((admission, admissionIndex) => (
                                        <div 
                                            key={admission.applicationId}
                                            style={{ 
                                                padding: '15px',
                                                border: selectedConflict?.admissionId === admission.applicationId 
                                                    ? '2px solid #007bff' 
                                                    : '1px solid #dee2e6',
                                                borderRadius: '4px',
                                                backgroundColor: selectedConflict?.admissionId === admission.applicationId 
                                                    ? '#e7f3ff' 
                                                    : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => setSelectedConflict({
                                                studentId: conflict.studentId,
                                                admissionId: admission.applicationId,
                                                institutionId: admission.institutionId,
                                                courseId: admission.courseId
                                            })}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>{getInstitutionName(admission.institutionId)}</strong>
                                                    <div style={{ color: '#666', fontSize: '14px' }}>
                                                        {getCourseName(admission.courseId)}
                                                    </div>
                                                    <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                                                        Application ID: {admission.applicationId}
                                                    </div>
                                                </div>
                                                {selectedConflict?.admissionId === admission.applicationId && (
                                                    <div style={{ 
                                                        color: '#28a745',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ✅ SELECTED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resolution Actions */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px',
                                paddingTop: '15px',
                                borderTop: '1px solid #dee2e6'
                            }}>
                                <button
                                    onClick={() => resolveConflict(
                                        conflict.studentId, 
                                        selectedConflict?.institutionId, 
                                        selectedConflict?.courseId
                                    )}
                                    disabled={!selectedConflict || resolutionLoading || selectedConflict.studentId !== conflict.studentId}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: !selectedConflict || resolutionLoading ? '#6c757d' : '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: !selectedConflict || resolutionLoading ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {resolutionLoading ? 'Resolving...' : 'Confirm Selection'}
                                </button>
                                
                                <button
                                    onClick={() => setSelectedConflict(null)}
                                    disabled={resolutionLoading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: resolutionLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Clear Selection
                                </button>
                            </div>

                            {!selectedConflict && (
                                <div style={{ 
                                    marginTop: '10px', 
                                    color: '#dc3545',
                                    fontSize: '14px'
                                }}>
                                    ⚠️ Please select one admission offer to resolve this conflict
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Help Text */}
            {sortedConflicts.length > 0 && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#e7f3ff', 
                    borderRadius: '4px',
                    border: '1px solid #b3d7ff'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#004085' }}>💡 Resolution Process</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#004085' }}>
                        <li>Select one admission offer for each student with multiple admissions</li>
                        <li>Click "Confirm Selection" to finalize the student's chosen institution</li>
                        <li>The system will automatically reject other offers and update waiting lists</li>
                        <li>Use "Auto-Resolve" to quickly accept the first offer (based on application date)</li>
                        <li>Conflicts are sorted by priority score (credits + passes + GPA)</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdmissionConflicts;