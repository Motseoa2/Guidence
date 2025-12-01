import React, { useState, useEffect } from 'react';

const SystemReports = () => {
    const [reports, setReports] = useState({});
    const [dateRange, setDateRange] = useState('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [statsRes, appsRes, usersRes] = await Promise.all([
                fetch('http://localhost:8081/api/admin/stats'),
                fetch('http://localhost:8081/api/applications'),
                fetch('http://localhost:8081/api/users')
            ]);

            const [stats, applications, users] = await Promise.all([
                statsRes.json(),
                appsRes.json(),
                usersRes.json()
            ]);

            // Generate comprehensive reports
            const userStats = analyzeUsers(users);
            const applicationStats = analyzeApplications(applications);
            const chartData = generateChartData(users, applications);
            
            setReports({
                userStats,
                applicationStats,
                summary: stats,
                chartData
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeUsers = (users) => {
        const students = users.filter(u => u.role === 'student');
        const institutes = users.filter(u => u.role === 'institute');
        const companies = users.filter(u => u.role === 'company');
        
        return {
            total: users.length,
            byRole: { students: students.length, institutes: institutes.length, companies: companies.length },
            growth: calculateGrowth(users)
        };
    };

    const analyzeApplications = (applications) => {
        const statusCount = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        return {
            total: applications.length,
            byStatus: statusCount,
            acceptanceRate: ((statusCount.Accepted || 0) / applications.length * 100).toFixed(1)
        };
    };

    const calculateGrowth = (users) => {
        const lastWeek = users.filter(u => {
            const userDate = new Date(u.createdAt?.toDate?.() || u.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return userDate > weekAgo;
        }).length;
        
        return {
            weekly: lastWeek,
            percentage: users.length > 0 ? ((lastWeek / users.length) * 100).toFixed(1) : 0
        };
    };

    const generateChartData = (users, applications) => {
        // Mock chart data - in real app, this would come from your API
        return {
            userGrowth: [65, 78, 90, 81, 96, 105, 120],
            applicationStatus: [
                { status: 'Accepted', count: reports.applicationStats?.byStatus?.Accepted || 25, color: '#10b981' },
                { status: 'Pending', count: reports.applicationStats?.byStatus?.pending || 40, color: '#f59e0b' },
                { status: 'Rejected', count: reports.applicationStats?.byStatus?.Rejected || 15, color: '#ef4444' }
            ],
            userDistribution: [
                { role: 'Students', count: reports.userStats?.byRole?.students || 150, color: '#3b82f6' },
                { role: 'Institutions', count: reports.userStats?.byRole?.institutes || 25, color: '#8b5cf6' },
                { role: 'Companies', count: reports.userStats?.byRole?.companies || 45, color: '#06b6d4' }
            ]
        };
    };

    const renderBarChart = (data, title, colors) => {
        const maxValue = Math.max(...data);
        return (
            <div className="chart-bar-container">
                <h4>{title}</h4>
                <div className="chart-bars">
                    {data.map((value, index) => (
                        <div key={index} className="bar-wrapper">
                            <div 
                                className="bar" 
                                style={{ 
                                    height: `${(value / maxValue) * 100}%`,
                                    background: colors ? colors[index] : `hsl(${index * 60}, 70%, 50%)`
                                }}
                            ></div>
                            <span className="bar-label">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPieChart = (data, title) => {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        let accumulatedAngle = 0;
        
        return (
            <div className="chart-pie-container">
                <h4>{title}</h4>
                <div className="pie-chart">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        {data.map((item, index) => {
                            const percentage = (item.count / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const largeArc = percentage > 50 ? 1 : 0;
                            
                            const x1 = 60 + 50 * Math.cos(accumulatedAngle * Math.PI / 180);
                            const y1 = 60 + 50 * Math.sin(accumulatedAngle * Math.PI / 180);
                            accumulatedAngle += angle;
                            const x2 = 60 + 50 * Math.cos(accumulatedAngle * Math.PI / 180);
                            const y2 = 60 + 50 * Math.sin(accumulatedAngle * Math.PI / 180);
                            
                            const pathData = [
                                `M 60 60`,
                                `L ${x1} ${y1}`,
                                `A 50 50 0 ${largeArc} 1 ${x2} ${y2}`,
                                `Z`
                            ].join(' ');
                            
                            return (
                                <path 
                                    key={index}
                                    d={pathData} 
                                    fill={item.color}
                                    className="pie-segment"
                                />
                            );
                        })}
                        <circle cx="60" cy="60" r="30" fill="white" />
                    </svg>
                </div>
                <div className="pie-legend">
                    {data.map((item, index) => (
                        <div key={index} className="legend-item">
                            <div 
                                className="legend-color" 
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span>{item.role || item.status}: {item.count} ({((item.count / total) * 100).toFixed(1)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const styles = `
        .reports-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
        }

        .reports-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .reports-header h2 {
            font-size: 2.25rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
        }

        .reports-header select {
            padding: 0.75rem 1.5rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 1rem;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .reports-header select:hover {
            border-color: #667eea;
            transform: translateY(-2px);
        }

        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .report-card {
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border-left: 4px solid;
            position: relative;
            overflow: hidden;
        }

        .report-card:nth-child(1) { border-left-color: #3b82f6; }
        .report-card:nth-child(2) { border-left-color: #10b981; }
        .report-card:nth-child(3) { border-left-color: #8b5cf6; }

        .report-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
        }

        .report-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .report-card h3::before {
            content: '';
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }

        .report-data {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .report-data p {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: #f8fafc;
            border-radius: 10px;
            margin: 0;
            transition: all 0.2s ease;
        }

        .report-data p:hover {
            background: #e2e8f0;
            transform: translateX(5px);
        }

        .report-data strong {
            font-size: 1.125rem;
            color: #1f2937;
            background: white;
            padding: 0.25rem 0.75rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .chart-container {
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .chart-container h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #1f2937;
            text-align: center;
        }

        .chart-bar-container {
            text-align: center;
        }

        .chart-bar-container h4 {
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 1rem;
        }

        .chart-bars {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            height: 200px;
            gap: 1rem;
            padding: 1rem;
        }

        .bar-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .bar {
            width: 40px;
            border-radius: 8px 8px 0 0;
            transition: all 0.3s ease;
            min-height: 10px;
        }

        .bar:hover {
            transform: scale(1.05);
            opacity: 0.9;
        }

        .bar-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
        }

        .chart-pie-container {
            text-align: center;
        }

        .chart-pie-container h4 {
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 1rem;
        }

        .pie-chart {
            display: flex;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .pie-segment {
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .pie-segment:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }

        .pie-legend {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }

        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 3px;
        }

        .export-section {
            text-align: center;
            margin-top: 2rem;
        }

        .btn-export {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1.125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }

        .btn-export:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
        }

        .loading-spinner {
            text-align: center;
            padding: 3rem;
            font-size: 1.125rem;
            color: #6b7280;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .reports-container {
                padding: 1rem;
            }

            .reports-header {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }

            .reports-grid,
            .charts-grid {
                grid-template-columns: 1fr;
            }

            .chart-bars {
                height: 150px;
            }

            .bar {
                width: 30px;
            }
        }

        /* Animation for cards */
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

        .report-card {
            animation: fadeInUp 0.6s ease-out;
        }

        .report-card:nth-child(1) { animation-delay: 0.1s; }
        .report-card:nth-child(2) { animation-delay: 0.2s; }
        .report-card:nth-child(3) { animation-delay: 0.3s; }
        .chart-container { animation: fadeInUp 0.6s ease-out 0.4s both; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="reports-container">
                <div className="reports-header">
                    <h2>📈 System Reports & Analytics</h2>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        Loading reports...
                    </div>
                ) : reports.summary ? (
                    <>
                        <div className="reports-grid">
                            <div className="report-card">
                                <h3>User Statistics</h3>
                                <div className="report-data">
                                    <p>Total Users: <strong>{reports.userStats?.total}</strong></p>
                                    <p>Students: <strong>{reports.userStats?.byRole?.students}</strong></p>
                                    <p>Institutions: <strong>{reports.userStats?.byRole?.institutes}</strong></p>
                                    <p>Companies: <strong>{reports.userStats?.byRole?.companies}</strong></p>
                                    <p>Weekly Growth: <strong>{reports.userStats?.growth?.weekly} users</strong></p>
                                </div>
                            </div>

                            <div className="report-card">
                                <h3>Application Statistics</h3>
                                <div className="report-data">
                                    <p>Total Applications: <strong>{reports.applicationStats?.total}</strong></p>
                                    <p>Accepted: <strong>{reports.applicationStats?.byStatus?.Accepted || 0}</strong></p>
                                    <p>Pending: <strong>{reports.applicationStats?.byStatus?.pending || 0}</strong></p>
                                    <p>Rejected: <strong>{reports.applicationStats?.byStatus?.Rejected || 0}</strong></p>
                                    <p>Acceptance Rate: <strong>{reports.applicationStats?.acceptanceRate}%</strong></p>
                                </div>
                            </div>

                            <div className="report-card">
                                <h3>Platform Overview</h3>
                                <div className="report-data">
                                    <p>Active Jobs: <strong>{reports.summary.activeJobs || 0}</strong></p>
                                    <p>Pending Approvals: <strong>{reports.summary.pendingApprovals || 0}</strong></p>
                                    <p>Total Institutions: <strong>{reports.summary.institutions || 0}</strong></p>
                                    <p>Partner Companies: <strong>{reports.summary.companies || 0}</strong></p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="charts-grid">
                            <div className="chart-container">
                                <h3>User Growth Trend</h3>
                                {renderBarChart(
                                    reports.chartData?.userGrowth || [65, 78, 90, 81, 96, 105, 120],
                                    'Weekly User Growth',
                                    ['#3b82f6', '#60a5fa', '#93c5fd', '#3b82f6', '#60a5fa', '#93c5fd', '#3b82f6']
                                )}
                            </div>

                            <div className="chart-container">
                                <h3>Application Status</h3>
                                {renderPieChart(
                                    reports.chartData?.applicationStatus || [
                                        { status: 'Accepted', count: 25, color: '#10b981' },
                                        { status: 'Pending', count: 40, color: '#f59e0b' },
                                        { status: 'Rejected', count: 15, color: '#ef4444' }
                                    ],
                                    'Application Distribution'
                                )}
                            </div>

                            <div className="chart-container">
                                <h3>User Distribution</h3>
                                {renderPieChart(
                                    reports.chartData?.userDistribution || [
                                        { role: 'Students', count: 150, color: '#3b82f6' },
                                        { role: 'Institutions', count: 25, color: '#8b5cf6' },
                                        { role: 'Companies', count: 45, color: '#06b6d4' }
                                    ],
                                    'User Types'
                                )}
                            </div>
                        </div>

                        <div className="export-section">
                            <button className="btn-export" onClick={() => alert('Export functionality would be implemented here')}>
                                📥 Export Full Report
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="loading-spinner">
                        Failed to load reports. Please try again.
                    </div>
                )}
            </div>
        </>
    );
};

export default SystemReports;