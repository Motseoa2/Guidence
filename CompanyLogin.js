// auth/CompanyLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CompanyLogin.css';

const CompanyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/companylogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Store company authentication data properly
        localStorage.setItem('companyUser', JSON.stringify(data.user));
        localStorage.setItem('userRole', 'company');
        localStorage.setItem('companyId', data.user.id); // Store company ID separately
        localStorage.setItem('companyToken', Date.now()); // Simple token for demo
        
        console.log('Company login successful:', data.user);
        
        // ✅ Redirect to dashboard
        navigate('/company/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in
  React.useEffect(() => {
    const companyUser = localStorage.getItem('companyUser');
    if (companyUser) {
      navigate('/company/dashboard');
    }
  }, [navigate]);

  return (
    <div className="company-login-container">
      <div className="company-login-form">
        <h2>Company Login</h2>
        <p className="login-subtitle">Access your company dashboard</p>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Company Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="company@example.com"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>
        
        <div className="login-links">
          <p className="register-link">
            Don't have a company account? <Link to="/company/register">Register here</Link>
          </p>
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;