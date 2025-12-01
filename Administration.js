import React, { useState } from 'react';

const Administration = ({ users, applications, fetchDashboardData }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');

  // User statistics
  const userStats = {
    total: users.length,
    verified: users.filter(u => u.verified).length,
    unverified: users.filter(u => !u.verified).length
  };

  // Application statistics
  const applicationStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#BEE8F7', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>User & Application Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: activeTab === 'users' ? '#587EF9' : '#fff',
              color: activeTab === 'users' ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            Users ({userStats.total})
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: activeTab === 'applications' ? '#587EF9' : '#fff',
              color: activeTab === 'applications' ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            Applications ({applicationStats.total})
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            width: '300px'
          }}
        />
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {activeTab === 'users' ? (
          <>
            <div style={{ backgroundColor: '#FF6B6B', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
              <h3>{userStats.total}</h3>
              <p>Total Users</p>
            </div>
            <div style={{ backgroundColor: '#4ECDC4', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
              <h3>{userStats.verified}</h3>
              <p>Verified</p>
            </div>
            <div style={{ backgroundColor: '#45B7D1', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
              <h3>{userStats.unverified}</h3>
              <p>Unverified</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ backgroundColor: '#FF6B6B', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
              <h3>{applicationStats.total}</h3>
              <p>Total Applications</p>
            </div>
            <div style={{ backgroundColor: '#FFEAA7', padding: '20px', borderRadius: '8px', color: 'black', textAlign: 'center' }}>
              <h3>{applicationStats.pending}</h3>
              <p>Pending</p>
            </div>
            <div style={{ backgroundColor: '#96CEB4', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
              <h3>{applicationStats.accepted}</h3>
              <p>Accepted</p>
            </div>
            <div style={{ backgroundColor: '#DDA0DD', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
              <h3>{applicationStats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </>
        )}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h3>User Management ({users.length} users)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {users.map(user => (
              <div key={user.id} style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${user.verified ? '#28a745' : '#dc3545'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{user.name || 'Unknown User'}</h4>
                    <p style={{ margin: '0', color: '#666' }}>ID: {user.id}</p>
                  </div>
                  <span style={{ 
                    backgroundColor: user.verified ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                
                <p style={{ margin: '5px 0' }}><strong>Email:</strong> {user.email || 'No email'}</p>
                <p style={{ margin: '5px 0' }}><strong>Role:</strong> {user.role || 'User'}</p>
                <p style={{ margin: '5px 0' }}><strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          <h3>Application Management ({applications.length} applications)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {applications.map(application => (
              <div key={application.id} style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${
                  application.status === 'accepted' ? '#28a745' : 
                  application.status === 'rejected' ? '#dc3545' : '#ffc107'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Application #{application.id}</h4>
                    <p style={{ margin: '0', color: '#666' }}>Student ID: {application.studentId || 'Unknown'}</p>
                  </div>
                  <span style={{ 
                    backgroundColor: 
                      application.status === 'accepted' ? '#28a745' : 
                      application.status === 'rejected' ? '#dc3545' : '#ffc107',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {application.status || 'Unknown'}
                  </span>
                </div>
                
                <p style={{ margin: '5px 0' }}><strong>Program:</strong> {application.program || 'Not specified'}</p>
                <p style={{ margin: '5px 0' }}><strong>Institution:</strong> {application.institution || 'Not specified'}</p>
                <p style={{ margin: '5px 0' }}><strong>Applied:</strong> {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;