import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLogin from './auth/StudentLogin';
import StudentRegister from './auth/StudentRegister';
import StudentDashboard from './dashboard/StudentDashboard';
import StudentProfile from './profile/StudentProfile';
import ApplicationHistory from './applications/ApplicationHistory';
import AdmissionsResults from './admissions/AdmissionsResults';
import ApplicationForm from './applications/ApplicationForm';
import TranscriptsPage from './transcripts/TranscriptsPage';

const Students = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const storedStudent = localStorage.getItem('student');
      const token = localStorage.getItem('token');
      
      if (storedStudent && token) {
        const studentData = JSON.parse(storedStudent);
        setStudent(studentData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (studentData, token) => {
    localStorage.setItem('student', JSON.stringify(studentData));
    localStorage.setItem('token', token);
    setStudent(studentData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('token');
    setStudent(null);
    setIsAuthenticated(false);
  };

  const updateStudent = (updatedStudentData) => {
    localStorage.setItem('student', JSON.stringify(updatedStudentData));
    setStudent(updatedStudentData);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="students-container">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" replace /> : 
            <StudentLogin onLogin={login} />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" replace /> : 
            <StudentRegister onLogin={login} />
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <StudentDashboard student={student} onLogout={logout} /> : 
            <Navigate to="/students/login" replace />
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? 
            <StudentProfile student={student} onUpdate={updateStudent} /> : 
            <Navigate to="/students/login" replace />
          } 
        />
        
        <Route 
          path="/applications" 
          element={
            isAuthenticated ? 
            <ApplicationHistory student={student} /> : 
            <Navigate to="/students/login" replace />
          } 
        />
        
        <Route 
          path="/apply" 
          element={
            isAuthenticated ? 
            <ApplicationForm student={student} /> : 
            <Navigate to="/students/login" replace />
          } 
        />
        
        <Route 
          path="/admissions" 
          element={
            isAuthenticated ? 
            <AdmissionsResults student={student} /> : 
            <Navigate to="/students/login" replace />
          } 
        />

        <Route 
          path="/transcripts" 
          element={
            isAuthenticated ? 
            <TranscriptsPage student={student} /> : 
            <Navigate to="/students/login" replace />
          } 
        />
        
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" replace /> : 
            <Navigate to="/students/login" replace />
          } 
        />
        
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" replace /> : 
            <Navigate to="/students/login" replace />
          } 
        />
      </Routes>
    </div>
  );
};

export default Students;