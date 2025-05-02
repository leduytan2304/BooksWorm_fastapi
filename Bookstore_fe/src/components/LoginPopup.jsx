
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
export default  function LoginPopup({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // Backend expects 'username' for email
      formData.append('password', password);
      
      const response = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      // Save token to cookies
      Cookies.set('token', data.access_token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Save user email to cookies
      Cookies.set('userEmail', data.user_email || email, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Fetch user data to get user ID
      const userResponse = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userId = userData.id;
        
        // Merge guest cart with user cart
        const guestCartData = JSON.parse(localStorage.getItem('guestCart') || '{}');
        if (Object.keys(guestCartData).length > 0) {
          // Get existing user cart
          let cartData = JSON.parse(localStorage.getItem('cart') || '{}');
          
          // Initialize user's cart if it doesn't exist
          if (!cartData[userId]) {
            cartData[userId] = {};
          }
          
          // Merge guest cart items into user cart
          for (const [bookId, item] of Object.entries(guestCartData)) {
            if (cartData[userId][bookId]) {
              // If book already in user cart, add quantities (up to max 8)
              const newQuantity = Math.min(cartData[userId][bookId].quantity + item.quantity, 8);
              cartData[userId][bookId].quantity = newQuantity;
            } else {
              // Otherwise add the item to user cart
              cartData[userId][bookId] = item;
            }
          }
          
          // Save updated cart to localStorage
          localStorage.setItem('cart', JSON.stringify(cartData));
          
          // Clear guest cart
          localStorage.removeItem('guestCart');
        }
      }
      
      // Call onLogin callback
      onLogin();
      
      // Close the popup
      onClose();
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      setError(error.message || 'Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-4">Please login to add items to your cart</p>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex justify-between">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
