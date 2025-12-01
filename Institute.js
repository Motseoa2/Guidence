import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Import all components with correct paths
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AddFaculty from './components/academics/AddFaculty';
import ManageFaculties from './components/academics/ManageFaculties';
import AddCourse from './components/academics/AddCourse';
import ManageCourses from './components/academics/ManageCourses';
import ViewApplications from './components/admissions/ViewApplications';
import PublishAdmissions from './components/admissions/PublishAdmissions';
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard';
import Profile from './components/dashboard/Profile';

import './styles/Institute.css';

const Institute = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        totalCourses: 0,
        totalFaculties: 0
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('instituteUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            setIsLoggedIn(true);
            loadInstituteStats();
        }
    }, [isLoggedIn]);

    const loadInstituteStats = async () => {
        try {
            // Mock data - replace with actual API calls
            setStats({
                totalApplications: 124,
                pendingApplications: 23,
                approvedApplications: 67,
                totalCourses: 15,
                totalFaculties: 6
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleLogin = (userData) => {
        setCurrentUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('instituteUser', JSON.stringify(userData));
    };

    const handleLogout = () => {
        localStorage.removeItem('instituteUser');
        setCurrentUser(null);
        setIsLoggedIn(false);
        navigate('/institute');
    };

    const handleNavigation = (path) => {
        navigate(`/institute/${path}`);
    };

    // Get current active tab from URL
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('add-faculty') || path.includes('manage-faculties')) return 'faculties';
        if (path.includes('add-course') || path.includes('manage-courses')) return 'courses';
        if (path.includes('view-applications')) return 'applications';
        if (path.includes('publish-admissions')) return 'admissions';
        if (path.includes('profile')) return 'profile';
        return 'dashboard';
    };

    const activeTab = getActiveTab();

    // Enhanced Navigation Link Component
    const NavLinkItem = ({ to, icon, title, badge, tabName }) => (
        <div 
            className={`nav-link ${activeTab === tabName ? 'active' : ''}`}
            onClick={() => handleNavigation(to)}
        >
            <span className="nav-icon">{icon}</span>
            {title}
            {badge && badge > 0 && (
                <span className="notification-badge">{badge}</span>
            )}
        </div>
    );

    if (!isLoggedIn) {
        return (
            <div className="institute-container">
                <div className="auth-container">
                    <div className="auth-tabs">
                        <div 
                            className={`auth-tab ${location.pathname.includes('login') ? 'active' : ''}`}
                            onClick={() => navigate('/institute/login')}
                        >
                            Login
                        </div>
                        <div 
                            className={`auth-tab ${location.pathname.includes('register') ? 'active' : ''}`}
                            onClick={() => navigate('/institute/register')}
                        >
                            Register
                        </div>
                    </div>
                    
                    <div className="auth-content">
                        <Routes>
                            <Route path="login" element={<Login onLogin={handleLogin} />} />
                            <Route path="register" element={<Register />} />
                            <Route path="/" element={<Login onLogin={handleLogin} />} />
                        </Routes>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="institute-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-info">
                        <h1 className="welcome-title">
                            🎓 Institute Portal
                        </h1>
                        <p className="welcome-subtitle">
                            Welcome back, <strong>{currentUser?.name}</strong>
                        </p>
                    </div>
                    <div className="header-actions">
                        <div className="user-info">
                            <div className="user-avatar">
                                {currentUser?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{currentUser?.name}</span>
                                <span className="user-role">Institute Admin</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <span className="logout-icon">↩</span>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="institute-nav">
                <div className="nav-container">
                    <NavLinkItem 
                        to="dashboard"
                        icon="📊"
                        title="Dashboard"
                        tabName="dashboard"
                    />
                    
                    {/* Faculties Dropdown */}
                    <div className="nav-dropdown">
                        <div className={`nav-link ${activeTab === 'faculties' ? 'active' : ''}`}>
                            <span className="nav-icon">🏛️</span>
                            Faculties
                            <span className="dropdown-arrow">▼</span>
                        </div>
                        <div className="dropdown-menu">
                            <div 
                                className="dropdown-item"
                                onClick={() => handleNavigation('add-faculty')}
                            >
                                Add Faculty
                            </div>
                            <div 
                                className="dropdown-item"
                                onClick={() => handleNavigation('manage-faculties')}
                            >
                                Manage Faculties
                            </div>
                        </div>
                    </div>

                    {/* Courses Dropdown */}
                    <div className="nav-dropdown">
                        <div className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}>
                            <span className="nav-icon">📚</span>
                            Courses
                            <span className="dropdown-arrow">▼</span>
                        </div>
                        <div className="dropdown-menu">
                            <div 
                                className="dropdown-item"
                                onClick={() => handleNavigation('add-course')}
                            >
                                Add Course
                            </div>
                            <div 
                                className="dropdown-item"
                                onClick={() => handleNavigation('manage-courses')}
                            >
                                Manage Courses
                            </div>
                        </div>
                    </div>

                    <NavLinkItem 
                        to="view-applications"
                        icon="📋"
                        title="Applications"
                        badge={stats.pendingApplications}
                        tabName="applications"
                    />
                    <NavLinkItem 
                        to="publish-admissions"
                        icon="📢"
                        title="Admissions"
                        tabName="admissions"
                    />
                    <NavLinkItem 
                        to="profile"
                        icon="👤"
                        title="Profile"
                        tabName="profile"
                    />
                </div>
            </nav>

            {/* Main Content */}
            <main className="dashboard-content">
                <div className="content-wrapper">
                    <Routes>
                        <Route path="dashboard" element={<AnalyticsDashboard stats={stats} />} />
                        <Route path="add-faculty" element={<AddFaculty />} />
                        <Route path="manage-faculties" element={<ManageFaculties />} />
                        <Route path="add-course" element={<AddCourse />} />
                        <Route path="manage-courses" element={<ManageCourses />} />
                        <Route path="view-applications" element={<ViewApplications />} />
                        <Route path="publish-admissions" element={<PublishAdmissions />} />
                        <Route path="profile" element={<Profile user={currentUser} />} />
                        <Route path="/" element={<AnalyticsDashboard stats={stats} />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Institute;