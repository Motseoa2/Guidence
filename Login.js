// auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'student'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let endpoint = '';
            switch (formData.userType) {
                case 'student':
                    endpoint = 'http://localhost:8081/api/studentlogin';
                    break;
                case 'institute':
                    endpoint = 'http://localhost:8081/api/institutelogin';
                    break;
                case 'admin':
                    endpoint = 'http://localhost:8081/api/adminlogin';
                    break;
                case 'company':
                    endpoint = 'http://localhost:8081/api/companylogin';
                    break;
                default:
                    endpoint = 'http://localhost:8081/api/studentlogin';
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                const userKey = `${formData.userType}User`;
                localStorage.setItem(userKey, JSON.stringify(data.user));
                localStorage.setItem('userRole', formData.userType);
                localStorage.setItem('userId', data.user.id);

                switch (formData.userType) {
                    case 'student':
                        navigate('/student/dashboard');
                        break;
                    case 'institute':
                        navigate('/institute/dashboard');
                        break;
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'company':
                        navigate('/company/dashboard');
                        break;
                    default:
                        navigate('/dashboard');
                }
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Inline Styles
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        formWrapper: {
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '400px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        title: {
            color: '#333',
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: '600'
        },
        subtitle: {
            color: '#666',
            margin: '0',
            fontSize: '14px'
        },
        errorMessage: {
            background: '#fee',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column'
        },
        label: {
            marginBottom: '8px',
            color: '#333',
            fontWeight: '500',
            fontSize: '14px'
        },
        input: {
            padding: '12px 16px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box'
        },
        inputFocus: {
            borderColor: '#667eea',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
        },
        select: {
            padding: '12px 16px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            background: 'white'
        },
        loginBtn: {
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        loginBtnHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
        },
        loginBtnDisabled: {
            opacity: '0.6',
            cursor: 'not-allowed'
        },
        spinner: {
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        footer: {
            marginTop: '25px',
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #e9ecef'
        },
        footerText: {
            margin: '10px 0',
            color: '#666',
            fontSize: '14px'
        },
        link: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '500'
        },
        linkHover: {
            textDecoration: 'underline'
        }
    };

    const [hoverStates, setHoverStates] = useState({
        loginBtn: false,
        registerLink: false,
        forgotLink: false
    });

    const handleHover = (element, isHovered) => {
        setHoverStates(prev => ({ ...prev, [element]: isHovered }));
    };

    const handleInputFocus = (e) => {
        e.target.style.borderColor = styles.inputFocus.borderColor;
        e.target.style.boxShadow = styles.inputFocus.boxShadow;
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = styles.input.border;
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={styles.container}>
            <div style={styles.formWrapper}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Welcome Back</h2>
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label htmlFor="userType" style={styles.label}>I am a:</label>
                        <select
                            id="userType"
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            style={styles.select}
                            disabled={loading}
                        >
                            <option value="student">Student</option>
                            <option value="institute">Institute</option>
                            <option value="company">Company</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={styles.input}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={styles.input}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            ...styles.loginBtn,
                            ...(hoverStates.loginBtn && !loading ? styles.loginBtnHover : {}),
                            ...(loading ? styles.loginBtnDisabled : {})
                        }}
                        onMouseEnter={() => handleHover('loginBtn', true)}
                        onMouseLeave={() => handleHover('loginBtn', false)}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            style={{
                                ...styles.link,
                                ...(hoverStates.registerLink ? styles.linkHover : {})
                            }}
                            onMouseEnter={() => handleHover('registerLink', true)}
                            onMouseLeave={() => handleHover('registerLink', false)}
                        >
                            Create account
                        </Link>
                    </p>
                    <p style={styles.footerText}>
                        <Link 
                            to="/forgot-password" 
                            style={{
                                ...styles.link,
                                ...(hoverStates.forgotLink ? styles.linkHover : {})
                            }}
                            onMouseEnter={() => handleHover('forgotLink', true)}
                            onMouseLeave={() => handleHover('forgotLink', false)}
                        >
                            Forgot your password?
                        </Link>
                    </p>
                </div>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @media (max-width: 480px) {
                    .login-form-wrapper {
                        padding: 30px 20px;
                        margin: 10px;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default Login;