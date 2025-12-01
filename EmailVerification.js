import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');
    const userType = searchParams.get('type');

    if (!token || !userType) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/api/verify-email', {
        token,
        userType
      });

      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/company/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="verification-status verifying">
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="verification-status success">
            <div className="status-icon">✅</div>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
            <p>Redirecting to login page...</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="verification-status error">
            <div className="status-icon">❌</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button 
              onClick={() => navigate('/company/login')}
              className="btn-primary"
            >
              Go to Login
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        {getStatusContent()}
      </div>
    </div>
  );
};

export default EmailVerification;