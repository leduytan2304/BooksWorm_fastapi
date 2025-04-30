import React, { useState, useEffect } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import ProductReviews from './Review';
import Notification from './PopUpNotification';
import LoginPopup from './LoginPopup';



export default function ProductDetail(props) {
  const [quantity, setQuantity] = useState(1);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [userId, setUserId] = useState(null);
  const { id: bookId } = useParams();
  const location = useLocation();
  
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
  
  // Check if user is logged in and fetch user ID
  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchUserId(token);
    }
  }, []);
  
  // Function to fetch user ID
  const fetchUserId = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserId(userData.id);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  // Use props.bookId if provided directly, otherwise use location state or URL param
  // const bookId = props.bookId || location.state?.bookId || id;
  console.log('bookId:', bookId); // Debugging line to check the bookId value
  console.log('book:', book); // Debugging line to check the bookId value
  const addToCart = () => {
    if (!book) return;
    
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowLoginPopup(true);
      return;
    }
    
    // Check if we have the user ID
    if (!userId) {
      console.error('User ID not available');
      showNotification('User ID not available', 'error');
      return;
    }
    
    // Get existing cart data from localStorage or initialize empty object
    let cartData = JSON.parse(localStorage.getItem('cart') || '{}');
    
    // Initialize user's cart if it doesn't exist
    if (!cartData[userId]) {
      cartData[userId] = {};
    }
    
    // Check if this book is already in user's cart
    if (cartData[userId][bookId]) {
      // Update quantity if book already in cart
      if ((cartData[userId][bookId].quantity + quantity) > 8) {
        showNotification('You cannot purchase more than 8 copies of this book', 'warning');
      } else {
        cartData[userId][bookId].quantity += quantity;
        showNotification(`Added ${quantity} copy/copies of "${book.book_title}" to your cart!`);
      }
    } else {
      // Add new item to cart
      cartData[userId][bookId] = {
        quantity: quantity,
        author: book.author.author_name
      };
      showNotification(`Added ${quantity} copy/copies of "${book.book_title}" to your cart!`);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartData));
  };
  
  useEffect(() => {
    if (bookId) {
      // Fetch book details using axios instead of fetch
      axios.get(`http://localhost:8000/api/books/${bookId}`)
        .then(response => {
          setBook(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching book details:', error);
          setLoading(false);
        });
    }
  }, [bookId]);
  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity< 8 ? prevQuantity + 1 : 8);
  };

  const decreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity > 1 ? prevQuantity - 1 : 1);
  };

  // Handle successful login
  const handleSuccessfulLogin = async () => {
    const token = Cookies.get('token')
    if(token){
      setIsLoggedIn(true)
      await fetchUserId(token);
      addToCart()
      window.location.reload()
    }
    
    else{
      setIsLoggedIn(false)
    }
    // Optionally add to cart automatically after login
  };

  return (
    <div className="container mx-auto py-8 px-6 md:px-12 lg:px-20 my-12 max-w-6xl mt-20">
      {/* Notification component */}
      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        duration={3000}
      />
      
      {/* Login popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        onLogin={handleSuccessfulLogin}
      />
      <div className="flex flex-col lg:flex-row gap-6 shadow-lg rounded-lg overflow-hidden">
        {/* Left Column - Book Details */}
        <div className="flex-[3] bg-white p-6 rounded-l-lg"> 
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Image and Author */}
            <div className="md:flex-[1]">
              <div className="mb-4 bg-gray-50 p-2 rounded-md shadow-sm flex items-center justify-center">
                <img 
                  className="h-64 object-contain" 
                  src={book?.book_cover_photo}
                  alt="Book Cover" 
                />
              </div>
              <p className="text-gray-600 text-sm font-medium">By (author): <span className="text-blue-700">{book?.author.author_name}</span></p>
            </div>
            
            {/* Book Information */}
            <div className="md:flex-[2]">
              <h1 className="text-3xl font-bold mb-3 text-gray-800">{book?.book_title}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-gray-300">★</span>
                </div>
                <span className="ml-2 text-sm text-gray-600">(24 reviews)</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                {book?.book_summary}
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Fiction</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Fantasy</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Adventure</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Purchase Box */}
        <div className="flex-[1] bg-gray-50 p-6 rounded-r-lg border-l border-gray-200">
          <div>
            {/* Price Section */}
            <div className="flex items-end gap-3 pb-5 border-b border-gray-200">
              {book?.discounts?.[0]?.discount_price ? (
                <>
                  <h2 className="text-lg text-gray-500 line-through">${book?.book_price}</h2>
                  <h1 className="text-3xl font-bold text-blue-700">${book?.discounts?.[0]?.discount_price}</h1>
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                    {((1 - (book?.discounts?.[0]?.discount_price / book?.book_price)) * 100).toFixed(1)}% OFF
                  </span>
                </>
              ) : (
                <h1 className="text-3xl font-bold text-blue-700">${book?.book_price}</h1>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="my-5">
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-medium">In Stock</span>
            </div>
            
            {/* Quantity Selector - Now with working buttons */}
            <div className="mt-6">
              <p className="text-gray-700 font-medium mb-2">Quantity</p>
              <div className="flex items-center">
                <button 
                  onClick={decreaseQuantity}
                  className="border border-gray-300 h-10 w-10 flex items-center justify-center rounded-l bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <MinusIcon className="h-5 w-5 text-gray-700" />
                </button>
                <div className="flex-1 border-t border-b border-gray-300 h-10 px-4 flex items-center justify-center bg-white font-medium">
                  {quantity}
                </div>
                <button 
                  onClick={increaseQuantity}
                  className="border border-gray-300 h-10 w-10 flex items-center justify-center rounded-r bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
            
            {/* Total Price Calculation */}
            <div className="mt-4 text-right">
              <p className="text-sm text-gray-600">
                Total: <span className="text-lg font-bold text-blue-700">
                  ${((book?.discounts?.[0]?.discount_price || book?.book_price) * quantity).toFixed(2)}
                </span>
              </p>
            </div>
            
            {/* Add to Cart Button */}
            <button onClick={addToCart} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md flex items-center justify-center transition-colors duration-300">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Add to Cart
            </button>
            
            {/* Shipping Information */}
            {/* <div className="mt-6 text-sm text-gray-600">
              <p className="flex items-center"><span className="mr-2">📦</span> Free shipping on orders over $35</p>
              <p className="flex items-center mt-2"><span className="mr-2">🔄</span> 30-day return policy</p>
            </div> */}
          </div>
        </div>
      </div>
      {book && <ProductReviews bookId={bookId} />}

    </div>
  );
}
