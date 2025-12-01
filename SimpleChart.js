import React from 'react';

export const BarChart = ({ data, colors }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div className="bar-label">{item.label}</div>
          <div className="bar-track">
            <div 
              className="bar-fill"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: colors[index % colors.length]
              }}
            >
              <span className="bar-value">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PieChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="pie-chart">
      <div className="pie-visual">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div 
              key={index}
              className="pie-segment" 
              style={{
                backgroundColor: colors[index % colors.length],
                width: `${percentage}%`
              }}
            ></div>
          );
        })}
      </div>
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: colors[index] }}
            ></span>
            <span>{item.label} ({Math.round(percentage)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};