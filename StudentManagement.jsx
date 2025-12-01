import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLogin from './auth/StudentLogin';
import StudentRegister from './auth/StudentRegister';
import StudentDashboard from './dashboard/StudentDashboard';
import StudentProfile from './profile/StudentProfile';
import ApplicationHistory from './applications/ApplicationHistory';
import AdmissionsResults from './admissions/AdmissionsResults';
import ApplicationForm from './applications/ApplicationForm';

const Students = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if student is authenticated on component mount
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
        
        // Optional: Verify token with backend
        verifyToken(studentData.id, token);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (studentId, token) => {
    try {
      // You can add token verification with your backend here
      // For now, we'll trust the localStorage
      console.log('Token verification would happen here');
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
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

  // Update student data (e.g., after profile update)
  const updateStudent = (updatedStudentData) => {
    localStorage.setItem('student', JSON.stringify(updatedStudentData));
    setStudent(updatedStudentData);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="students-container">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" /> : 
            <StudentLogin onLogin={login} />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" /> : 
            <StudentRegister onLogin={login} />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <StudentDashboard student={student} onLogout={logout} /> : 
            <Navigate to="/students/login" />
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? 
            <StudentProfile student={student} onUpdate={updateStudent} /> : 
            <Navigate to="/students/login" />
          } 
        />
        
        <Route 
          path="/applications" 
          element={
            isAuthenticated ? 
            <ApplicationHistory student={student} /> : 
            <Navigate to="/students/login" />
          } 
        />
        
        <Route 
          path="/apply" 
          element={
            isAuthenticated ? 
            <ApplicationForm student={student} /> : 
            <Navigate to="/students/login" />
          } 
        />
        
        <Route 
          path="/admissions" 
          element={
            isAuthenticated ? 
            <AdmissionsResults student={student} /> : 
            <Navigate to="/students/login" />
          } 
        />
        
        {/* Default route */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" /> : 
            <Navigate to="/students/login" />
          } 
        />
        
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/students/dashboard" /> : 
            <Navigate to="/students/login" />
          } 
        />
      </Routes>
    </div>
  );
};

export default Students;