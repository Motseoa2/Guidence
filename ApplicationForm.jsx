import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkEligibility, hasCompleteAcademicProfile } from '../utils/eligibilityCheck';
import './ApplicationForm.css';

const ApplicationForm = ({ student }) => {
  const [step, setStep] = useState(1);
  const [institutions, setInstitutions] = useState([]);
  const [availableFaculties, setAvailableFaculties] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    email: '',
    dob: '',
  });
  const [applicationStatus, setApplicationStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Document upload state
  const [qualificationDocs, setQualificationDocs] = useState({
    transcripts: null,
    certificates: null,
    idDocument: null
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const [igcseUploaded, setIgcseUploaded] = useState(false);

  // Eligibility state
  const [eligibility, setEligibility] = useState({
    isEligible: false,
    message: '',
    creditStatus: 'pending',
    requirements: []
  });
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [courseEligibility, setCourseEligibility] = useState({});

  // Loading states
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [institutionsError, setInstitutionsError] = useState('');
  const [facultiesError, setFacultiesError] = useState('');
  const [coursesError, setCoursesError] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Initialize student details
  useEffect(() => {
    if (student) {
      setStudentDetails(prev => ({
        ...prev,
        name: student.name || '',
        email: student.email || '',
        dob: student.dob || ''
      }));
    }
  }, [student]);

  // Check eligibility for ALL courses when they are loaded
  useEffect(() => {
    const checkAllCoursesEligibility = async () => {
      if (!student?.id || availableCourses.length === 0) return;
      
      console.log('🔄 Checking eligibility for all courses...');
      const eligibilityMap = {};
      
      for (const course of availableCourses) {
        try {
          const courseId = course.id || course._id;
          console.log(`🔍 Checking eligibility for: ${course.name}`);
          
          const eligibilityResult = await checkEligibility(student.id, courseId);
          eligibilityMap[courseId] = eligibilityResult;
          
          console.log(`📊 ${course.name}:`, {
            eligible: eligibilityResult.isEligible,
            credits: eligibilityResult.creditStatus,
            message: eligibilityResult.message
          });
        } catch (error) {
          console.error(`❌ Error checking eligibility for ${course.name}:`, error);
          eligibilityMap[course.id || course._id] = {
            isEligible: false,
            message: 'Error checking eligibility',
            creditStatus: 'insufficient',
            requirements: ['System error - please try again']
          };
        }
      }
      
      setCourseEligibility(eligibilityMap);
    };

    checkAllCoursesEligibility();
  }, [availableCourses, student]);

  // Check eligibility when specific course is selected
  const checkCourseEligibility = async (course) => {
    if (!student?.id || !course?.id) return;
    
    setCheckingEligibility(true);
    try {
      console.log('🔄 Checking eligibility for course:', course.name);
      const eligibilityResult = await checkEligibility(student.id, course.id || course._id);
      
      setEligibility(eligibilityResult);
      console.log('✅ Eligibility result:', eligibilityResult);
    } catch (error) {
      console.error('❌ Error checking eligibility:', error);
      setEligibility({
        isEligible: false,
        message: 'Error checking eligibility. Please try again.',
        creditStatus: 'insufficient',
        requirements: ['System error']
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  // File upload handler
  const handleFileUpload = (fileType, file) => {
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus(`❌ File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }

      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setUploadStatus(`❌ Invalid file type: ${file.name}. Please upload PDF, JPG, or PNG files.`);
        return;
      }

      const updatedDocs = {
        ...qualificationDocs,
        [fileType]: file
      };

      setQualificationDocs(updatedDocs);
      
      const displayName = fileType === 'transcripts' ? 'Academic Transcripts' : 
                         fileType === 'certificates' ? 'IGCSE Certificates' : 'ID Document';
      
      setUploadStatus(`✅ ${displayName} uploaded: ${file.name}`);
      
      // Set IGCSE uploaded flag if certificates are uploaded
      if (fileType === 'certificates') {
        setIgcseUploaded(true);
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const requestHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchInstitutions = async () => {
    setLoadingInstitutions(true);
    setInstitutionsError('');
    try {
      const response = await fetch('http://localhost:8081/api/institutions', {
        headers: requestHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load institutions`);
      }
      
      const data = await response.json();
      setInstitutions(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setInstitutionsError(error.message);
      setInstitutions([]);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const fetchFaculties = async (institutionId) => {
    setLoadingFaculties(true);
    setFacultiesError('');
    setAvailableFaculties([]);
    
    try {
      const response = await fetch(`http://localhost:8081/api/faculties/${institutionId}`, {
        headers: requestHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load faculties`);
      }
      
      const data = await response.json();
      setAvailableFaculties(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFacultiesError(error.message);
      setAvailableFaculties([]);
    } finally {
      setLoadingFaculties(false);
    }
  };

  const fetchCourses = async (facultyId) => {
    setLoadingCourses(true);
    setCoursesError('');
    setAvailableCourses([]);
    
    try {
      const response = await fetch(`http://localhost:8081/api/courses/${facultyId}`, {
        headers: requestHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load courses`);
      }
      
      const data = await response.json();
      setAvailableCourses(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCoursesError(error.message);
      setAvailableCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleInstitutionSelect = (institutionId) => {
    setSelectedInstitution(institutionId);
    setSelectedFaculty('');
    setSelectedCourse(null);
    setEligibility({ isEligible: false, message: '', creditStatus: 'pending', requirements: [] });
    fetchFaculties(institutionId);
    setStep(3);
  };

  const handleFacultySelect = (facultyId) => {
    setSelectedFaculty(facultyId);
    setSelectedCourse(null);
    setEligibility({ isEligible: false, message: '', creditStatus: 'pending', requirements: [] });
    fetchCourses(facultyId);
    setStep(4);
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    await checkCourseEligibility(course);
    setStep(5);
  };

  const validateForm = () => {
    const validationErrors = [];

    if (!studentDetails.name.trim()) validationErrors.push('Name is required.');
    if (!studentDetails.email.trim()) validationErrors.push('Email is required.');
    if (!studentDetails.dob) validationErrors.push('Date of Birth is required.');
    if (!selectedInstitution) validationErrors.push('Please select an institution.');
    if (!selectedFaculty) validationErrors.push('Please select a faculty.');
    if (!selectedCourse) validationErrors.push('Please select a course.');
    if (!qualificationDocs.certificates) validationErrors.push('IGCSE Certificates are required.');
    
    // ELIGIBILITY CHECK - Only block if not eligible
    if (!eligibility.isEligible) {
      validationErrors.push('You do not meet the eligibility requirements for this course.');
    }

    return validationErrors;
  };

  const onApply = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApplicationStatus('');
    setErrors([]);

    try {
      const applicationData = {
        name: studentDetails.name.trim(),
        email: studentDetails.email.trim(),
        dob: studentDetails.dob,
        institution: selectedInstitution,
        faculty: selectedFaculty,
        courses: [{
          courseId: selectedCourse.id || selectedCourse._id,
          credits: selectedCourse.minCredits || 0,
          courseName: selectedCourse.name
        }],
        studentId: student?.id || null,
        documents: {
          transcripts: qualificationDocs.transcripts?.name || 'Not uploaded',
          certificates: qualificationDocs.certificates?.name || 'Not uploaded',
          idDocument: qualificationDocs.idDocument?.name || 'Not uploaded'
        },
        eligibilityStatus: eligibility,
        applicationDate: new Date().toISOString(),
        status: 'submitted'
      };

      console.log('📤 Submitting application:', applicationData);

      const response = await fetch('http://localhost:8081/api/applications', {
        method: 'POST',
        headers: requestHeaders(),
        body: JSON.stringify(applicationData),
      });

      const responseText = await response.text();
      let responseBody;
      
      try {
        responseBody = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseBody = { message: responseText };
      }

      if (response.ok) {
        setApplicationStatus('🎉 Application submitted successfully! Redirecting to dashboard...');
        
        // Reset form and redirect
        setTimeout(() => {
          setStudentDetails({ name: '', email: '', dob: '' });
          setSelectedInstitution('');
          setSelectedFaculty('');
          setSelectedCourse(null);
          setAvailableFaculties([]);
          setAvailableCourses([]);
          setQualificationDocs({ transcripts: null, certificates: null, idDocument: null });
          setIgcseUploaded(false);
          setEligibility({ isEligible: false, message: '', creditStatus: 'pending', requirements: [] });
          
          // Navigate to dashboard where application will appear
          navigate('/students/dashboard');
        }, 2000);
      } else {
        const serverMessage = responseBody?.errors?.join?.(', ') 
          || responseBody?.message 
          || responseBody?.error 
          || 'Failed to submit application. Please try again.';
        setApplicationStatus(`Error: ${serverMessage}`);
      }
    } catch (error) {
      console.error('Error applying for courses:', error);
      setApplicationStatus('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedInstitutionName = () => {
    return institutions.find(inst => inst.id === selectedInstitution || inst._id === selectedInstitution)?.name || '';
  };

  const getSelectedFacultyName = () => {
    return availableFaculties.find(fac => fac.id === selectedFaculty || fac._id === selectedFaculty)?.name || '';
  };

  const proceedToInstitutions = () => {
    if (!igcseUploaded) {
      setUploadStatus('❌ Please upload your IGCSE Certificates before proceeding.');
      return;
    }
    
    fetchInstitutions();
    setStep(2);
  };

  const handleBackToDashboard = () => {
    navigate('/students/dashboard');
  };

  const isCourseEligible = (course) => {
    const courseId = course.id || course._id;
    return courseEligibility[courseId]?.isEligible || false;
  };

  return (
    <div className="application-form-container">
      <div className="apply-header">
        <button className="back-to-dashboard-btn" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h2>Student Course Application</h2>
        {student && <p className="welcome-message">Welcome, {student.name}!</p>}
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span>1</span>
          <p>Upload Documents</p>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span>2</span>
          <p>Select Institute</p>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span>3</span>
          <p>Select Faculty</p>
        </div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>
          <span>4</span>
          <p>Select Course</p>
        </div>
        <div className={`step ${step >= 5 ? 'active' : ''}`}>
          <span>5</span>
          <p>Review & Apply</p>
        </div>
      </div>

      {/* Step 1: Document Upload */}
      {step === 1 && (
        <div className="form-section">
          <h3>📄 Upload Your Qualifications</h3>
          <p className="selection-guide">
            <strong>IGCSE Certificates are required</strong> to apply for courses. 
            You must upload your IGCSE certificates before you can select institutions, faculties, or courses.
          </p>

          <div className="documents-grid">
            <div className="document-upload required">
              <label className="document-label">
                <div className="document-icon">🏆</div>
                <div className="document-info">
                  <strong>IGCSE Certificates *</strong>
                  <small>Upload your IGCSE/O-Level certificates (Required)</small>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('certificates', e.target.files[0])}
                  className="file-input"
                  required
                />
                <div className="upload-button">Choose File</div>
              </label>
              {qualificationDocs.certificates && (
                <div className="file-info success">
                  ✅ {qualificationDocs.certificates.name}
                </div>
              )}
              {!qualificationDocs.certificates && (
                <div className="file-info warning">
                  ⚠️ IGCSE Certificates are required to continue
                </div>
              )}
            </div>

            <div className="document-upload">
              <label className="document-label">
                <div className="document-icon">📊</div>
                <div className="document-info">
                  <strong>Academic Transcripts</strong>
                  <small>Upload your high school transcripts (Optional)</small>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('transcripts', e.target.files[0])}
                  className="file-input"
                />
                <div className="upload-button">Choose File</div>
              </label>
              {qualificationDocs.transcripts && (
                <div className="file-info">
                  ✅ {qualificationDocs.transcripts.name}
                </div>
              )}
            </div>

            <div className="document-upload">
              <label className="document-label">
                <div className="document-icon">🆔</div>
                <div className="document-info">
                  <strong>ID Document</strong>
                  <small>National ID/Passport (Optional)</small>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('idDocument', e.target.files[0])}
                  className="file-input"
                />
                <div className="upload-button">Choose File</div>
              </label>
              {qualificationDocs.idDocument && (
                <div className="file-info">
                  ✅ {qualificationDocs.idDocument.name}
                </div>
              )}
            </div>
          </div>

          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.includes('✅') ? 'success' : 'error'}`}>
              {uploadStatus}
            </div>
          )}

          <div className="step-actions">
            <button 
              className={`continue-btn ${!igcseUploaded ? 'disabled' : ''}`}
              onClick={proceedToInstitutions}
              disabled={!igcseUploaded}
            >
              {igcseUploaded ? 'Continue to Institute Selection →' : 'Upload IGCSE Certificates to Continue'}
            </button>
            
            {!igcseUploaded && (
              <div className="requirement-note">
                <p>🔒 <strong>Requirements to Continue:</strong></p>
                <ul>
                  <li>• Upload IGCSE Certificates</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Institute Selection */}
      {step === 2 && (
        <div className="form-section">
          <div className="back-navigation">
            <button onClick={() => setStep(1)}>← Back to Documents</button>
            <h3>🏛️ Select an Institution</h3>
          </div>

          {loadingInstitutions ? (
            <div className="loading-text">Loading institutions...</div>
          ) : institutionsError ? (
            <div className="error-box">
              <strong>Error loading institutions:</strong> {institutionsError}
              <button onClick={fetchInstitutions} className="retry-btn">Retry</button>
            </div>
          ) : institutions.length === 0 ? (
            <div className="no-data-message">
              <p>No institutions available at the moment.</p>
              <button onClick={fetchInstitutions} className="retry-btn">Try Again</button>
            </div>
          ) : (
            <div className="institutions-grid">
              {institutions.map((institution) => (
                <div 
                  key={institution.id || institution._id}
                  className="institution-card"
                  onClick={() => handleInstitutionSelect(institution.id || institution._id)}
                >
                  <h4>{institution.name}</h4>
                  {institution.code && <p className="institution-code">{institution.code}</p>}
                  {institution.contact_email && (
                    <p className="contact">📧 {institution.contact_email}</p>
                  )}
                  {institution.address && (
                    <p className="address">📍 {institution.address}</p>
                  )}
                  <div className="institution-features">
                    <span>📚 Multiple Faculties</span>
                    <span>🎓 Various Courses</span>
                  </div>
                  <button className="select-btn">Select →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Faculty Selection */}
      {step === 3 && (
        <div className="form-section">
          <div className="back-navigation">
            <button onClick={() => setStep(2)}>← Back to Institutions</button>
            <h3>Select a Faculty at {getSelectedInstitutionName()}</h3>
          </div>

          {loadingFaculties ? (
            <div className="loading-text">Loading faculties...</div>
          ) : facultiesError ? (
            <div className="error-box">
              <strong>Error loading faculties:</strong> {facultiesError}
            </div>
          ) : availableFaculties.length === 0 ? (
            <div className="no-data-message">
              <p>No faculties available for this institution.</p>
            </div>
          ) : (
            <div className="faculties-grid">
              {availableFaculties.map((faculty) => (
                <div 
                  key={faculty.id || faculty._id}
                  className="faculty-card"
                  onClick={() => handleFacultySelect(faculty.id || faculty._id)}
                >
                  <h4>{faculty.name}</h4>
                  {faculty.dean_name && (
                    <p className="dean">Dean: {faculty.dean_name}</p>
                  )}
                  {faculty.description && (
                    <p className="description">{faculty.description}</p>
                  )}
                  <div className="faculty-features">
                    <span>📖 Multiple Programs</span>
                    <span>👥 Expert Faculty</span>
                  </div>
                  <button className="select-btn">View Courses →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Course Selection */}
      {step === 4 && (
        <div className="form-section">
          <div className="back-navigation">
            <button onClick={() => setStep(3)}>← Back to Faculties</button>
            <h3>Available Courses in {getSelectedFacultyName()}</h3>
          </div>

          {/* Eligibility Status Summary */}
          {Object.keys(courseEligibility).length > 0 && (
            <div className="eligibility-summary">
              <h4>🎯 Eligibility Overview</h4>
              <p>
                <strong>Courses are automatically checked against your academic profile and credits.</strong>
                <br />
                <span className="warning-text">You can only select and apply for courses where you meet all requirements.</span>
              </p>
            </div>
          )}

          {loadingCourses ? (
            <div className="loading-text">Loading courses...</div>
          ) : coursesError ? (
            <div className="error-box">
              <strong>Error loading courses:</strong> {coursesError}
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="no-data-message">
              <p>No courses available for this faculty.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {availableCourses.map((course) => {
                const courseId = course.id || course._id;
                const isEligible = isCourseEligible(course);
                const eligibilityInfo = courseEligibility[courseId];
                const isSelected = selectedCourse && (selectedCourse.id === course.id || selectedCourse._id === course._id);
                
                return (
                  <div 
                    key={courseId}
                    className={`course-card ${isSelected ? 'selected' : ''} ${!isEligible ? 'ineligible blocked' : ''}`}
                    onClick={() => isEligible && handleCourseSelect(course)}
                  >
                    <div className="course-header">
                      <h4>{course.name}</h4>
                      <span className="course-code">{course.code || 'N/A'}</span>
                    </div>
                    
                    <p className="course-description">
                      {course.description || 'Comprehensive program offering quality education and career opportunities.'}
                    </p>
                    
                    <div className="course-details">
                      <span>📚 {course.minCredits || '34'} Credits Required</span>
                      <span>⏱️ {course.duration || '36'} Months</span>
                      {course.fee_amount ? (
                        <span>💰 ${course.fee_amount}</span>
                      ) : (
                        <span>💰 Contact for fees</span>
                      )}
                    </div>

                    {/* Eligibility Status */}
                    <div className={`eligibility-badge ${isEligible ? 'eligible' : 'ineligible blocked'}`}>
                      {isEligible ? '✅ Eligible - Can Apply' : '🚫 Not Eligible - Cannot Apply'}
                    </div>

                    {/* Show specific requirements */}
                    {!isEligible && eligibilityInfo?.requirements && (
                      <div className="eligibility-reason">
                        <strong>Missing Requirements:</strong>
                        <ul>
                          {eligibilityInfo.requirements.map((req, index) => (
                            <li key={index}>❌ {req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="course-actions">
                      <button 
                        className={`select-btn ${isSelected ? 'selected' : ''} ${!isEligible ? 'disabled blocked' : ''}`}
                        disabled={!isEligible}
                      >
                        {isSelected ? '✓ Selected' : 
                         !isEligible ? '🚫 Not Eligible' : 'Select Course'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Review & Application */}
      {step === 5 && (
        <div className="form-section">
          <div className="back-navigation">
            <button onClick={() => setStep(4)}>← Back to Courses</button>
            <h3>Review Your Application</h3>
          </div>

          <div className="application-review">
            <h4>Application Summary</h4>
            
            {/* Eligibility Status */}
            <div className="eligibility-review">
              <h5>Eligibility Status</h5>
              {checkingEligibility ? (
                <div className="loading-text">Final eligibility check...</div>
              ) : (
                <div className={`eligibility-result ${eligibility.isEligible ? 'eligible' : 'ineligible blocked'}`}>
                  <div className="eligibility-header">
                    <span className="eligibility-icon">
                      {eligibility.isEligible ? '✅' : '🚫'}
                    </span>
                    <strong>
                      {eligibility.isEligible ? 'ELIGIBLE - You Can Apply' : 'NOT ELIGIBLE - Application Blocked'}
                    </strong>
                  </div>
                  <p className="eligibility-message">{eligibility.message}</p>
                  
                  {!eligibility.isEligible && eligibility.requirements.length > 0 && (
                    <div className="eligibility-blocked">
                      <strong>❌ Missing Requirements:</strong>
                      <ul>
                        {eligibility.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                      <p className="blocked-warning">
                        You cannot apply for this course until you meet all requirements.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Status Check */}
            <div className="document-status-check">
              <h5>Document Requirements</h5>
              <div className="requirement-list">
                <div className={`requirement-item ${qualificationDocs.certificates ? 'met' : 'missing'}`}>
                  {qualificationDocs.certificates ? '✅' : '❌'} IGCSE Certificates
                  {!qualificationDocs.certificates && (
                    <span className="requirement-warning"> - Required</span>
                  )}
                </div>
                <div className="requirement-item info">
                  ℹ️ Academic Transcripts - Optional
                </div>
                <div className="requirement-item info">
                  ℹ️ ID Document - Optional
                </div>
              </div>
            </div>

            <div className="review-details">
              <h5>Selected Program</h5>
              <p><strong>Course:</strong> {selectedCourse?.name}</p>
              <p><strong>Institution:</strong> {getSelectedInstitutionName()}</p>
              <p><strong>Faculty:</strong> {getSelectedFacultyName()}</p>
            </div>

            <div className="personal-info">
              <h5>Personal Information</h5>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={studentDetails.name}
                    onChange={handleInputChange}
                    required
                    disabled={!!student}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={studentDetails.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!student}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={studentDetails.dob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* APPLICATION BUTTON */}
            <button
              className={`apply-button ${eligibility.isEligible ? 'primary success' : 'disabled blocked'}`}
              onClick={onApply}
              disabled={loading || !eligibility.isEligible || !qualificationDocs.certificates}
            >
              {loading ? 'Submitting Application...' : 
               !eligibility.isEligible ? '🚫 NOT ELIGIBLE - Cannot Apply' : 
               !qualificationDocs.certificates ? '📄 IGCSE Certificates Required' : 
               '✅ Submit Application'}
            </button>

            {eligibility.isEligible && qualificationDocs.certificates && (
              <div className="success-message">
                ✅ <strong>You are eligible!</strong> Your application will be processed after submission.
              </div>
            )}

            {!eligibility.isEligible && !checkingEligibility && (
              <div className="error-message blocked">
                🚫 <strong>APPLICATION BLOCKED:</strong> You do not meet the eligibility requirements for this course. 
                Please select a different course or complete the missing requirements.
              </div>
            )}
          </div>
        </div>
      )}

      {applicationStatus && (
        <div className={`status-message ${applicationStatus.includes('successfully') ? 'success' : 'error'}`}>
          {applicationStatus}
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-list">
          <h4>Please fix the following errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;