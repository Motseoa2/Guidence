import React, { useState, useEffect } from 'react';

const Profile = ({ user }) => {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        location: '',
        phone: '',
        website: '',
        description: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Initialize profile data when user prop changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                location: user.location || '',
                phone: user.phone || '',
                website: user.website || '',
                description: user.description || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8081/api/institutes/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: profileData.name,
                    email: profileData.email,
                    oldEmail: user.email, // Original email for identification
                    location: profileData.location,
                    phone: profileData.phone,
                    website: profileData.website,
                    description: profileData.description
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage('Profile updated successfully!');
                setIsEditing(false);
                
                // Update local storage with new data
                const updatedUser = {
                    ...user,
                    name: profileData.name,
                    email: profileData.email
                };
                localStorage.setItem('instituteUser', JSON.stringify(updatedUser));
                
                // Reload the page to reflect changes
                window.location.reload();
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage('New password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // First verify current password
            const verifyResponse = await fetch('http://localhost:8081/api/institute/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    password: passwordData.currentPassword
                }),
            });

            if (!verifyResponse.ok) {
                setMessage('Current password is incorrect');
                setLoading(false);
                return;
            }

            // Update password (you'll need to create this endpoint)
            const updateResponse = await fetch('http://localhost:8081/api/institute/update-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            if (updateResponse.ok) {
                setMessage('Password updated successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to original values
        setProfileData({
            name: user.name || '',
            email: user.email || '',
            location: user.location || '',
            phone: user.phone || '',
            website: user.website || '',
            description: user.description || ''
        });
        setMessage('');
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>Institute Profile</h2>
                <p>Manage your institution's profile information</p>
            </div>

            {message && (
                <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="profile-content">
                {/* Profile Information Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <h3>Institution Information</h3>
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="edit-btn"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Institution Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={profileData.location}
                                        onChange={handleInputChange}
                                        placeholder="City, Country"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+266 1234 5678"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={profileData.website}
                                        onChange={handleInputChange}
                                        placeholder="https://your-institution.edu.ls"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={profileData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of your institution..."
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="save-btn"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleCancelEdit}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info">
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Institution Name</label>
                                    <p>{profileData.name || 'Not set'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Email Address</label>
                                    <p>{profileData.email || 'Not set'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Location</label>
                                    <p>{profileData.location || 'Not set'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Phone Number</label>
                                    <p>{profileData.phone || 'Not set'}</p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Website</label>
                                    <p>
                                        {profileData.website ? (
                                            <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                                                {profileData.website}
                                            </a>
                                        ) : 'Not set'}
                                    </p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Description</label>
                                    <p>{profileData.description || 'No description provided'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Change Password Section */}
                <div className="profile-section">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="save-btn"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Account Status Section */}
                <div className="profile-section">
                    <h3>Account Status</h3>
                    <div className="account-status">
                        <div className="status-item">
                            <label>Account Type</label>
                            <p>Institute Administrator</p>
                        </div>
                        <div className="status-item">
                            <label>Registration Date</label>
                            <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="status-item">
                            <label>Status</label>
                            <span className="status-badge active">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .profile-header {
                    margin-bottom: 30px;
                    text-align: center;
                }

                .profile-header h2 {
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .profile-header p {
                    color: #7f8c8d;
                    font-size: 16px;
                }

                .message {
                    padding: 12px 16px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }

                .message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .profile-section {
                    background: white;
                    padding: 25px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .section-header h3 {
                    color: #2c3e50;
                    margin: 0;
                }

                .edit-btn, .save-btn, .cancel-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .edit-btn {
                    background-color: #3498db;
                    color: white;
                }

                .edit-btn:hover {
                    background-color: #2980b9;
                }

                .save-btn {
                    background-color: #27ae60;
                    color: white;
                }

                .save-btn:hover:not(:disabled) {
                    background-color: #219a52;
                }

                .save-btn:disabled {
                    background-color: #95a5a6;
                    cursor: not-allowed;
                }

                .cancel-btn {
                    background-color: #95a5a6;
                    color: white;
                    margin-left: 10px;
                }

                .cancel-btn:hover {
                    background-color: #7f8c8d;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #2c3e50;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #3498db;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                .profile-info {
                    margin-top: 10px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .info-item {
                    margin-bottom: 20px;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-item label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #7f8c8d;
                    font-size: 14px;
                }

                .info-item p {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 16px;
                }

                .info-item a {
                    color: #3498db;
                    text-decoration: none;
                }

                .info-item a:hover {
                    text-decoration: underline;
                }

                .password-form {
                    max-width: 400px;
                }

                .account-status {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .status-item label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #7f8c8d;
                    font-size: 14px;
                }

                .status-item p {
                    margin: 0;
                    color: #2c3e50;
                    font-size: 16px;
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-badge.active {
                    background-color: #d4edda;
                    color: #155724;
                }

                @media (max-width: 768px) {
                    .form-grid,
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .cancel-btn {
                        margin-left: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;