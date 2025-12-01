import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusReview from '../campus-review/CampusReview';
import './StudentDashboard.css';

const StudentDashboard = ({ student, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [studentStats, setStudentStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    completionRate: '0%',
    averageResponseTime: 'N/A',
    successRate: 0
  });
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (student?.id) {
      fetchDashboardData();
    }
  }, [student]);

  // Initialize conversation when AI chat opens
  useEffect(() => {
    if (showAIChat && conversation.length === 0) {
      setConversation([
        {
          id: 1,
          type: 'ai',
          message: "Hello! I'm your AI academic assistant. I can help you with course recommendations, application tips, career guidance, and answer any questions about your academic journey. How can I assist you today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [showAIChat]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudentStats(),
        fetchStudentApplications(),
        fetchNotifications(),
        fetchAIInsights()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/students/${student.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
        setStudentStats({
          totalApplications: 0,
          pendingApplications: 0,
          acceptedApplications: 0,
          rejectedApplications: 0,
          completionRate: '0%',
          averageResponseTime: 'N/A',
          successRate: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
      setStudentStats({
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        completionRate: '0%',
        averageResponseTime: 'N/A',
        successRate: 0
      });
    }
  };

  const fetchStudentApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/students/${student.id}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch applications:', response.status);
        setApplications([]);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setApplications([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/students/${student.id}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/ai/students/${student.id}/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || data);
      } else {
        console.log('AI insights endpoint not available');
        setAiInsights([]);
      }
    } catch (error) {
      console.log('AI insights endpoint not available');
      setAiInsights([]);
    }
  };

  const handleAIChatSubmit = async (message) => {
    if (!message.trim()) return;

    // Add user message to conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setAiMessage('');
    setIsAiTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.id,
          message: message,
          conversationHistory: conversation.slice(-10),
          context: {
            applications: applications,
            stats: studentStats,
            studentProfile: student
          }
        })
      });

      let aiResponse;
      if (response.ok) {
        const data = await response.json();
        aiResponse = data.response || "I'm here to help with your academic journey!";
      } else {
        aiResponse = generateFallbackResponse(message, applications, student);
      }

      simulateTyping(aiResponse);

    } catch (error) {
      const fallbackResponse = generateFallbackResponse(message, applications, student);
      simulateTyping(fallbackResponse);
    }
  };

  const generateFallbackResponse = (message, applications, student) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('course') || lowerMessage.includes('program') || lowerMessage.includes('study')) {
      if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('which')) {
        return "Based on your academic profile, I'd recommend exploring programs in Computer Science, Business Administration, or Engineering. Consider your strengths in mathematics and sciences. Would you like me to help you find specific courses that match your interests?";
      }
      return "I can help you find courses that match your academic background and career goals. What subjects are you most interested in?";
    }
    
    if (lowerMessage.includes('application') || lowerMessage.includes('apply') || lowerMessage.includes('deadline')) {
      const appCount = applications.length;
      if (appCount > 0) {
        return `I see you have ${appCount} application${appCount > 1 ? 's' : ''} in progress. Make sure to complete all required documents and meet the eligibility criteria for each course. Most applications have deadlines within the next 2-3 months.`;
      }
      return "The application process typically requires your academic transcripts, personal statement, and sometimes recommendation letters. Would you like to start an application now?";
    }
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('future')) {
      return "Your career path should align with your academic strengths and personal interests. Based on common paths, students with your background often pursue careers in technology, business, healthcare, or engineering. What fields interest you most?";
    }
    
    if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('grade')) {
      return "Effective studying involves regular review, practice tests, and breaking material into manageable sections. Make sure to maintain a good balance between coursework and personal time. Is there a specific subject you need help with?";
    }
    
    return "I'm here to help with your academic journey! I can assist with course selection, application guidance, career advice, and study tips. What would you like to know more about?";
  };

  const simulateTyping = (text) => {
    let typedResponse = '';
    const aiMessageId = Date.now() + 1;
    
    const aiMessagePlaceholder = {
      id: aiMessageId,
      type: 'ai',
      message: '',
      timestamp: new Date(),
      isTyping: true
    };
    
    setConversation(prev => [...prev, aiMessagePlaceholder]);

    for (let i = 0; i < text.length; i++) {
      setTimeout(() => {
        typedResponse += text[i];
        setConversation(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, message: typedResponse, isTyping: i < text.length - 1 }
              : msg
          )
        );
        if (i === text.length - 1) {
          setIsAiTyping(false);
        }
      }, i * 20);
    }
  };

  const handleCourseAdvisor = () => {
    setShowAIChat(true);
    const message = "Can you recommend courses based on my academic profile and interests?";
    setAiMessage(message);
  };

  const handleQuickQuestion = (question) => {
    setAiMessage(question);
    handleAIChatSubmit(question);
  };

  const clearConversation = () => {
    setConversation([
      {
        id: 1,
        type: 'ai',
        message: "Hello! I'm your AI academic assistant. I can help you with course recommendations, application tips, career guidance, and answer any questions about your academic journey. How can I assist you today?",
        timestamp: new Date()
      }
    ]);
  };

  // ADDED: Function to navigate to homepage
  const handleBackToHome = () => {
    navigate('/'); // Navigates to the homepage
  };

  const StatsCard = ({ title, value, icon, color, onClick }) => (
    <div 
      className={`stats-card stats-card-${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const handleLogout = () => {
    onLogout();
    navigate('/students/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Enhanced AI Chat Modal */}
      {showAIChat && (
        <AIChatModal 
          onClose={() => setShowAIChat(false)}
          message={aiMessage}
          setMessage={setAiMessage}
          conversation={conversation}
          isTyping={isAiTyping}
          onSubmit={handleAIChatSubmit}
          onQuickQuestion={handleQuickQuestion}
          onClearConversation={clearConversation}
        />
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-main">
          <div className="welcome-section">
            <h1>Welcome back, {student?.name}!</h1>
            <p>Your career journey starts here</p>
          </div>
          
          <div className="header-actions">
            <div className="ai-assistant-buttons">
              <button 
                className="ai-btn assistant"
                onClick={() => setShowAIChat(true)}
              >
                🤖 AI Assistant
              </button>
              <button 
                className="ai-btn advisor"
                onClick={handleCourseAdvisor}
              >
                🎓 Course Advisor
              </button>
            </div>
            <div className="notifications">
              <button className="notification-btn">
                🔔
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </button>
            </div>
            <div className="user-menu">
              <span className="user-name">{student?.name}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
              {/* ADDED: Back to Homepage button */}
              <button 
                className="homepage-btn"
                onClick={handleBackToHome}
                title="Go back to homepage"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <StatsCard 
            title="Total Applications" 
            value={studentStats.totalApplications} 
            icon="📄" 
            color="blue"
            onClick={() => setActiveTab('applications')}
          />
          <StatsCard 
            title="Accepted" 
            value={studentStats.acceptedApplications} 
            icon="✅" 
            color="green"
            onClick={() => setActiveTab('admissions')}
          />
          <StatsCard 
            title="Pending" 
            value={studentStats.pendingApplications} 
            icon="⏳" 
            color="orange" 
          />
          <StatsCard 
            title="Success Rate" 
            value={`${studentStats.successRate}%`} 
            icon="📈" 
            color="purple"
          />
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🏠 Overview
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/students/apply')}
        >
          🎓 Apply for Courses
        </button>
        <button 
          className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          📋 My Applications
        </button>
        <button 
          className={`nav-btn ${activeTab === 'admissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('admissions')}
        >
          📜 Admissions
        </button>
        <button 
          className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          🏛️ Campus Reviews
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/students/transcripts')}
        >
          📊 Transcripts
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/students/profile')}
        >
          👤 My Profile
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            student={student} 
            applications={applications} 
            notifications={notifications}
            aiInsights={aiInsights}
            navigate={navigate} 
            setActiveTab={setActiveTab}
            onCourseAdvisor={handleCourseAdvisor}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsTab applications={applications} />
        )}

        {activeTab === 'admissions' && (
          <AdmissionsTab applications={applications} />
        )}

        {activeTab === 'reviews' && (
          <CampusReview student={student} applications={applications} />
        )}
      </main>
    </div>
  );
};

// Enhanced AI Chat Modal Component
const AIChatModal = ({ 
  onClose, 
  message, 
  setMessage, 
  conversation, 
  isTyping, 
  onSubmit, 
  onQuickQuestion,
  onClearConversation 
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
    }
  };

  const quickQuestions = [
    "What courses match my skills?",
    "How can I improve my application?",
    "What are the upcoming deadlines?",
    "Recommend courses for computer science",
    "Help me with career guidance",
    "How to write a good personal statement?",
    "What documents do I need to apply?",
    "Tell me about scholarship opportunities"
  ];

  return (
    <div className="ai-chat-modal">
      <div className="ai-chat-content">
        <div className="ai-chat-header">
          <div className="header-left">
            <h3>🤖 AI Academic Assistant</h3>
            <span className="online-status">● Online</span>
          </div>
          <div className="header-actions">
            <button 
              className="header-btn clear-btn"
              onClick={onClearConversation}
              title="Clear conversation"
            >
              🗑️ Clear
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="ai-chat-body">
          {/* Quick Questions */}
          <div className="quick-questions">
            <p>💡 Quick questions to get started:</p>
            <div className="quick-questions-grid">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => onQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="chat-messages">
            {conversation.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}-message`}>
                <div className="message-avatar">
                  {msg.type === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {msg.message}
                    {msg.isTyping && <span className="typing-dots">...</span>}
                  </div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ai-chat-form">
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about courses, applications, career guidance..."
              className="ai-chat-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="ai-send-btn"
              disabled={!message.trim() || isTyping}
            >
              {isTyping ? '⏳' : '📤'}
            </button>
          </div>
          <div className="chat-suggestions">
            <small>Try asking about: courses, applications, deadlines, careers</small>
          </div>
        </form>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ student, applications, notifications, aiInsights, navigate, setActiveTab, onCourseAdvisor }) => {
  const recentApplications = applications.slice(0, 3);

  return (
    <div className="overview-tab">
      <div className="content-grid">
        {/* Quick Actions */}
        <div className="card quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => navigate('/students/apply')}
            >
              🎓 Apply for Courses
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/students/profile')}
            >
              👤 Update Profile
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/students/transcripts')}
            >
              📊 Upload Transcripts
            </button>
            <button 
              className="action-btn ai-action"
              onClick={onCourseAdvisor}
            >
              🤖 Get Course Advice
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card ai-insights">
          <div className="card-header">
            <h3>🤖 AI Insights</h3>
          </div>
          <div className="insights-list">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, index) => (
                <div key={insight.id || index} className="insight-item">
                  <div className="insight-icon">💡</div>
                  <div className="insight-content">
                    <p className="insight-title">{insight.title}</p>
                    <p className="insight-message">{insight.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-insights">
                <p>AI insights will appear here based on your activity</p>
                <button className="text-btn" onClick={onCourseAdvisor}>
                  Generate Insights
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Application Analytics Graph */}
        <div className="card analytics-card">
          <div className="card-header">
            <h3>Application Analytics</h3>
          </div>
          <ApplicationTrendsChart applications={applications} />
        </div>

        {/* Recent Applications */}
        <div className="card recent-applications">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <button 
              className="view-all-btn"
              onClick={() => setActiveTab('applications')}
            >
              View All
            </button>
          </div>
          <div className="applications-list">
            {recentApplications.length > 0 ? (
              recentApplications.map(app => (
                <div key={app.id} className="application-item">
                  <div className="app-info">
                    <h4>{app.courseName || app.course_name || 'Course'}</h4>
                    <span className={`status status-${app.status?.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="institution">{app.institutionName || app.institution_name || 'Institution'}</p>
                  <small className="app-date">
                    Applied: {new Date(app.appliedDate || app.appliedAt || app.applied_at || app.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No applications yet</p>
                <button 
                  className="text-btn"
                  onClick={() => navigate('/students/apply')}
                >
                  Start your first application
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Graph */}
        <div className="card status-distribution">
          <div className="card-header">
            <h3>Application Status</h3>
          </div>
          <StatusDistributionChart applications={applications} />
        </div>

        {/* Notifications */}
        <div className="card notifications-card">
          <div className="card-header">
            <h3>Notifications</h3>
            <span className="badge">{notifications.length}</span>
          </div>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-icon">📢</div>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-message">{notif.message}</p>
                    <small className="notification-time">
                      {new Date(notif.createdDate || notif.createdAt || notif.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-notifications">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Application Trends Chart Component
const ApplicationTrendsChart = ({ applications }) => {
  const monthlyData = applications.reduce((acc, app) => {
    const date = app.appliedDate || app.appliedAt || app.applied_at || app.created_at;
    if (date) {
      const month = new Date(date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(monthlyData), 1);

  return (
    <div className="trends-chart">
      <div className="chart-bars">
        {Object.entries(monthlyData).map(([month, count]) => (
          <div key={month} className="bar-container">
            <div className="bar-wrapper">
              <div 
                className="bar" 
                style={{ height: `${(count / maxCount) * 100}%` }}
              >
                <span className="bar-value">{count}</span>
              </div>
            </div>
            <span className="bar-label">{month}</span>
          </div>
        ))}
      </div>
      {Object.keys(monthlyData).length === 0 && (
        <div className="no-chart-data">
          <p>Application data will appear here</p>
        </div>
      )}
    </div>
  );
};

// Status Distribution Chart Component
const StatusDistributionChart = ({ applications }) => {
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const total = applications.length;
  const colors = {
    submitted: '#3b82f6',
    pending: '#f59e0b',
    accepted: '#10b981',
    admitted: '#8b5cf6',
    rejected: '#ef4444',
    unknown: '#6b7280'
  };

  return (
    <div className="status-chart">
      {total > 0 ? (
        <div className="chart-content">
          <div className="chart-bars-horizontal">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="status-bar">
                <div className="status-label">
                  <span className="status-dot" style={{ backgroundColor: colors[status] }}></span>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${(count / total) * 100}%`,
                      backgroundColor: colors[status]
                    }}
                  >
                    <span className="bar-count">{count}</span>
                  </div>
                </div>
                <span className="percentage">{Math.round((count / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-chart-data">
          <p>No application data available</p>
        </div>
      )}
    </div>
  );
};

// Applications Tab Component
const ApplicationsTab = ({ applications }) => {
  return (
    <div className="applications-tab">
      <div className="tab-header">
        <h2>My Applications</h2>
        <p>Track all your course applications</p>
      </div>
      
      <div className="applications-table">
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app.id} className="application-row">
              <div className="app-main">
                <h4>{app.courseName || app.course_name}</h4>
                <p>{app.institutionName || app.institution_name} • {app.facultyName || app.faculty_name}</p>
                <small>
                  Applied: {new Date(app.appliedDate || app.appliedAt || app.applied_at || app.created_at).toLocaleDateString()}
                </small>
              </div>
              <div className="app-status">
                <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                  {app.status}
                </span>
              </div>
              <div className="app-actions">
                <button className="action-btn">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-applications">
            <p>You haven't submitted any applications yet.</p>
            <p>Start by applying for courses in the "Apply for Courses" tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Admissions Tab Component
const AdmissionsTab = ({ applications }) => {
  const admittedApplications = applications.filter(app => 
    app.status === 'Accepted' || app.status === 'accepted' || app.status === 'admitted' || app.status === 'approved'
  );

  return (
    <div className="admissions-tab">
      <div className="tab-header">
        <h2>Admission Results</h2>
        <p>Your successful applications</p>
      </div>
      
      <div className="admissions-list">
        {admittedApplications.length > 0 ? (
          admittedApplications.map(admission => (
            <div key={admission.id} className="admission-card accepted">
              <div className="admission-header">
                <h3>🎉 Congratulations!</h3>
                <span className="admission-badge">Admitted</span>
              </div>
              <div className="admission-details">
                <h4>{admission.courseName || admission.course_name}</h4>
                <p>{admission.institutionName || admission.institution_name}</p>
                <div className="admission-meta">
                  <span>Faculty: {admission.facultyName || admission.faculty_name}</span>
                  <span>Applied: {new Date(admission.appliedDate || admission.appliedAt || admission.applied_at || admission.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="admission-actions">
                <button className="primary-btn">Accept Offer</button>
                <button className="secondary-btn">View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-admissions">
            <p>No admission offers yet.</p>
            <p>Keep checking back for updates on your applications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;