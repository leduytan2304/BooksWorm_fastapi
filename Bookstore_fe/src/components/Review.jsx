import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';


import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import LoginPopup from './LoginPopup';

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
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    setIsLoggedIn(!!token);
  }, []);
  
  const handleSubmit = async (e) => {
    // e.preventDefault();
    
    if (!isLoggedIn) {
      setError('Please log in to submit a review');
      return;
    }
    
    if (!title.trim() || !content.trim() || rating === 0) {
      setError('Please fill in all fields and select a rating');
      return;
    }
      
    setError('');
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      const response = await fetch('http://localhost:8000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: bookId,
          title,
          content,
          rating
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit review');
      }
      
      // Clear form fields
      setTitle('');
      setContent('');
      setRating(0);
      
      // Notify parent component to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
    } catch (error) {
      setError(error.message || 'An error occurred while submitting your review');
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
    <div className="bg-white p-6  shadow-md border-black border-solid border-2">
      <h2 className="text-xl font-bold mb-4">Write a Review</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {!isLoggedIn ? (
        <p className="text-gray-600 mb-4">Please <span onClick={() => setShowLoginPopup(true)} className="text-blue-600 hover:underline cursor-pointer">log in</span> to write a review.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Add a title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="What's most important to know?"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select a rating star</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  {(hoveredRating || rating) >= star ? (
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Details please! Your review helps other shoppers.</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              placeholder="What did you like or dislike? What did you use this product for?"
              required
            ></textarea>
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
function ReviewsSection({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('newest_to_oldest');
  const [reviewsPerPage, setReviewsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [starFilter, setStarFilter] = useState(null);
  
  // Add these functions to your ReviewsSection component
  const getStarCount = (stars) => {
    return reviews.filter(review => parseInt(review.rating_star) === stars).length;
  };

  const filterByStars = (stars) => {
    setStarFilter(stars === starFilter ? null : stars);
    setCurrentPage(1);
  };
  
  // Fetch reviews from the API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Calculate offset based on current page and reviews per page
      const offset = (currentPage - 1) * reviewsPerPage;
      
      // Build the API URL with query parameters
      let url = `http://localhost:8000/api/reviews/${bookId}?sort_by=${sortOption}&limit=${reviewsPerPage}&offset=${offset}`;
      
      // Add star filter if selected
      if (starFilter) {
        url += `&rating_star=${starFilter}`;
      }
      
      console.log('Fetching reviews with URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      
      // Update state with the response data
      setReviews(data.reviews || []);
      setTotalReviews(data.total_count);
      setAverageRating(data.average_rating);
      
    } catch (error) {
      setError('Error loading reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch reviews when component mounts or when dependencies change
  useEffect(() => {
    if (bookId) {
      fetchReviews();
    }
  }, [bookId, currentPage, sortOption, reviewsPerPage, starFilter]);
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setCurrentPage(1);
  };
  
  // Handle reviews per page change
  const handleReviewsPerPageChange = (event) => {
    setReviewsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };
  
  // Handle review submission
  const handleReviewSubmitted = () => {
    fetchReviews();
  };
  
  // Star rating display component
  const StarRating = ({ rating }) => {
    return (
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
  };
  
  return (
    <div className=" bg-white shadow-md  border-black border-solid border-2">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Customer Reviews {totalReviews > 0 && <span className="text-sm font-normal text-gray-500">
          (Filter By {starFilter ? ` ${starFilter} stars` : sortOption === 'newest_to_oldest' ? 'newest to oldest' : 'oldest to newest'})
        </span>}</h2>
        
        {/* Rating Summary */}
        <div className="mt-4">
          <div className="flex items-center">
            <div className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</div>
            <div>
              {/* <div className="flex">
                <StarRating rating={Math.round(averageRating)} />
              </div> */}
              <p className='text-lg text-black'>Star</p> 
              <div className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</div>
            </div>
          </div> 
          
          {/* Star Distribution */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[5, 4, 3, 2, 1].map(stars => (
              <button 
                key={stars}
                className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 ${
                  starFilter === stars ? 'bg-blue-100 border-blue-300' : ''
                }`}
                onClick={() => filterByStars(stars)}
              >
                {stars} star ({getStarCount(stars)})
              </button>
            ))}
            {starFilter && (
              <button 
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 text-red-500"
                onClick={() => setStarFilter(null)}
              >
                Clear filter
              </button>
            )}
          </div>
          
          {/* Showing X-Y of Z reviews */}
          <div className="mt-4 text-sm text-gray-500">
            Showing {((currentPage - 1) * reviewsPerPage) + 1}-{Math.min(currentPage * reviewsPerPage, totalReviews)} of {totalReviews} reviews
          </div>
          
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
              <p className="text-gray-700 my-2">{review.review_details}</p>
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
  return (
    <div className="flex flex-col lg:flex-row gap-16 shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-10 gap-8 w-full">
        <div className="md:col-span-3">
          <ReviewsSection bookId={bookId} />
        </div>
        <div className="md:col-span-1">
          <ReviewForm bookId={bookId} onReviewSubmitted={() => {}} />
        </div>
      </div>
    </div>
  );
}
