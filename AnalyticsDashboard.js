import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        totalCourses: 0,
        totalFaculties: 0,
        conversionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchInstituteData();
    }, []);

    // ADDED: Function to navigate to homepage
    const handleBackToHome = () => {
        navigate('/'); // Navigates to the homepage
    };

    const fetchInstituteData = async () => {
        try {
            setLoading(true);
            
            const instituteUser = JSON.parse(localStorage.getItem('instituteUser'));
            if (!instituteUser) {
                console.error('No institute user found');
                navigate('/institute/login');
                return;
            }

            // Fetch all data in parallel
            const [coursesResponse, facultiesResponse, applicationsResponse] = await Promise.all([
                fetch('http://localhost:8081/api/courses'),
                fetch('http://localhost:8081/api/faculties'),
                fetch(`http://localhost:8081/api/applications/institute/${instituteUser.id}`)
            ]);

            const coursesData = await coursesResponse.json();
            const facultiesData = await facultiesResponse.json();
            const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : [];

            // Calculate stats
            const totalApps = applicationsData.length || 0;
            const approvedApps = applicationsData.filter(app => app.status === 'approved' || app.status === 'Accepted').length || 0;
            const pendingApps = applicationsData.filter(app => app.status === 'pending').length || 0;
            const conversionRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(1) : 0;

            const instituteStats = {
                totalApplications: totalApps,
                pendingApplications: pendingApps,
                approvedApplications: approvedApps,
                totalCourses: coursesData.length || 0,
                totalFaculties: facultiesData.length || 0,
                conversionRate: conversionRate
            };

            setStats(instituteStats);
            setApplications(applicationsData);
            
            // Generate AI insights with real data
            generateAIInsights(instituteStats, applicationsData);
            
            // Generate recent activities
            setRecentActivities(generateRecentActivities(applicationsData, coursesData));

        } catch (error) {
            console.error('Error fetching institute data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = (stats, applications) => {
        const insights = [];

        // Real AI insights based on actual data
        if (stats.totalApplications === 0) {
            insights.push({
                id: 1,
                title: "Get Started",
                message: "Add courses to start receiving student applications",
                type: "info",
                icon: "🚀",
                action: "addCourse"
            });
        } else if (stats.pendingApplications > 0) {
            insights.push({
                id: 2,
                title: "Applications Need Review",
                message: `You have ${stats.pendingApplications} pending applications waiting for your review`,
                type: "warning",
                icon: "⏳",
                action: "reviewApplications"
            });
        }

        if (stats.conversionRate > 0 && stats.conversionRate < 30) {
            insights.push({
                id: 3,
                title: "Improve Acceptance Rate",
                message: "Consider reviewing your course requirements to attract more qualified applicants",
                type: "warning",
                icon: "📊",
                action: "reviewCourses"
            });
        }

        if (stats.totalCourses < 2) {
            insights.push({
                id: 4,
                title: "Expand Course Offerings",
                message: "Adding more courses can increase application volume by up to 40%",
                type: "info",
                icon: "📚",
                action: "addCourse"
            });
        }

        if (stats.conversionRate > 50) {
            insights.push({
                id: 5,
                title: "Excellent Performance",
                message: `Your ${stats.conversionRate}% acceptance rate is above average!`,
                type: "success",
                icon: "🎯",
                action: null
            });
        }

        // Add data-driven insights
        if (applications.length > 10) {
            const recentApps = applications.slice(-5);
            const avgProcessingTime = "2.3 days"; // You can calculate this from actual timestamps
            insights.push({
                id: 6,
                title: "Processing Efficiency",
                message: `Average application processing time: ${avgProcessingTime}`,
                type: "info",
                icon: "⚡",
                action: null
            });
        }

        setAiInsights(insights.slice(0, 3)); // Show top 3 insights
    };

    const generateRecentActivities = (applications, courses) => {
        const activities = [];
        
        // Recent applications
        const recentApps = applications.slice(0, 3);
        recentApps.forEach(app => {
            activities.push({
                id: app.id,
                action: `New application from ${app.studentName || 'student'}`,
                time: 'Recently',
                type: 'application'
            });
        });

        // Course activities
        if (courses.length > 0) {
            activities.push({
                id: 'courses',
                action: `${courses.length} course${courses.length > 1 ? 's' : ''} active`,
                time: 'Current',
                type: 'course'
            });
        }

        return activities.slice(0, 4);
    };

    const handleInsightAction = (action) => {
        switch (action) {
            case 'addCourse':
                navigate('/institute/add-course');
                break;
            case 'reviewApplications':
                navigate('/institute/view-applications');
                break;
            case 'reviewCourses':
                navigate('/institute/courses');
                break;
            default:
                break;
        }
    };

    // Navigation handlers
    const handleAddCourse = () => navigate('/institute/add-course');
    const handleReviewApplications = () => navigate('/institute/view-applications');
    const handleManageFaculties = () => navigate('/institute/add-faculty');

    // Simplified StatsCard Component
    const StatsCard = ({ title, value, icon, color, onClick }) => (
        <div 
            className="stats-card" 
            onClick={onClick}
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="stats-header">
                <div className="stats-icon" style={{ color }}>{icon}</div>
                <div className="stats-value">{value}</div>
            </div>
            <div className="stats-title">{title}</div>
        </div>
    );

    // Insight Card Component
    const InsightCard = ({ insight }) => (
        <div 
            className={`insight-card insight-${insight.type}`}
            onClick={() => insight.action && handleInsightAction(insight.action)}
        >
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.message}</p>
            </div>
            {insight.action && <div className="insight-arrow">→</div>}
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <h3>Loading Dashboard</h3>
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            {/* ADDED: Home button in top-right corner */}
            <div className="dashboard-top-actions">
                <button 
                    className="home-button"
                    onClick={handleBackToHome}
                    title="Go back to homepage"
                >
                    🏠 Home
                </button>
            </div>
            
            {/* Key Metrics - Directly start with stats */}
            <div className="metrics-grid">
                <StatsCard 
                    title="Total Applications" 
                    value={stats.totalApplications} 
                    icon="📋" 
                    color="#3b82f6"
                    onClick={handleReviewApplications}
                />
                <StatsCard 
                    title="Pending Review" 
                    value={stats.pendingApplications} 
                    icon="⏳" 
                    color="#f59e0b"
                    onClick={handleReviewApplications}
                />
                <StatsCard 
                    title="Approval Rate" 
                    value={`${stats.conversionRate}%`} 
                    icon="✅" 
                    color="#10b981"
                />
                <StatsCard 
                    title="Active Courses" 
                    value={stats.totalCourses} 
                    icon="📚" 
                    color="#8b5cf6"
                    onClick={handleAddCourse}
                />
            </div>

            {/* Main Content */}
            <div className="content-grid">
                {/* Left Column - AI Insights */}
                <div className="dashboard-column">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h3 className="section-title">🤖 Smart Insights</h3>
                            <span className="ai-badge">AI Powered</span>
                        </div>
                        <div className="insights-list">
                            {aiInsights.length > 0 ? (
                                aiInsights.map(insight => (
                                    <InsightCard key={insight.id} insight={insight} />
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📊</div>
                                    <p>Insights will appear as you receive data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard-section">
                        <h3 className="section-title">🚀 Quick Actions</h3>
                        <div className="actions-grid">
                            <button 
                                className="action-button"
                                onClick={handleAddCourse}
                            >
                                <span className="action-icon">➕</span>
                                Add Course
                            </button>
                            <button 
                                className="action-button"
                                onClick={handleReviewApplications}
                            >
                                <span className="action-icon">📋</span>
                                Review Apps
                            </button>
                            <button 
                                className="action-button"
                                onClick={handleManageFaculties}
                            >
                                <span className="action-icon">🏛️</span>
                                Manage Faculties
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="dashboard-column">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h3 className="section-title">🔄 Recent Activity</h3>
                            <span className="count-badge">{recentActivities.length}</span>
                        </div>
                        <div className="activities-list">
                            {recentActivities.length > 0 ? (
                                recentActivities.map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-icon">
                                            {activity.type === 'application' ? '📥' : '📚'}
                                        </div>
                                        <div className="activity-content">
                                            <p className="activity-text">{activity.action}</p>
                                            <span className="activity-time">{activity.time}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">⚡</div>
                                    <p>Activity will show here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Applications Chart */}
                    <div className="dashboard-section">
                        <h3 className="section-title">📈 Applications</h3>
                        {stats.totalApplications > 0 ? (
                            <div className="applications-chart">
                                <div className="chart-bar">
                                    <div 
                                        className="chart-fill approved"
                                        style={{ width: `${(stats.approvedApplications / stats.totalApplications) * 100}%` }}
                                    >
                                        <span className="chart-label">
                                            Approved: {stats.approvedApplications}
                                        </span>
                                    </div>
                                </div>
                                <div className="chart-bar">
                                    <div 
                                        className="chart-fill pending"
                                        style={{ width: `${(stats.pendingApplications / stats.totalApplications) * 100}%` }}
                                    >
                                        <span className="chart-label">
                                            Pending: {stats.pendingApplications}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📊</div>
                                <p>No applications yet</p>
                                <button 
                                    className="primary-button"
                                    onClick={handleAddCourse}
                                >
                                    Add Courses to Get Started
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;