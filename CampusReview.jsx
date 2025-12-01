import React, { useState, useEffect } from 'react';
import './CampusReview.css';

const CampusReview = ({ student, applications }) => {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampusReviews();
    checkUserReview();
  }, [student]);

  const fetchCampusReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/campus-reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        setReviews(sampleReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(sampleReviews);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/campus-reviews/user/${student.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserReview(data);
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const admittedInstitutes = applications
    .filter(app => app.status === 'accepted' || app.status === 'admitted' || app.status === 'approved')
    .map(app => ({
      id: app.institutionId || app.institution_id,
      name: app.institutionName || app.institution_name
    }));

  // Sample reviews with Sesotho names and campus life images
  const sampleReviews = [
    {
      id: 1,
      institute: "National University of Lesotho",
      rating: 4.5,
      title: "Excellent Academic Environment!",
      content: "The campus has a perfect blend of academic excellence and vibrant student life. The professors are incredibly supportive and the library resources are outstanding.",
      author: "Thabo Molapo",
      authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      date: "2024-01-15",
      verified: true,
      helpful: 24,
      tags: ["Academic Excellence", "Sports", "Library"],
      photos: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop"
      ]
    },
    {
      id: 2,
      institute: "Limkokwing University",
      rating: 4.2,
      title: "Modern and Tech-Savvy Campus",
      content: "Very modern campus with cutting-edge technology infrastructure. The creative environment encourages innovation and out-of-the-box thinking.",
      author: "Matseliso Mokoena",
      authorPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      date: "2024-01-10",
      verified: true,
      helpful: 18,
      tags: ["Technology", "Innovation", "Design"],
      photos: [
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop"
      ]
    },
    {
      id: 3,
      institute: "Botho University",
      rating: 4.0,
      title: "Great Career Opportunities",
      content: "The career services department is exceptional. They helped me secure an internship in my second year and provided excellent career guidance.",
      author: "Teboho Sephaka",
      authorPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      date: "2024-01-08",
      verified: true,
      helpful: 15,
      tags: ["Career Services", "Internships"],
      photos: [
        "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&h=300&fit=crop"
      ]
    },
  ];

  useEffect(() => {
    const currentStudentReview = sampleReviews.find(review => 
      review.author.toLowerCase().includes(student.name.split(' ')[0].toLowerCase())
    );
    if (currentStudentReview) {
      setUserReview(currentStudentReview);
    }
  }, [student]);

  const handleHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8081/api/campus-reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId: student.id })
      });
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: (review.helpful || 0) + 1 }
          : review
      ));
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleSortChange = (sortType) => {
    let sortedReviews = [...reviews];
    switch (sortType) {
      case 'highest':
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'most-helpful':
        sortedReviews.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      case 'newest':
      default:
        sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }
    setReviews(sortedReviews);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/campus-reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...reviewData,
          studentId: student.id,
          studentName: student.name,
          verified: true
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        const mockNewReview = {
          id: Date.now(),
          institute: reviewData.institute,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          author: reviewData.anonymous ? "Anonymous Student" : student.name,
          authorPhoto: reviewData.anonymous ? null : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
          date: new Date().toISOString().split('T')[0],
          verified: true,
          helpful: 0,
          tags: reviewData.tags,
          photos: []
        };
        
        setReviews(prev => [mockNewReview, ...prev]);
        setUserReview(mockNewReview);
        setShowReviewForm(false);
        alert('🎉 Thank you for sharing your experience!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const mockNewReview = {
        id: Date.now(),
        institute: reviewData.institute,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        author: reviewData.anonymous ? "Anonymous Student" : student.name,
        authorPhoto: reviewData.anonymous ? null : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        date: new Date().toISOString().split('T')[0],
        verified: true,
        helpful: 0,
        tags: reviewData.tags,
        photos: []
      };
      
      setReviews(prev => [mockNewReview, ...prev]);
      setUserReview(mockNewReview);
      setShowReviewForm(false);
      alert('🎉 Thank you for sharing your experience!');
    }
  };

  return (
    <div className="campus-review-section">
      <div className="review-header">
        <h2>🏛️ Campus Reviews</h2>
        <p>Real experiences from students across institutions</p>
      </div>

      {/* Quick Stats */}
      <div className="review-stats">
        <div className="stat-card">
          <span className="stat-number">{reviews.length}+</span>
          <span className="stat-label">Reviews</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {reviews.length > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) : '0.0'}
          </span>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {[...new Set(reviews.map(rev => rev.institute))].length}
          </span>
          <span className="stat-label">Institutes</span>
        </div>
      </div>

      {/* Student Welcome Section */}
      <div className="student-welcome-card">
        <div className="welcome-content">
          <h3>👋 Hello, {student.name}!</h3>
          <p>
            {userReview 
              ? `You've already shared your experience about ${userReview.institute}. Thank you!`
              : admittedInstitutes.length > 0 
                ? "Share your campus experience to help other students make informed decisions."
                : "Once you get admitted to an institute, you can share your experience here."
            }
          </p>
        </div>
        {admittedInstitutes.length > 0 && !userReview && (
          <button 
            className="write-review-btn primary"
            onClick={() => setShowReviewForm(true)}
          >
            ✍️ Share Your Experience
          </button>
        )}
      </div>

      {/* Review Controls */}
      <div className="review-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Reviews
          </button>
          <button 
            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            ✅ Verified
          </button>
          <button 
            className={`filter-btn ${filter === 'photos' ? 'active' : ''}`}
            onClick={() => setFilter('photos')}
          >
            📷 With Photos
          </button>
        </div>

        <div className="sort-options">
          <select onChange={(e) => handleSortChange(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="most-helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="reviews-grid">
        <div className="reviews-list">
          <h3>Student Experiences</h3>
          {loading ? (
            <div className="loading-reviews">
              <div className="loading-spinner"></div>
              <p>Loading student reviews...</p>
            </div>
          ) : (
            <ReviewList 
              reviews={reviews} 
              filter={filter}
              onHelpful={handleHelpful}
            />
          )}
        </div>

        <div className="review-sidebar">
          <InstituteRankings reviews={reviews} />
          <ReviewGuidelines />
          {userReview && <UserReviewCard review={userReview} />}
          
          {/* Student Photos Gallery - Updated with people on campus */}
          <div className="student-photos-section">
            <h4>📸 Campus Life</h4>
            <div className="student-photos-grid">
              
              <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=200&h=150&fit=crop" alt="Students studying together" />
              <img src="https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=200&h=150&fit=crop" alt="Students discussing in groups" />
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm 
          institutes={admittedInstitutes}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
          student={student}
        />
      )}
    </div>
  );
};

// Review List Component
const ReviewList = ({ reviews, filter, onHelpful }) => {
  const filteredReviews = reviews.filter(review => {
    if (filter === 'verified') return review.verified;
    if (filter === 'photos') return review.photos && review.photos.length > 0;
    return true;
  });

  if (filteredReviews.length === 0) {
    return (
      <div className="no-reviews">
        <div className="no-reviews-icon">📝</div>
        <h4>No reviews found</h4>
        <p>No reviews match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      {filteredReviews.map(review => (
        <ReviewCard 
          key={review.id} 
          review={review} 
          onHelpful={onHelpful}
        />
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review, onHelpful }) => {
  const [expanded, setExpanded] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.authorPhoto ? (
              <img src={review.authorPhoto} alt={review.author} className="avatar" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          <div className="reviewer-details">
            <span className="reviewer-name">{review.author}</span>
            {review.verified && <span className="verified-badge">✅ Verified</span>}
          </div>
        </div>
        <div className="review-meta">
          <span className="review-date">
            {new Date(review.date).toLocaleDateString()}
          </span>
          <span className="institute-name">{review.institute}</span>
        </div>
      </div>

      <div className="review-rating">
        <StarRating rating={review.rating} />
        <span className="rating-text">{review.rating}/5</span>
      </div>

      <h4 className="review-title">{review.title}</h4>
      
      <div className="review-content">
        <p className={expanded ? 'expanded' : 'collapsed'}>
          {review.content}
        </p>
        {review.content.length > 200 && (
          <button 
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {review.tags && review.tags.length > 0 && (
        <div className="review-tags">
          {review.tags.map(tag => (
            <span key={tag} className="review-tag">#{tag}</span>
          ))}
        </div>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="review-photos">
          <button 
            className="view-photos-btn"
            onClick={() => setShowPhotos(true)}
          >
            📷 View Photo
          </button>
          
          {showPhotos && (
            <PhotoGallery 
              photos={review.photos}
              onClose={() => setShowPhotos(false)}
            />
          )}
        </div>
      )}

      <div className="review-actions">
        <button 
          className="helpful-btn"
          onClick={() => onHelpful(review.id)}
        >
          👍 Helpful ({review.helpful || 0})
        </button>
        <button className="share-btn">📤 Share</button>
      </div>
    </div>
  );
};

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span 
          key={star}
          className={`star ${star <= rating ? 'filled' : 'empty'}`}
        >
          {star <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
};

// Review Form Component
const ReviewForm = ({ institutes, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState({
    institute: '',
    rating: 0,
    title: '',
    content: '',
    tags: [],
    anonymous: false
  });
  const [currentTag, setCurrentTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please provide a rating');
      return;
    }
    if (!formData.institute) {
      alert('Please select an institute');
      return;
    }

    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const popularTags = ["Campus Life", "Academic", "Facilities", "Faculty", "Sports"];

  return (
    <div className="review-form-modal">
      <div className="review-form-content">
        <div className="form-header">
          <h3>Share Your Campus Experience</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Institute *</label>
            <select 
              value={formData.institute}
              onChange={(e) => setFormData(prev => ({ ...prev, institute: e.target.value }))}
              required
            >
              <option value="">Select institute</option>
              {institutes.map(inst => (
                <option key={inst.id} value={inst.name}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`rating-star ${star <= formData.rating ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                >
                  {star <= formData.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder="Review title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Experience *</label>
            <textarea
              placeholder="Share your campus experience..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input">
              <input
                type="text"
                placeholder="Add tags..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag}>Add</button>
            </div>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.anonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
              />
              Post anonymously
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="submit-btn primary"
            >
              {submitting ? 'Submitting...' : 'Share Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Institute Rankings Component
const InstituteRankings = ({ reviews }) => {
  const instituteStats = reviews.reduce((acc, review) => {
    if (!acc[review.institute]) {
      acc[review.institute] = { totalRating: 0, count: 0 };
    }
    acc[review.institute].totalRating += review.rating;
    acc[review.institute].count += 1;
    return acc;
  }, {});

  const rankedInstitutes = Object.entries(instituteStats)
    .map(([name, stats]) => ({
      name,
      averageRating: (stats.totalRating / stats.count).toFixed(1),
      reviewCount: stats.count
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  return (
    <div className="institute-rankings">
      <h4>🏆 Top Institutes</h4>
      {rankedInstitutes.map((institute, index) => (
        <div key={institute.name} className="ranking-item">
          <span className="rank">#{index + 1}</span>
          <div className="institute-info">
            <span className="institute-name">{institute.name}</span>
            <StarRating rating={parseFloat(institute.averageRating)} />
            <span className="review-count">({institute.reviewCount})</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Review Guidelines Component
const ReviewGuidelines = () => (
  <div className="review-guidelines">
    <h4>📝 Guidelines</h4>
    <ul>
      <li>✓ Be honest and objective</li>
      <li>✓ Share specific experiences</li>
      <li>✓ Focus on facts</li>
      <li>✓ Respect privacy</li>
    </ul>
  </div>
);

// User Review Card Component
const UserReviewCard = ({ review }) => (
  <div className="user-review-card">
    <h4>Your Review</h4>
    <div className="user-review">
      <StarRating rating={review.rating} />
      <h5>{review.title}</h5>
      <p>{review.content.substring(0, 100)}...</p>
    </div>
  </div>
);

// Photo Gallery Component
const PhotoGallery = ({ photos, onClose }) => (
  <div className="photo-gallery-modal">
    <div className="gallery-content">
      <div className="gallery-header">
        <h4>Campus Photo</h4>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <div key={index} className="gallery-item">
            <img src={photo} alt={`Campus ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CampusReview;