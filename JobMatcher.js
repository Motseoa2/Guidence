import React, { useState, useEffect } from 'react';
import './JobMatcher.css';

const JobMatcher = ({ student, resumeAnalysis }) => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchedJobs();
  }, [student, resumeAnalysis]);

  const fetchMatchedJobs = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/student/${student.id}/matched-jobs`);
      if (response.ok) {
        const jobs = await response.json();
        setMatchedJobs(jobs);
      }
    } catch (error) {
      console.error('Failed to fetch matched jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (job, studentSkills) => {
    const requiredSkills = job.requiredSkills || [];
    const studentSkillSet = new Set(studentSkills);
    const matchingSkills = requiredSkills.filter(skill => studentSkillSet.has(skill));
    return Math.round((matchingSkills.length / requiredSkills.length) * 100);
  };

  if (loading) {
    return <div className="loading">Finding perfect job matches...</div>;
  }

  return (
    <div className="job-matcher">
      <h3>💼 AI Job Matches</h3>
      <p>Jobs that match your skills and career goals</p>
      
      <div className="jobs-grid">
        {matchedJobs.map((job, index) => {
          const matchScore = calculateMatchScore(job, resumeAnalysis?.skills || []);
          
          return (
            <div key={job.id} className="job-card">
              <div className="match-badge" style={{
                background: matchScore > 80 ? '#4CAF50' : matchScore > 60 ? '#FF9800' : '#F44336'
              }}>
                {matchScore}% Match
              </div>
              
              <h4>{job.title}</h4>
              <p className="company">{job.company}</p>
              <p className="location">{job.location}</p>
              <p className="salary">{job.salary}</p>
              
              <div className="job-skills">
                <strong>Required Skills:</strong>
                <div className="skills-list">
                  {job.requiredSkills?.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className={`skill-tag ${(resumeAnalysis?.skills || []).includes(skill) ? 'matched' : 'missing'}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="apply-job-btn">Apply Now</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobMatcher;