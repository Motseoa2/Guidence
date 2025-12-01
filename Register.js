import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'student' // Default user type
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setMessage('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Determine the correct registration endpoint based on user type
            let endpoint = '';
            switch (formData.userType) {
                case 'student':
                    endpoint = 'http://localhost:8081/api/studentregister';
                    break;
                case 'institute':
                    endpoint = 'http://localhost:8081/api/instituteregister';
                    break;
                case 'admin':
                    endpoint = 'http://localhost:8081/api/adminregister';
                    break;
                default:
                    endpoint = 'http://localhost:8081/api/studentregister';
            }

            const userData = {
                name: formData.username,
                email: formData.email,
                password: formData.password,
            };

            // Add location for institutes
            if (formData.userType === 'institute') {
                userData.location = 'Lesotho'; // Default or get from form
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Registration successful! Welcome ${formData.username}`);
                // Reset form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    userType: 'student'
                });
                
                // Optional: Redirect to login or dashboard
                setTimeout(() => {
                    // You can add redirect logic here
                    // window.location.href = '/login';
                }, 2000);
            } else {
                setMessage(data.error || `Registration failed. Please try again.`);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-wrapper">
                <h2>Create Account</h2>
                <p className="subtitle">Join our career guidance platform</p>

                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    {/* User Type Selection */}
                    <div className="form-group">
                        <label htmlFor="userType" className="form-label">
                            I am a:
                        </label>
                        <select
                            id="userType"
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="student">Student</option>
                            <option value="institute">Institute</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            {formData.userType === 'institute' ? 'Institute Name' : 'Full Name'} *
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder={formData.userType === 'institute' ? 'Enter institute name' : 'Enter your full name'}
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.username && <span className="error-text">{errors.username}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address *
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password *
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                        <small className="help-text">Must be at least 6 characters</small>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password *
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="login-redirect">
                        <p>Already have an account? <a href="/login">Sign in here</a></p>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .register-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }

                .register-form-wrapper {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 450px;
                }

                h2 {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 8px;
                    font-size: 1.8rem;
                }

                .subtitle {
                    text-align: center;
                    color: #6c757d;
                    margin-bottom: 30px;
                    font-size: 14px;
                }

                .message {
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-weight: 500;
                }

                .message.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .message.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                    font-size: 14px;
                }

                .form-select,
                input[type="text"],
                input[type="email"],
                input[type="password"] {
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .form-select:focus,
                input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }

                .form-select:disabled,
                input:disabled {
                    background-color: #f8f9fa;
                    cursor: not-allowed;
                }

                .error {
                    border-color: #dc3545 !important;
                }

                .error-text {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 5px;
                }

                .help-text {
                    color: #6c757d;
                    font-size: 12px;
                    margin-top: 5px;
                }

                .submit-btn {
                    padding: 12px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    margin-top: 10px;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #0056b3;
                }

                .submit-btn:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }

                .login-redirect {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .login-redirect p {
                    color: #6c757d;
                    font-size: 14px;
                }

                .login-redirect a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: 500;
                }

                .login-redirect a:hover {
                    text-decoration: underline;
                }

                /* Responsive Design */
                @media (max-width: 480px) {
                    .register-form-wrapper {
                        padding: 30px 20px;
                    }

                    h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;