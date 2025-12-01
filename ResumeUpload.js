import React, { useState } from 'react';
import { resumeAnalyzer } from '../../../services/ai/resumeParser';
import './ResumeAnalyzer.css';

const ResumeUpload = ({ student, onAnalysisComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      const text = await readFileAsText(file);
      const analysisResult = await resumeAnalyzer.analyzeResume(text);
      
      setAnalysis(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (error) {
      console.error('Error analyzing resume:', error);
    } finally {
      setUploading(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileUpload(file);
    }
  };

  return (
    <div className="resume-analyzer">
      <div className="analyzer-header">
        <h3>📄 AI Resume Analyzer</h3>
        <p>Get instant feedback on your resume</p>
      </div>

      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="uploading-state">
            <div className="spinner"></div>
            <p>Analyzing your resume...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📤</div>
            <p>Drag & drop your resume (.txt) here</p>
            <p className="upload-subtext">or</p>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="file-input"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="browse-btn">
              Browse Files
            </label>
          </>
        )}
      </div>

      {analysis && (
        <div className="analysis-results">
          <div className="score-section">
            <h4>Resume Score: {analysis.score}/100</h4>
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ width: `${analysis.score}%` }}
              ></div>
            </div>
          </div>

          <div className="skills-section">
            <h5>Skills Detected:</h5>
            <div className="skills-list">
              {analysis.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          <div className="suggestions-section">
            <h5>Improvement Suggestions:</h5>
            <ul>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;