import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TranscriptsPage.css';

const TranscriptsPage = ({ student }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [transcripts, setTranscripts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (student?.id) {
      fetchStudentDocuments();
    }
  }, [student]);

  const fetchStudentDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8081/api/students/${student.id}`);
      if (response.ok) {
        const studentData = await response.json();
        setTranscripts(studentData.profile?.transcripts || []);
        setCertificates(studentData.profile?.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, JPEG, or PNG files only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('transcript', file);
      formData.append('studentId', student.id);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`http://localhost:8081/api/students/${student.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        setTranscripts(prev => [...prev, {
          id: Date.now(),
          name: file.name,
          type: 'transcript',
          uploadDate: new Date().toISOString(),
          status: 'verified',
          url: URL.createObjectURL(file)
        }]);
        
        alert('Transcript uploaded successfully!');
        event.target.value = '';
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload transcript. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCertificateUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, JPEG, or PNG files only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('studentId', student.id);

      const response = await fetch(`http://localhost:8081/api/students/${student.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setCertificates(prev => [...prev, {
          id: Date.now(),
          name: file.name,
          type: 'certificate',
          uploadDate: new Date().toISOString(),
          status: 'pending',
          url: URL.createObjectURL(file)
        }]);
        
        alert('Certificate uploaded successfully!');
        event.target.value = '';
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId, type) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      if (type === 'transcript') {
        setTranscripts(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        setCertificates(prev => prev.filter(doc => doc.id !== documentId));
      }
      
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document.');
    }
  };

  const downloadDocument = (document) => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
  };

  const DocumentCard = ({ document, type }) => (
    <div className="document-card">
      <div className="document-icon">
        {document.type === 'transcript' ? '📊' : '🏆'}
      </div>
      <div className="document-info">
        <h4>{document.name}</h4>
        <div className="document-meta">
          <span className={`status status-${document.status}`}>
            {document.status}
          </span>
          <span className="upload-date">
            Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="document-actions">
        <button 
          className="action-btn download"
          onClick={() => downloadDocument(document)}
          title="Download"
        >
          ⬇️
        </button>
        <button 
          className="action-btn delete"
          onClick={() => deleteDocument(document.id, type)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  if (loading && uploadProgress === 0) {
    return (
      <div className="transcripts-loading">
        <div className="loading-spinner"></div>
        <p>Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="transcripts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Academic Documents</h1>
          <p>Upload and manage your transcripts and certificates for job applications</p>
        </div>
        <div className="header-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/students/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="transcripts-nav">
        <button 
          className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload Documents
        </button>
        <button 
          className={`nav-tab ${activeTab === 'transcripts' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcripts')}
        >
          📊 Transcripts ({transcripts.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          🏆 Certificates ({certificates.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          📈 Verification Status
        </button>
      </div>

      <div className="transcripts-content">
        {activeTab === 'upload' && (
          <div className="upload-tab">
            <div className="upload-grid">
              <div className="upload-card">
                <div className="upload-header">
                  <div className="upload-icon">📊</div>
                  <div>
                    <h3>Upload Academic Transcript</h3>
                    <p>Official transcript from your institution</p>
                  </div>
                </div>
                
                <div className="upload-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    <li>✅ Official transcript from your institution</li>
                    <li>✅ PDF, JPEG, or PNG format</li>
                    <li>✅ Maximum file size: 5MB</li>
                    <li>✅ Must be clear and readable</li>
                  </ul>
                </div>

                <div className="upload-area">
                  {uploadProgress > 0 ? (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span>{uploadProgress}% uploaded</span>
                    </div>
                  ) : (
                    <>
                      <div className="upload-placeholder">
                        <div className="upload-icon-large">📄</div>
                        <p>Drag & drop your transcript here</p>
                        <span>or</span>
                      </div>
                      <label className="file-input-label">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleTranscriptUpload}
                          disabled={loading}
                        />
                        Browse Files
                      </label>
                    </>
                  )}
                </div>

                {transcripts.length > 0 && (
                  <div className="upload-preview">
                    <h4>Latest Upload:</h4>
                    <DocumentCard document={transcripts[transcripts.length - 1]} type="transcript" />
                  </div>
                )}
              </div>

              <div className="upload-card">
                <div className="upload-header">
                  <div className="upload-icon">🏆</div>
                  <div>
                    <h3>Upload Certificates</h3>
                    <p>Additional certificates and achievements</p>
                  </div>
                </div>
                
                <div className="upload-requirements">
                  <h4>Accepted Certificates:</h4>
                  <ul>
                    <li>🎯 Professional certifications</li>
                    <li>🎯 Workshop completion certificates</li>
                    <li>🎯 Training program certificates</li>
                    <li>🎯 Awards and achievements</li>
                  </ul>
                </div>

                <div className="upload-area">
                  <div className="upload-placeholder">
                    <div className="upload-icon-large">📜</div>
                    <p>Drag & drop your certificate here</p>
                    <span>or</span>
                  </div>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificateUpload}
                      disabled={loading}
                    />
                    Browse Files
                  </label>
                </div>

                {certificates.length > 0 && (
                  <div className="certificate-count">
                    <p>You have uploaded {certificates.length} certificate(s)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="upload-tips">
              <h3>📝 Upload Tips</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>📸 Clear Images</h4>
                  <p>Ensure documents are clear and all text is readable</p>
                </div>
                <div className="tip-card">
                  <h4>🔒 Secure Files</h4>
                  <p>Your documents are stored securely and only shared with employers you apply to</p>
                </div>
                <div className="tip-card">
                  <h4>⚡ Fast Processing</h4>
                  <p>Documents are typically verified within 24-48 hours</p>
                </div>
                <div className="tip-card">
                  <h4>🎯 Better Matches</h4>
                  <p>Complete documents improve your job matching score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcripts' && (
          <div className="documents-tab">
            <div className="tab-header">
              <h2>Your Transcripts</h2>
              <button 
                className="primary-btn"
                onClick={() => setActiveTab('upload')}
              >
                📤 Upload New Transcript
              </button>
            </div>

            {transcripts.length > 0 ? (
              <div className="documents-grid">
                {transcripts.map(transcript => (
                  <DocumentCard 
                    key={transcript.id} 
                    document={transcript} 
                    type="transcript" 
                  />
                ))}
              </div>
            ) : (
              <div className="no-documents">
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No Transcripts Uploaded</h3>
                  <p>Upload your academic transcript to start applying for jobs</p>
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveTab('upload')}
                  >
                    Upload Your First Transcript
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="documents-tab">
            <div className="tab-header">
              <h2>Your Certificates</h2>
              <button 
                className="primary-btn"
                onClick={() => setActiveTab('upload')}
              >
                🏆 Upload New Certificate
              </button>
            </div>

            {certificates.length > 0 ? (
              <div className="documents-grid">
                {certificates.map(certificate => (
                  <DocumentCard 
                    key={certificate.id} 
                    document={certificate} 
                    type="certificate" 
                  />
                ))}
              </div>
            ) : (
              <div className="no-documents">
                <div className="empty-state">
                  <div className="empty-icon">🏆</div>
                  <h3>No Certificates Uploaded</h3>
                  <p>Add certificates to enhance your profile and job applications</p>
                  <button 
                    className="primary-btn"
                    onClick={() => setActiveTab('upload')}
                  >
                    Upload Your First Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <div className="status-tab">
            <div className="verification-status">
              <h2>Document Verification Status</h2>
              
              <div className="status-cards">
                <div className="status-card">
                  <h3>Transcript Verification</h3>
                  <div className="status-indicator">
                    {transcripts.length > 0 ? (
                      <>
                        <span className={`status-badge ${transcripts[0]?.status}`}>
                          {transcripts[0]?.status === 'verified' ? '✅ Verified' : '⏳ Pending'}
                        </span>
                        <p>Last uploaded: {new Date(transcripts[0]?.uploadDate).toLocaleDateString()}</p>
                      </>
                    ) : (
                      <>
                        <span className="status-badge missing">❌ Missing</span>
                        <p>No transcript uploaded</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="status-card">
                  <h3>Certificates Status</h3>
                  <div className="status-indicator">
                    <span className="status-badge info">
                      📊 {certificates.length} Uploaded
                    </span>
                    <p>{certificates.filter(c => c.status === 'verified').length} verified</p>
                  </div>
                </div>

                <div className="status-card">
                  <h3>Profile Completeness</h3>
                  <div className="completeness-meter">
                    <div className="meter-bar">
                      <div 
                        className="meter-fill"
                        style={{ 
                          width: `${transcripts.length > 0 ? 80 : 40}%` 
                        }}
                      ></div>
                    </div>
                    <span className="completeness-score">
                      {transcripts.length > 0 ? '80%' : '40%'}
                    </span>
                  </div>
                  <p>Upload transcript to reach 80% completeness</p>
                </div>
              </div>

              <div className="impact-section">
                <h3>📈 Impact on Job Applications</h3>
                <div className="impact-grid">
                  <div className="impact-card positive">
                    <h4>✅ With Complete Documents</h4>
                    <ul>
                      <li>Higher job matching score</li>
                      <li>Faster application processing</li>
                      <li>Better visibility to employers</li>
                      <li>Increased interview chances</li>
                    </ul>
                  </div>
                  <div className="impact-card negative">
                    <h4>❌ Without Complete Documents</h4>
                    <ul>
                      <li>Lower matching accuracy</li>
                      <li>Delayed application review</li>
                      <li>Limited job opportunities</li>
                      <li>Manual verification required</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptsPage;