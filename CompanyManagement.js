import React, { useState, useEffect } from 'react';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/companies');
            const data = await response.json();
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (companyId) => {
        try {
            await fetch(`http://localhost:8081/api/companies/${companyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true, status: 'active' })
            });
            fetchCompanies();
            alert('Company approved successfully!');
        } catch (error) {
            console.error('Error approving company:', error);
            alert('Failed to approve company');
        }
    };

    const handleSuspend = async (companyId) => {
        try {
            await fetch(`http://localhost:8081/api/companies/${companyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'suspended' })
            });
            fetchCompanies();
            alert('Company suspended successfully!');
        } catch (error) {
            console.error('Error suspending company:', error);
            alert('Failed to suspend company');
        }
    };

    const handleDelete = async (companyId) => {
        if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
            try {
                await fetch(`http://localhost:8081/api/companies/${companyId}`, {
                    method: 'DELETE'
                });
                fetchCompanies();
                alert('Company deleted successfully!');
            } catch (error) {
                console.error('Error deleting company:', error);
                alert('Failed to delete company');
            }
        }
    };

    const filteredCompanies = companies.filter(company => {
        if (filter === 'pending') return !company.approved;
        if (filter === 'active') return company.approved && company.status !== 'suspended';
        if (filter === 'suspended') return company.status === 'suspended';
        return true;
    });

    if (loading) return <div className="loading">Loading companies...</div>;

    return (
        <div className="management-container">
            <div className="page-header">
                <h2>Company Management</h2>
                <div className="filter-controls">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Companies</option>
                        <option value="pending">Pending Approval</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="companies-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Email</th>
                            <th>Industry</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Registration Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map(company => (
                            <tr key={company.id}>
                                <td>{company.name}</td>
                                <td>{company.email}</td>
                                <td>{company.industry}</td>
                                <td>{company.location}</td>
                                <td>
                                    <span className={`status-badge status-${company.approved ? 'approved' : 'pending'}`}>
                                        {company.approved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td>{new Date(company.createdAt?.toDate?.() || company.createdAt).toLocaleDateString()}</td>
                                <td className="action-buttons">
                                    {!company.approved && (
                                        <button 
                                            className="btn-approve"
                                            onClick={() => handleApprove(company.id)}
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {company.approved && company.status !== 'suspended' && (
                                        <button 
                                            className="btn-suspend"
                                            onClick={() => handleSuspend(company.id)}
                                        >
                                            Suspend
                                        </button>
                                    )}
                                    {company.status === 'suspended' && (
                                        <button 
                                            className="btn-approve"
                                            onClick={() => handleApprove(company.id)}
                                        >
                                            Activate
                                        </button>
                                    )}
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDelete(company.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredCompanies.length === 0 && (
                    <div className="no-data">
                        No companies found for the selected filter.
                    </div>
                )}
            </div>

            <div className="stats-summary">
                <div className="stat-item">
                    <span className="stat-number">{companies.filter(c => !c.approved).length}</span>
                    <span className="stat-label">Pending Approval</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{companies.filter(c => c.approved).length}</span>
                    <span className="stat-label">Approved Companies</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{companies.filter(c => c.status === 'suspended').length}</span>
                    <span className="stat-label">Suspended</span>
                </div>
            </div>
        </div>
    );
};

export default CompanyManagement;