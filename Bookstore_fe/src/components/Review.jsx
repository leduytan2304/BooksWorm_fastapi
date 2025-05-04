import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import axios from 'axios';
import LoginPopup from './LoginPopup';
import Notification from './PopUpNotification';

// Review Item Component to display individual reviews
// function ReviewItem({ review }) {
//   return (
//     <div className="border-b border-gray-200 py-4">
//       <div className="flex justify-between mb-2">
//         <h3 className="text-lg font-semibold">{review.review_title}</h3>
//         <div className="flex">
//           {[...Array(5)].map((_, i) => (
//             <StarIcon 
//               key={i} 
//               className={`h-5 w-5 ${i < parseInt(review.rating_star) ? 'text-yellow-400' : 'text-gray-300'}`}
//             />
//           ))}
//         </div>
//       </div>
//       <p className="text-gray-700 mb-2">{review.review_details}</p>
//       <div className="text-sm text-gray-500">
//         {review.user_name || 'Anonymous'} - {new Date(review.review_date).toLocaleDateString()}
//       </div>
//     </div>
//   );
// }

// Review Form Component
function ReviewForm({ bookId, onReviewSubmitted }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(1);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // Add notification state
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });
  
  // Show notification helper function
  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  // Close notification helper function
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('Please log in to submit a review');
      return;
    }
    
    if (!title.trim() || rating === 0) {
      setError('Please fill in the title and select a rating');
      return;
    }
    
    if (content.length > 120) {
      setError('Review details must be 120 characters or less');
      return;
    }
      
    setError('');
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      const response = await axios.post('http://localhost:8000/api/reviews', {
        book_id: bookId,
        title,
        content,
        rating
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success notification
      showNotification('Your review has been submitted successfully!', 'success');
      
      // Clear form fields
      setTitle('');
      setContent('');
      setRating(0);
      
      // Notify parent component to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'An error occurred while submitting your review';
      setError(errorMessage);
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessfulLogin = () => {
    // Force a complete browser refresh
    window.location.href = window.location.href;
  };
  
  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">Write a Review</h2>
      
      {/* Notification component */}
      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        duration={3000}
      />
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {!isLoggedIn ? (
        <p className="text-gray-600 mb-4">Please <span onClick={() => setShowLoginPopup(true)} className="text-blue-600 hover:underline cursor-pointer">log in</span> to write a review.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Write a headline for your review"
            />
            {title && title.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/120 characters
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="content">
              Review Details 
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={120}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows="4"
              placeholder="Write your review (optional)"
            ></textarea>
            {content && content.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {content.length}/120 characters
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select a rating star</label>
            <div className="relative">
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded appearance-none bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0" disabled>Select a rating</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars </option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            {/* Display selected rating as stars */}
         
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
       <LoginPopup 
              isOpen={showLoginPopup} 
              onClose={() => setShowLoginPopup(false)} 
              onLogin={handleSuccessfulLogin}
            />
    </div>
  );
}

// Reviews list with sorting options
function ReviewsSection({ bookId, refreshTrigger }) {
  // State for reviews data
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalUnfilteredReviews, setTotalUnfilteredReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  
  // State for UI controls
  const [starFilter, setStarFilter] = useState(null);
  const [sortOption, setSortOption] = useState('newest_to_oldest');
  const [reviewsPerPage, setReviewsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get count of reviews for each star rating
  const getStarCount = (stars) => {
    return allReviews.filter(review => parseInt(review.rating_star) === stars).length;
  };

  // Handle filter changes
  const handleStarFilterChange = (stars) => {
    // If clicking the same star, clear the filter
    if (stars === starFilter) {
      setStarFilter(null);
    } else {
      setStarFilter(stars);
    }
    // Always reset to first page when changing filters
    setCurrentPage(1);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setStarFilter(null);
    setCurrentPage(1);
  };
  
  // Handle sort option change
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setCurrentPage(1);
  };
  
  // Handle reviews per page change
  const handleReviewsPerPageChange = (event) => {
    setReviewsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };
  
  // Fetch all reviews (for star counts and total count)
  useEffect(() => {
    const fetchAllReviews = async () => {
      if (!bookId) return;
      
      try {
        const response = await axios.get(`http://localhost:8000/api/reviews/${bookId}`, {
          params: {
            limit: 1000,
            offset: 0
          }
        });
        
        setAllReviews(response.data.reviews || []);
        setTotalUnfilteredReviews(response.data.total_count || 0);
      } catch (error) {
        console.error('Error fetching all reviews:', error);
      }
    };
    
    fetchAllReviews();
  }, [bookId, refreshTrigger]); // Add refreshTrigger as dependency
  
  // Fetch paginated and filtered reviews
  const fetchReviews = async () => {
    if (!bookId) return;
    
    setLoading(true);
    
    try {
      // Calculate offset based on current page and reviews per page
      const offset = (currentPage - 1) * reviewsPerPage;
      
      // Build the API URL with query parameters
      let url = `http://localhost:8000/api/reviews/${bookId}`;
      
      // Create params object for axios
      const params = {
        sort_by: sortOption,
        limit: reviewsPerPage,
        offset: offset
      };
      
      // Add star filter if selected
      if (starFilter) {
        params.rating_star = starFilter;
      }
      
      console.log('Fetching reviews with URL:', url);
      
      const response = await axios.get(url, { params });
      
      // Update state with the response data
      setReviews(response.data.reviews || []);
      setTotalReviews(response.data.total_count);
      setAverageRating(response.data.average_rating);
    } catch (error) {
      setError('Error loading reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch reviews when dependencies change
  useEffect(() => {
    fetchReviews();
  }, [bookId, currentPage, sortOption, reviewsPerPage, starFilter, refreshTrigger]); // Add refreshTrigger as dependency
  
  // Star rating display component
  const StarRating = ({ rating }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}>
          <StarIcon 
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        </span>
      ))}
    </div>
  );

  // Calculate pagination values
  const startItem = totalReviews === 0 ? 0 : ((currentPage - 1) * reviewsPerPage) + 1;
  const endItem = Math.min(currentPage * reviewsPerPage, totalReviews);
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  return (
    <div className="">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">
          Customer Reviews 
          {totalReviews > 0 && (
            <span className="text-sm font-normal ml-5  text-gray-500">
              (Filter By {starFilter ? ` ${starFilter} stars` : sortOption === 'newest_to_oldest' ? 'newest to oldest' : 'oldest to newest'})
            </span>
          )}
        </h2>
        
        {/* Rating Summary */}
        <div className="mt-4">
          <div className="flex items-center">
            <div className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</div>
            <div>
              <p className='text-lg text-black'>Star</p> 
              <div className="text-sm text-gray-500">
                ({totalUnfilteredReviews} {totalUnfilteredReviews === 1 ? 'review' : 'reviews'})
              </div>
            </div>
          </div> 
          
          {/* Star Distribution */}
          <div className="flex flex-wrap gap-2 mt-3">
            <div 
              className={`cursor-pointer hover:underline ${starFilter === null ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
              onClick={clearAllFilters}
            >
              All ({totalUnfilteredReviews})
            </div>
            {[5, 4, 3, 2, 1].map(stars => (
              <div 
                key={stars}
                className={`cursor-pointer hover:underline ${starFilter === stars ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
                onClick={() => handleStarFilterChange(stars)}
              >
               | {stars} star ({getStarCount(stars)})
              </div>
            ))}
          </div>
          
          {/* Showing X-Y of Z reviews */}
          {totalReviews > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {startItem}-{endItem} of {totalReviews} reviews
            </div>
          )}
          
          {/* Sort options */}
          <div className="flex flex-wrap gap-2 mt-2">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="px-3 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="newest_to_oldest">Sort by date: newest to oldest</option>
              <option value="oldest_to_newest">Sort by date: oldest to newest</option>
            </select>

            <select
              value={reviewsPerPage}
              onChange={handleReviewsPerPageChange}
              className="px-3 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="5">Show 5</option>
              <option value="15">Show 15</option>
              <option value="20">Show 20</option>
              <option value="25">Show 25</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <p className="text-center py-4">Loading reviews...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-4">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-600 py-4">No reviews yet. Be the first to review this book!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id || review._id} className="p-6">
              <h3 className="text-lg font-semibold">{review.review_title} <span className="text-sm font-normal">({review.rating_star} stars)</span></h3>
              <p className="text-gray-700 my-2">
                {review.review_details && review.review_details.length > 30 
                  ? review.review_details.substring(0, 30) + '...' 
                  : review.review_details}
              </p>
              <div className="text-sm text-gray-500">
               {new Date(review.review_date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalReviews > 0 && (
        <div className="flex justify-center p-4 border-t border-gray-200">
          <nav className="flex items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-l text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            
            {[...Array(Math.ceil(totalReviews / reviewsPerPage))].map((_, i) => {
              // Only show a window of 5 pages centered around current page
              if (i < currentPage - 3 && i !== 0) return null;
              if (i > currentPage + 1 && i !== Math.ceil(totalReviews / reviewsPerPage) - 1) return null;
              
              const pageNum = i + 1;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border-t border-b border-gray-300 text-sm ${
                    currentPage === pageNum ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalReviews / reviewsPerPage)))}
              disabled={currentPage === Math.ceil(totalReviews / reviewsPerPage)}
              className="px-3 py-1 border border-gray-300 rounded-r text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

// Export the component to be used in the ProductDetail component
export default function ProductReviews({ bookId }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleReviewSubmitted = () => {
    // Increment refresh trigger to cause ReviewsSection to re-fetch data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-10 overflow-hidden">
      <div className="flex-[3] bg-white p-6 border-solid border-gray-400 rounded-lg border-2">
        <ReviewsSection bookId={bookId} refreshTrigger={refreshTrigger} />
      </div>
      <div className="flex-[1] bg-gray-50 p-6 border-solid border-gray-400 rounded-lg border-2">
        <ReviewForm bookId={bookId} onReviewSubmitted={handleReviewSubmitted} />
      </div>
    </div>
  );
}
