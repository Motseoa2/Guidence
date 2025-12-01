import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [stats, setStats] = useState([
    { number: 0, label: 'Students Helped', target: 1250 },
    { number: 0, label: 'Partner Institutions', target: 45 },
    { number: 0, label: 'Job Opportunities', target: 320 },
    { number: 0, label: 'Success Stories', target: 89 }
  ]);

  const [hoveredButton, setHoveredButton] = useState(null);
  const [showPortal, setShowPortal] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [securityChallenge, setSecurityChallenge] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showSecurity, setShowSecurity] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState('');

  const teamMembers = [
    {
      name: 'Motseoa Lephakha',
      role: 'Full Stack Developer',
      description: 'Specialized in backend development and system architecture. Passionate about creating scalable solutions.',
      skills: ['Node.js', 'React', 'Database Design']
    },
    {
      name: 'Paballo Pule',
      role: 'Frontend Developer',
      description: 'Focuses on user experience and interface design. Creates intuitive and responsive web applications.',
      skills: ['React', 'CSS', 'UI/UX Design']
    },
    {
      name: 'Relebohile Lebitsa',
      role: 'Project Manager & Developer',
      description: 'Oversees project coordination and contributes to both frontend and backend development.',
      skills: ['Project Management', 'JavaScript', 'API Integration']
    }
  ];

  // Security challenges
  const securityChallenges = [
    { question: "What is 3 + 4?", answer: "7" },
    { question: "What is 5 + 2?", answer: "7" },
    { question: "What is 6 + 3?", answer: "9" },
    { question: "What is 8 - 2?", answer: "6" },
    { question: "What is 4 × 2?", answer: "8" }
  ];

  // Add keyframes for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.7; }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Animate numbers
  useEffect(() => {
    const animateNumbers = () => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          number: Math.min(stat.number + Math.ceil(stat.target / 50), stat.target)
        }))
      );
    };

    const interval = setInterval(() => {
      if (stats.every(stat => stat.number >= stat.target)) {
        clearInterval(interval);
        return;
      }
      animateNumbers();
    }, 50);

    return () => clearInterval(interval);
  }, [stats]);

  // Security functions
  const generateSecurityChallenge = () => {
    const randomIndex = Math.floor(Math.random() * securityChallenges.length);
    setSecurityChallenge(securityChallenges[randomIndex]);
    setUserAnswer('');
  };

  const verifySecurityAnswer = () => {
    if (userAnswer.trim() === securityChallenge.answer) {
      setSecurityVerified(true);
      setShowSecurity(false);
      setAttempts(0);
      
      // Navigate based on selected login type
      switch (selectedLoginType) {
        case 'student':
          navigate('/students');
          break;
        case 'institute':
          navigate('/institute');
          break;
        case 'company':
          navigate('/company');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          break;
      }
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        // Too many failed attempts
        setShowSecurity(false);
        setSecurityVerified(false);
        setAttempts(0);
        alert('Too many failed attempts. Please try again later.');
      } else {
        generateSecurityChallenge(); // New challenge
        alert(`Incorrect answer. Please try again. Attempts remaining: ${2 - attempts}`);
      }
    }
  };

  const handleSecureLogin = (type) => {
    setSelectedLoginType(type);
    setShowSecurity(true);
    generateSecurityChallenge();
  };

  // Button click handlers
  const handleGetStarted = () => {
    setShowPortal(true);
    setTimeout(() => {
      const portalSection = document.getElementById('portal-section');
      if (portalSection) {
        portalSection.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }
    }, 100);
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }
  };

  const handleStudentLogin = () => {
    handleSecureLogin('student');
  };

  const handleInstituteLogin = () => {
    handleSecureLogin('institute');
  };

  const handleCompanyLogin = () => {
    handleSecureLogin('company');
  };

  const handleAdminLogin = () => {
    handleSecureLogin('admin');
  };

  const handleBackToHome = () => {
    setShowPortal(false);
    setShowAboutUs(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignInInstead = () => {
    navigate('/login');
  };

  const handleGetToKnowAboutUs = () => {
    setShowAboutUs(true);
    setTimeout(() => {
      document.getElementById('about-section').scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleWatchTheSpace = () => {
    setShowVideoModal(true);
    setVideoError(false);
    setVideoLoading(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };

  const features = [
    {
      icon: '🎓',
      title: 'Find Your Course',
      description: 'Discover programs from Lesotho institutions with detailed information and requirements.'
    },
    {
      icon: '💼',
      title: 'Career Placement',
      description: 'Connect with top employers and find perfect job matches after graduation.'
    },
    {
      icon: '📊',
      title: 'Smart Matching',
      description: 'AI-powered course and job recommendations based on your profile and interests.'
    },
    {
      icon: '🔔',
      title: 'Instant Notifications',
      description: 'Get real-time alerts for new opportunities and application updates.'
    },
    {
      icon: '📝',
      title: 'Easy Applications',
      description: 'Apply to multiple institutions and jobs with just a few clicks.'
    },
    {
      icon: '🤝',
      title: 'Expert Support',
      description: 'Get guidance from career counselors and industry professionals.'
    }
  ];

  return (
    <div className="homepage">
      {/* Security Verification Modal */}
      {showSecurity && (
        <div className="security-modal-overlay">
          <div className="security-modal-content">
            <div className="security-header">
              <h3>🔒 Security Verification</h3>
              <p>Complete this simple challenge to verify you're human</p>
            </div>
            
            <div className="security-body">
              <div className="security-challenge">
                <div className="security-icon">🔐</div>
                <div className="challenge-question">
                  <p><strong>Security Question:</strong></p>
                  <h4>{securityChallenge?.question}</h4>
                </div>
              </div>
              
              <div className="security-input">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="security-answer-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      verifySecurityAnswer();
                    }
                  }}
                />
                <button 
                  className="security-verify-btn"
                  onClick={verifySecurityAnswer}
                >
                  Verify & Continue
                </button>
              </div>
              
              <div className="security-info">
                <p className="security-note">
                  <span className="info-icon">ℹ️</span>
                  This security check helps protect your account from unauthorized access.
                </p>
                <div className="security-features">
                  <div className="security-feature">
                    <span className="feature-check">✓</span>
                    <span>Account Protection</span>
                  </div>
                  <div className="security-feature">
                    <span className="feature-check">✓</span>
                    <span>Bot Prevention</span>
                  </div>
                  <div className="security-feature">
                    <span className="feature-check">✓</span>
                    <span>Data Security</span>
                  </div>
                </div>
              </div>
              
              <div className="security-footer">
                <button 
                  className="security-cancel-btn"
                  onClick={() => setShowSecurity(false)}
                >
                  Cancel
                </button>
                <span className="attempts-count">
                  Attempts: {attempts}/3
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={handleCloseVideoModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-close-btn" onClick={handleCloseVideoModal}>
              ×
            </button>
            <h3 className="video-modal-title">Online Application Portal Demo</h3>
            <p className="video-subtitle">See how students apply to universities and jobs through our platform</p>
            
            <div className="video-container">
              <div className="video-wrapper">
                {videoError ? (
                  <div className="video-fallback">
                    <div className="fallback-content">
                      <div className="fallback-icon">🎬</div>
                      <h4>Platform Demo</h4>
                      <p>Experience our application portal firsthand by creating an account and exploring the features!</p>
                      <div className="fallback-features">
                        <div className="fallback-feature">
                          <span className="feature-check">✓</span>
                          <span>University Application Process</span>
                        </div>
                        <div className="fallback-feature">
                          <span className="feature-check">✓</span>
                          <span>Internship Applications</span>
                        </div>
                        <div className="fallback-feature">
                          <span className="feature-check">✓</span>
                          <span>Job Application System</span>
                        </div>
                        <div className="fallback-feature">
                          <span className="feature-check">✓</span>
                          <span>Document Upload & Tracking</span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={handleGetStarted}
                      >
                        Try It Yourself
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="video-player-container">
                    {videoLoading && (
                      <div className="video-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading demo video...</p>
                      </div>
                    )}
                    <video 
                      ref={videoRef}
                      controls 
                      autoPlay 
                      muted
                      className="demo-video"
                      poster="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                      onError={handleVideoError}
                      onLoadedData={handleVideoLoad}
                      onCanPlay={handleVideoLoad}
                    >
                      <source 
                        src="/videos/platform-demo.mp4" 
                        type="video/mp4" 
                      />
                      <source 
                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" 
                        type="video/mp4" 
                      />
                      <source 
                        src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4" 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
              
              <div className="video-description">
                <div className="video-stats">
                  <div className="stat">
                    <strong>1,250+</strong>
                    <span>Students Helped</span>
                  </div>
                  <div className="stat">
                    <strong>45+</strong>
                    <span>Partner Institutions</span>
                  </div>
                  <div className="stat">
                    <strong>320+</strong>
                    <span>Job Opportunities</span>
                  </div>
                </div>

                <div className="application-scenarios">
                  <h4>What you'll experience:</h4>
                  <div className="scenario">
                    <span className="scenario-icon">🎓</span>
                    <div className="scenario-content">
                      <h5>University Applications</h5>
                      <p>Apply to multiple Lesotho institutions with one platform - no more physical visits required</p>
                    </div>
                  </div>
                  <div className="scenario">
                    <span className="scenario-icon">💼</span>
                    <div className="scenario-content">
                      <h5>Internship Applications</h5>
                      <p>Find and apply for internships with top companies across Lesotho</p>
                    </div>
                  </div>
                  <div className="scenario">
                    <span className="scenario-icon">🏢</span>
                    <div className="scenario-content">
                      <h5>Job Applications</h5>
                      <p>Graduates can directly apply to jobs posted by employers on our platform</p>
                    </div>
                  </div>
                </div>
                
                <div className="platform-features">
                  <h5>Platform Features:</h5>
                  <div className="features-grid">
                    <div className="feature-item">
                      <span className="feature-dot"></span>
                      <span>Online application forms</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-dot"></span>
                      <span>Document upload system</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-dot"></span>
                      <span>Application tracking</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-dot"></span>
                      <span>Real-time status updates</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-dot"></span>
                      <span>Interview scheduling</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-dot"></span>
                      <span>Acceptance notifications</span>
                    </div>
                  </div>
                </div>
                
                <div className="success-stories-preview">
                  <h5>Success Stories:</h5>
                  <div className="stories-grid">
                    <div className="story-card">
                      <div className="story-avatar">TM</div>
                      <div className="story-content">
                        <strong>Thabo M.</strong>
                        <p>"Applied to 3 universities through the portal, got accepted at Limkokwing University!"</p>
                      </div>
                    </div>
                    <div className="story-card">
                      <div className="story-avatar">LK</div>
                      <div className="story-content">
                        <strong>Lineo K.</strong>
                        <p>"Found my internship at Lesotho Bank without leaving home. The process was so easy!"</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="video-note">
                  Our platform simplifies the entire application process for students, institutions, and employers across Lesotho.
                </p>
              </div>
            </div>
            
            <div className="video-cta">
              <p>Ready to start your application journey?</p>
              <div className="video-cta-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleGetStarted}
                >
                  Start Your Application
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleSecureLogin('student')}
                >
                  Student Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="floating-animation">
              <div className="student-avatar">🎓</div>
              <div className="graduation-cap">🎓</div>
              <div className="books">📚</div>
              <div className="laptop">💻</div>
            </div>
            
            <h1 className="hero-title">Welcome to our Career Guidance Hub!</h1>
            <p className="hero-subtitle">
              Unlock your potential and explore diverse career paths.
            </p>
            <p className="hero-description">
              Receive expert advice, resources, and personalized support.
            </p>
            <p className="hero-cta">
              Start your journey to success today!
            </p>
            <div className="hero-buttons">
              <button 
                className={`btn btn-primary ${hoveredButton === 'get-started' ? 'btn-hover' : ''}`}
                onClick={handleGetStarted}
                onMouseEnter={() => setHoveredButton('get-started')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="btn-icon">🚀</span>
                Get Started
              </button>
              <button 
                className={`btn btn-secondary ${hoveredButton === 'learn-more' ? 'btn-hover' : ''}`}
                onClick={handleLearnMore}
                onMouseEnter={() => setHoveredButton('learn-more')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="btn-icon">📚</span>
                Learn More
              </button>
            </div>

            {/* Enhanced Quick Login Options with Security */}
            <div className="quick-login">
              <div className="login-header">
                <p className="login-title">Already have an account?</p>
                <div className="security-badge">
                  <span className="lock-icon">🔒</span>
                  <span>Secure Login</span>
                </div>
              </div>
              <div className="login-buttons">
                <button 
                  className="login-btn student-login"
                  onClick={handleStudentLogin}
                >
                  <span className="login-icon">🎓</span>
                  Student Login
                </button>
                <button 
                  className="login-btn institute-login"
                  onClick={handleInstituteLogin}
                >
                  <span className="login-icon">🏫</span>
                  Institute Login
                </button>
                <button 
                  className="login-btn company-login"
                  onClick={handleCompanyLogin}
                >
                  <span className="login-icon">💼</span>
                  Company Login
                </button>
                <button 
                  className="login-btn admin-login"
                  onClick={handleAdminLogin}
                >
                  <span className="login-icon">⚙️</span>
                  Admin Portal
                </button>
              </div>
              <div className="login-security-info">
                <p className="security-message">
                  <span className="shield-icon">🛡️</span>
                  Your login is protected by security verification
                </p>
                <div className="security-features-mini">
                  <span className="security-feature">Bot Protection</span>
                  <span className="security-feature">Account Security</span>
                  <span className="security-feature">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* New Portal Section */}
      {showPortal && (
        <section id="portal-section" className="portal-section">
          <div className="portal-container">
            <button 
              className="back-to-home-btn portal-back-btn"
              onClick={handleBackToHome}
            >
              ← Back to Home
            </button>
            
            <div className="portal-content">
              <h1 className="portal-title">Create Your Account</h1>
              <p className="portal-subtitle">Join the Career Connect community</p>

              <div className="account-type-section">
                <h2 className="account-type-title">Select your account type:</h2>
                
                <div className="account-type-cards">
                  <div 
                    className="account-type-card"
                    onClick={handleStudentLogin}
                  >
                    <div className="account-icon">🎓</div>
                    <h3 className="account-type-name">Student</h3>
                    <p className="account-type-description">
                      Apply to institutions and find career opportunities
                    </p>
                    <div className="security-note-small">
                      <span className="mini-lock">🔒</span>
                      Secure Login
                    </div>
                    <div className="account-arrow">→</div>
                  </div>

                  <div 
                    className="account-type-card"
                    onClick={handleInstituteLogin}
                  >
                    <div className="account-icon">🏫</div>
                    <h3 className="account-type-name">Institution</h3>
                    <p className="account-type-description">
                      Manage admissions and publish programs
                    </p>
                    <div className="security-note-small">
                      <span className="mini-lock">🔒</span>
                      Secure Login
                    </div>
                    <div className="account-arrow">→</div>
                  </div>

                  <div 
                    className="account-type-card"
                    onClick={handleCompanyLogin}
                  >
                    <div className="account-icon">💼</div>
                    <h3 className="account-type-name">Company</h3>
                    <p className="account-type-description">
                      Post jobs and recruit qualified graduates
                    </p>
                    <div className="security-note-small">
                      <span className="mini-lock">🔒</span>
                      Secure Login
                    </div>
                    <div className="account-arrow">→</div>
                  </div>

                  <div 
                    className="account-type-card admin-card"
                    onClick={handleAdminLogin}
                  >
                    <div className="account-icon">⚙️</div>
                    <h3 className="account-type-name">Admin</h3>
                    <p className="account-type-description">
                      System administration and platform management
                    </p>
                    <div className="admin-badge">🔒</div>
                    <div className="security-note-small">
                      <span className="mini-lock">🔒</span>
                      Enhanced Security
                    </div>
                    <div className="account-arrow">→</div>
                  </div>
                </div>
              </div>

              <div className="portal-footer">
                <p className="have-account-text">
                  Already have an account?
                </p>
                <button 
                  className="sign-in-instead-btn"
                  onClick={handleSignInInstead}
                >
                  Sign In Instead
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Us Section */}
      {showAboutUs && (
        <section id="about-section" className="about-section">
          <div className="container">
            <div className="about-header">
              <h2 className="section-title">About Our Platform</h2>
              <p className="section-subtitle">
                Empowering Lesotho's Future Through Digital Education Access
              </p>
              <button 
                className="back-to-home-btn"
                onClick={handleBackToHome}
              >
                ← Back to Home
              </button>
            </div>

            <div className="mission-section">
              <h3>Our Mission</h3>
              <p>
                To create a centralized digital platform that enables students across Lesotho to 
                easily discover, compare, and apply to universities and colleges without the need 
                for physical visits. We aim to bridge the gap between educational institutions 
                and aspiring students through technology.
              </p>
            </div>

            <div className="problem-solution-section">
              <div className="problem-section">
                <h3>🚧 The Challenge</h3>
                <p>
                  Many students in Lesotho face difficulties in accessing higher education information 
                  and application processes. Traditional methods require:
                </p>
                <ul>
                  <li>Physical travel to multiple institutions</li>
                  <li>Time-consuming manual application processes</li>
                  <li>Limited access to comprehensive course information</li>
                  <li>Difficulty comparing different institutions and programs</li>
                </ul>
              </div>

              <div className="solution-section">
                <h3>💡 Our Solution</h3>
                <p>
                  Our platform provides a comprehensive digital solution that allows students to:
                </p>
                <ul>
                  <li>Browse all Lesotho institutions in one place</li>
                  <li>Compare courses, fees, and requirements</li>
                  <li>Apply to multiple institutions online</li>
                  <li>Receive real-time application updates</li>
                  <li>Access career guidance and counseling</li>
                </ul>
              </div>
            </div>

            {/* Team Section */}
            <div className="team-section">
              <h3 className="section-title">Meet Our Team</h3>
              <p className="section-subtitle">
                Students at Limkokwing University of Creative Technology, passionate about 
                transforming education access in Lesotho through technology.
              </p>
              
              <div className="team-grid">
                {teamMembers.map((member, index) => (
                  <div key={index} className="team-card">
                    <div className="member-avatar">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 className="member-name">{member.name}</h4>
                    <p className="member-role">{member.role}</p>
                    <p className="member-description">{member.description}</p>
                    <div className="member-skills">
                      {member.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Contact */}
            <div className="location-section">
              <h3>📍 Our Location</h3>
              <div className="location-content">
                <div>
                  <p><strong>Limkokwing University of Creative Technology</strong></p>
                  <p>Maseru, Lesotho</p>
                  <p>Pioneer Road, Maseru West</p>
                  <p>+266 2231 2133</p>
                </div>
                <div className="map-placeholder">
                  🗺️ Maseru, Lesotho
                </div>
              </div>
            </div>

            <div className="vision-section">
              <h3>🌟 Our Vision</h3>
              <p>
                We envision a future where every student in Lesotho has equal access to higher 
                education opportunities, regardless of their geographical location or economic 
                background. By digitizing the application process, we aim to increase enrollment 
                rates and reduce dropout rates caused by logistical challenges.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title white-title">Transforming Careers in Lesotho</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="pulse-dot"></div>
                <h3 className="stat-number">{stat.number}+</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${hoveredFeature === index ? 'feature-hover' : ''}`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="success-animation">
              <div className="graduate">🎓</div>
              <div className="job-offer">💼</div>
              <div className="celebration">🎉</div>
            </div>
            
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of students and professionals who have found their path to success.</p>
            <div className="cta-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleGetToKnowAboutUs}
              >
                <span className="btn-icon">🌟</span>
                Get to know about us
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={handleWatchTheSpace}
              >
                <span className="btn-icon">🎬</span>
                Watch the space
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-brand">
                <h3>Career Connect</h3>
                <p className="footer-subtitle">Lesotho Education Portal</p>
                <p className="footer-description">
                  Empowering students, institutions, and companies in Lesotho to connect, learn, and grow together. 
                  Your gateway to higher education and career success.
                </p>
                <div className="social-section">
                  <h4>Follow Us</h4>
                  <div className="social-links">
                    <a href="#" className="social-link">Facebook</a>
                    <a href="#" className="social-link">Twitter</a>
                    <a href="#" className="social-link">LinkedIn</a>
                    <a href="#" className="social-link">Instagram</a>
                  </div>
                </div>
              </div>

              <div className="footer-links">
                <div className="footer-column">
                  <h4>Quick Links</h4>
                  <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">How It Works</a></li>
                    <li><a href="#">For Students</a></li>
                    <li><a href="#">For Institutions</a></li>
                    <li><a href="#">For Companies</a></li>
                    <li><a href="#">Admin Portal</a></li>
                    <li><a href="#">Contact</a></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4>Security & Privacy</h4>
                  <ul>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Cookie Policy</a></li>
                    <li><a href="#">Security Features</a></li>
                    <li><a href="#">Data Protection</a></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4>Contact</h4>
                  <div className="contact-info">
                    <p><strong>Email</strong><br />careerguidance@info.com</p>
                    <p><strong>Phone</strong><br />+266 2331 0000</p>
                    <p><strong>Address</strong><br />Maseru, Lesotho</p>
                  </div>
                </div>

                <div className="footer-column">
                  <h4>Newsletter</h4>
                  <p>Stay updated with latest opportunities</p>
                  <div className="newsletter-form">
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="newsletter-input"
                    />
                    <button className="newsletter-btn">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p>&copy; 2025 Career Connect Lesotho. All rights reserved.</p>
              <p>Empowering education and career growth in Lesotho.</p>
              <div className="security-badges">
                <span className="security-badge">🔒 Secure Platform</span>
                <span className="security-badge">🛡️ Data Protected</span>
                <span className="security-badge">✅ Verified System</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;