import React, { useState, useEffect } from 'react';
import { recommendationEngine } from '../../../services/ai/recommendationEngine';
import './AISuggestions.css';

const AISuggestions = ({ student, courses }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student && courses.length > 0) {
      const studentProfile = {
        interests: student.interests || ['Technology', 'Business'],
        credits: student.credits || 0,
        performance: student.performance || 75,
        careerGoals: student.careerGoals || ['Software Developer', 'Business Analyst']
      };

      const recommendedCourses = recommendationEngine.getCourseRecommendations(
        studentProfile, 
        courses
      );
      
      setRecommendations(recommendedCourses);
      setLoading(false);
    }
  }, [student, courses]);

  if (loading) {
    return (
      <div className="ai-suggestions-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your profile for course recommendations...</p>
      </div>
    );
  }

  return (
    <div className="ai-suggestions">
      <div className="suggestions-header">
        <h3>🎯 AI Course Recommendations</h3>
        <p>Personalized suggestions based on your profile</p>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map((course, index) => (
          <div key={course.id} className="recommendation-card">
            <div className="match-badge">
              {course.matchScore}% Match
            </div>
            <h4>{course.name}</h4>
            <p className="institution">{course.institution}</p>
            <p className="description">{course.description}</p>
            
            <div className="reasons">
              <strong>Why this course:</strong>
              <ul>
                {course.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
            
            <button className="apply-btn">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;