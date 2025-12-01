import React, { useState, useEffect } from 'react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchAnalytics();
    fetchChartData();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/admin/charts?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  // CSS Styles
  const styles = {
    analytics: {
      padding: '30px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      padding: '30px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    timeSelector: {
      padding: '12px 20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '500',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    },
    metricCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    metricCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
    },
    metricCardBefore: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
    },
    metricTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#718096',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    metricValue: {
      fontSize: '3rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '8px'
    },
    metricChange: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#48bb78',
      background: '#f0fff4',
      padding: '6px 12px',
      borderRadius: '20px',
      display: 'inline-block'
    },
    chartsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '30px'
    },
    chartCard: {
      background: 'white',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    chartTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '20px',
      textAlign: 'center'
    },
    chartContainer: {
      height: '300px',
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '20px',
      position: 'relative'
    },
    barChart: {
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      height: '200px',
      marginTop: '40px',
      gap: '10px'
    },
    bar: {
      flex: 1,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '8px 8px 0 0',
      position: 'relative',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    barHover: {
      transform: 'scale(1.05)',
      opacity: 0.9
    },
    barLabel: {
      position: 'absolute',
      bottom: '-30px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#718096',
      whiteSpace: 'nowrap'
    },
    barValue: {
      position: 'absolute',
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#2d3748',
      background: 'white',
      padding: '2px 6px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    lineChart: {
      position: 'relative',
      height: '200px',
      marginTop: '40px'
    },
    line: {
      fill: 'none',
      stroke: 'url(#lineGradient)',
      strokeWidth: 3,
      strokeLinecap: 'round'
    },
    gridLine: {
      stroke: '#e2e8f0',
      strokeWidth: 1
    },
    area: {
      fill: 'url(#areaGradient)',
      opacity: 0.3
    },
    dataPoint: {
      fill: '#667eea',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    dataPointHover: {
        r: 6,
        fill: '#764ba2'
    },
    xAxis: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0'
    },
    xAxisLabel: {
        fontSize: '0.8rem',
        color: '#718096',
        fontWeight: '500'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '1.1rem',
        color: '#667eea',
        fontWeight: '600'
    }
  };

  // Generate sample bar chart data from backend
  const generateBarChartData = () => {
    if (chartData.userGrowth && chartData.userGrowth.length > 0) {
      return chartData.userGrowth;
    }
    
    // Fallback to mock data if no backend data
    return [
      { label: 'Mon', value: analytics.totalUsers ? Math.round(analytics.totalUsers * 0.7) : 65 },
      { label: 'Tue', value: analytics.totalUsers ? Math.round(analytics.totalUsers * 0.8) : 75 },
      { label: 'Wed', value: analytics.totalUsers ? Math.round(analytics.totalUsers * 0.9) : 85 },
      { label: 'Thu', value: analytics.totalUsers || 95 },
      { label: 'Fri', value: analytics.totalUsers ? Math.round(analytics.totalUsers * 1.1) : 105 },
      { label: 'Sat', value: analytics.totalUsers ? Math.round(analytics.totalUsers * 1.05) : 98 },
      { label: 'Sun', value: analytics.totalUsers ? Math.round(analytics.totalUsers * 1.15) : 110 }
    ];
  };

  // Generate sample line chart data from backend
  const generateLineChartData = () => {
    if (chartData.applicationTrends && chartData.applicationTrends.length > 0) {
      return chartData.applicationTrends;
    }
    
    // Fallback to mock data if no backend data
    return [
      { label: 'Week 1', value: analytics.activeApplications ? Math.round(analytics.activeApplications * 0.6) : 45 },
      { label: 'Week 2', value: analytics.activeApplications ? Math.round(analytics.activeApplications * 0.8) : 60 },
      { label: 'Week 3', value: analytics.activeApplications || 75 },
      { label: 'Week 4', value: analytics.activeApplications ? Math.round(analytics.activeApplications * 1.2) : 90 }
    ];
  };

  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const barData = generateBarChartData();
  const lineData = generateLineChartData();
  
  const maxBarValue = Math.max(...barData.map(d => d.value));
  const maxLineValue = Math.max(...lineData.map(d => d.value));

  return (
    <div style={styles.analytics}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>📊 System Analytics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          style={styles.timeSelector}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div style={styles.grid}>
        <div 
          style={{
            ...styles.metricCard,
            ...(hoveredBar === 'users' ? styles.metricCardHover : {})
          }}
          onMouseEnter={() => setHoveredBar('users')}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div style={styles.metricCardBefore}></div>
          <h3 style={styles.metricTitle}>Total Users</h3>
          <div style={styles.metricValue}>{analytics.totalUsers || 0}</div>
          <div style={styles.metricChange}>+12% this week</div>
        </div>

        <div 
          style={{
            ...styles.metricCard,
            ...(hoveredBar === 'applications' ? styles.metricCardHover : {})
          }}
          onMouseEnter={() => setHoveredBar('applications')}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div style={styles.metricCardBefore}></div>
          <h3 style={styles.metricTitle}>Active Applications</h3>
          <div style={styles.metricValue}>{analytics.activeApplications || 0}</div>
          <div style={styles.metricChange}>+8% this week</div>
        </div>

        <div 
          style={{
            ...styles.metricCard,
            ...(hoveredBar === 'completion' ? styles.metricCardHover : {})
          }}
          onMouseEnter={() => setHoveredBar('completion')}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div style={styles.metricCardBefore}></div>
          <h3 style={styles.metricTitle}>Course Completion</h3>
          <div style={styles.metricValue}>{analytics.completionRate || 0}%</div>
          <div style={styles.metricChange}>+5% this week</div>
        </div>

        <div 
          style={{
            ...styles.metricCard,
            ...(hoveredBar === 'placements' ? styles.metricCardHover : {})
          }}
          onMouseEnter={() => setHoveredBar('placements')}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div style={styles.metricCardBefore}></div>
          <h3 style={styles.metricTitle}>Job Placements</h3>
          <div style={styles.metricValue}>{analytics.jobPlacements || 0}</div>
          <div style={styles.metricChange}>+15% this week</div>
        </div>
      </div>

      <div style={styles.chartsSection}>
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>User Growth</h4>
          <div style={styles.chartContainer}>
            <svg width="100%" height="100%" style={styles.barChart}>
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              {barData.map((data, index) => {
                const barHeight = (data.value / maxBarValue) * 160;
                return (
                  <g key={index} transform={`translate(${index * (100 / barData.length)}%, 0)`}>
                    <rect
                      width="80%"
                      height={barHeight}
                      y={200 - barHeight}
                      fill="url(#barGradient)"
                      style={{
                        ...styles.bar,
                        ...(hoveredBar === index ? styles.barHover : {})
                      }}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text 
                      x="50%" 
                      y="100%" 
                      dy="30" 
                      textAnchor="middle" 
                      style={styles.barLabel}
                    >
                      {data.label}
                    </text>
                    <text 
                      x="50%" 
                      y={200 - barHeight - 10} 
                      textAnchor="middle" 
                      style={styles.barValue}
                    >
                      {data.value}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Application Trends</h4>
          <div style={styles.chartContainer}>
            <svg width="100%" height="100%" style={styles.lineChart}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent, index) => (
                <line
                  key={index}
                  x1="0"
                  y1={`${percent}%`}
                  x2="100%"
                  y2={`${percent}%`}
                  style={styles.gridLine}
                />
              ))}
              
              {/* Area path */}
              <path
                d={`
                  M 0,${200 - (lineData[0].value / maxLineValue) * 160}
                  ${lineData.map((data, index) => 
                    `L ${(index / (lineData.length - 1)) * 100}%,${200 - (data.value / maxLineValue) * 160}`
                  ).join(' ')}
                  L 100%,200
                  L 0,200
                  Z
                `}
                style={styles.area}
              />
              
              {/* Line path */}
              <path
                d={`
                  M 0,${200 - (lineData[0].value / maxLineValue) * 160}
                  ${lineData.map((data, index) => 
                    `L ${(index / (lineData.length - 1)) * 100}%,${200 - (data.value / maxLineValue) * 160}`
                  ).join(' ')}
                `}
                style={styles.line}
              />
              
              {/* Data points */}
              {lineData.map((data, index) => (
                <circle
                  key={index}
                  cx={`${(index / (lineData.length - 1)) * 100}%`}
                  cy={200 - (data.value / maxLineValue) * 160}
                  r="4"
                  style={{
                    ...styles.dataPoint,
                    ...(hoveredPoint === index ? styles.dataPointHover : {})
                  }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>
            
            {/* X-axis labels */}
            <div style={styles.xAxis}>
              {lineData.map((data, index) => (
                <span key={index} style={styles.xAxisLabel}>
                  {data.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .time-selector:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .metric-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          
          .bar:hover {
            transform: scale(1.05);
            opacity: 0.9;
          }
          
          .data-point:hover {
            r: 6;
            fill: #764ba2;
          }
        `}
      </style>
    </div>
  );
};

export default AdminAnalytics;