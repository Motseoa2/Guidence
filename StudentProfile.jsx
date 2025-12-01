import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../../firebase/config';
import { getAuth } from 'firebase/auth';

const StudentProfile = ({ student, onUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [academicProfile, setAcademicProfile] = useState({
    highSchool: '',
    completionYear: new Date().getFullYear(),
    subjects: {
      english: '',
      mathematics: '',
      science: '',
      biology: '',
      chemistry: '',
      physics: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const auth = getAuth();

  useEffect(() => {
    if (student) {
      loadAcademicProfile();
    }
  }, [student]);

  const loadAcademicProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'students', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().academicProfile) {
          setAcademicProfile(docSnap.data().academicProfile);
        }
      } catch (error) {
        console.error('Error loading academic profile:', error);
      }
    }
  };

  const handleAcademicChange = (field, value) => {
    setAcademicProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (subject, grade) => {
    setAcademicProfile(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subject]: grade
      }
    }));
  };

  const saveAcademicProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const docRef = doc(db, 'students', user.uid);
      await updateDoc(docRef, {
        academicProfile: academicProfile
      });

      // Update local storage and parent component
      const updatedStudent = { ...student, academicProfile };
      localStorage.setItem('student', JSON.stringify(updatedStudent));
      onUpdate(updatedStudent);

      setMessage('Academic profile saved successfully!');
    } catch (error) {
      console.error('Error saving academic profile:', error);
      setMessage('Error saving profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const hasCompleteAcademicProfile = () => {
    return academicProfile.highSchool && 
           academicProfile.subjects.english && 
           academicProfile.subjects.mathematics;
  };

  const styles = `
    .student-profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      overflow: hidden;
    }

    .student-profile-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: float 20s infinite linear;
      pointer-events: none;
    }

    @keyframes float {
      0% { transform: translate(0, 0) rotate(0deg); }
      100% { transform: translate(-50px, -50px) rotate(360deg); }
    }

    .header-section {
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
      z-index: 2;
    }

    .header-section h2 {
      font-size: 3.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 300;
      margin: 0;
    }

    .back-button {
      position: absolute;
      top: 2rem;
      left: 2rem;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      z-index: 3;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateX(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .back-button::before {
      content: '←';
      font-size: 1.2rem;
    }

    .profile-content {
      max-width: 1000px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    /* Tab Styles */
    .tab-navigation {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 50px;
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .tab-button {
      padding: 1rem 2rem;
      border: none;
      background: transparent;
      color: white;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .tab-button.active {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .tab-button:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
    }

    /* Card Styles */
    .profile-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 25px;
      padding: 3rem;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .profile-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .profile-card:hover {
      transform: translateY(-5px);
      box-shadow: 
        0 30px 60px rgba(0, 0, 0, 0.15),
        0 12px 24px rgba(0, 0, 0, 0.1);
    }

    .profile-card h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2rem;
      text-align: center;
      position: relative;
      display: inline-block;
      left: 50%;
      transform: translateX(-50%);
    }

    .profile-card h3::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 25%;
      width: 50%;
      height: 3px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 3px;
    }

    /* Personal Info Styles */
    .profile-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 15px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .detail-row::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .detail-row:hover {
      transform: translateX(10px);
      border-color: rgba(102, 126, 234, 0.3);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    }

    .detail-row:hover::before {
      opacity: 1;
    }

    .detail-row strong {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .detail-row strong::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .detail-row span {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1f2937;
      background: white;
      padding: 0.5rem 1.5rem;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 2px solid rgba(102, 126, 234, 0.1);
    }

    /* Academic Form Styles */
    .academic-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
    }

    .form-input, .form-select {
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .subjects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .subject-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .save-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }

    .save-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .save-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .message {
      padding: 1rem;
      border-radius: 10px;
      text-align: center;
      font-weight: 600;
      margin-top: 1rem;
    }

    .message.success {
      background: #d1fae5;
      color: #065f46;
      border: 2px solid #a7f3d0;
    }

    .message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 2px solid #fecaca;
    }

    .completion-status {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 1rem;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 2rem;
      border: 2px solid #f59e0b;
    }

    .completion-status.complete {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      border-color: #10b981;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .student-profile-container {
        padding: 1rem;
      }

      .header-section h2 {
        font-size: 2.5rem;
      }

      .subtitle {
        font-size: 1.1rem;
      }

      .back-button {
        top: 1rem;
        left: 1rem;
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
      }

      .profile-card {
        padding: 2rem;
        margin: 0 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .detail-row {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
        padding: 1.5rem;
      }

      .detail-row:hover {
        transform: translateY(-5px);
      }

      .detail-row strong::before {
        display: none;
      }

      .tab-navigation {
        flex-direction: column;
        gap: 0.5rem;
      }

      .tab-button {
        padding: 0.8rem 1rem;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="student-profile-container">
        <button 
          className="back-button"
          onClick={() => navigate('/students/dashboard')}
        >
          Back to Dashboard
        </button>

        <div className="header-section">
          <h2>Student Profile</h2>
          <p className="subtitle">Manage your personal and academic information</p>
        </div>
        
        <div className="profile-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button 
              className={`tab-button ${activeTab === 'academic' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic')}
            >
              Academic Profile
            </button>
          </div>

          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="profile-card">
              <h3>Personal Information</h3>
              {student ? (
                <div className="profile-details">
                  <div className="detail-row">
                    <strong>Name:</strong>
                    <span>{student.name || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Email:</strong>
                    <span>{student.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Student ID:</strong>
                    <span>{student.id || 'Not provided'}</span>
                  </div>
                </div>
              ) : (
                <p>No student information available.</p>
              )}
            </div>
          )}

          {/* Academic Profile Tab */}
          {activeTab === 'academic' && (
            <div className="profile-card">
              <h3>Academic Profile</h3>
              
              {/* Completion Status */}
              <div className={`completion-status ${hasCompleteAcademicProfile() ? 'complete' : ''}`}>
                {hasCompleteAcademicProfile() 
                  ? '🎉 Your academic profile is complete! You can now apply for courses.'
                  : '📝 Complete your academic profile to apply for courses.'}
              </div>

              {message && (
                <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="academic-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">High School Name *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={academicProfile.highSchool}
                      onChange={(e) => handleAcademicChange('highSchool', e.target.value)}
                      placeholder="Enter your high school name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Year of Completion *</label>
                    <input
                      className="form-input"
                      type="number"
                      value={academicProfile.completionYear}
                      onChange={(e) => handleAcademicChange('completionYear', e.target.value)}
                      min="1980"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">LGCSE Subject Grades *</label>
                  <div className="subjects-grid">
                    {Object.entries(academicProfile.subjects).map(([subject, grade]) => (
                      <div key={subject} className="subject-group">
                        <label className="form-label">
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </label>
                        <select
                          className="form-select"
                          value={grade}
                          onChange={(e) => handleSubjectChange(subject, e.target.value)}
                        >
                          <option value="">Select Grade</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="save-button"
                  onClick={saveAcademicProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Academic Profile'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentProfile;