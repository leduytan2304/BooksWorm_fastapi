
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function LoginPopup({ isOpen, onClose, onLogin }) {
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
      
      const response = await axios.post('http://localhost:8000/api/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      const data = response.data;
      
      // Save token to cookies
      Cookies.set('token', data.access_token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Save user information to cookies
      Cookies.set('userEmail', data.user_email || email, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Save user's first and last name
      if (data.first_name) {
        Cookies.set('firstName', data.first_name, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      if (data.last_name) {
        Cookies.set('lastName', data.last_name, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      // Save user ID directly from token response
      if (data.user_id) {
        Cookies.set('userId', data.user_id.toString(), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      
      // Merge guest cart with user cart
      const guestCartData = JSON.parse(localStorage.getItem('guestCart') || '{}');
      if (Object.keys(guestCartData).length > 0) {
        // Get existing user cart
        let cartData = JSON.parse(localStorage.getItem('cart') || '{}');
        
        // Initialize user's cart if it doesn't exist
        if (!cartData[data.user_id]) {
          cartData[data.user_id] = {};
        }
        
        // Merge guest cart items into user cart
        for (const [bookId, item] of Object.entries(guestCartData)) {
          if (cartData[data.user_id][bookId]) {
            // If book already in user cart, add quantities (up to max 8)
            const newQuantity = Math.min(cartData[data.user_id][bookId].quantity + item.quantity, 8);
            cartData[data.user_id][bookId].quantity = newQuantity;
          } else {
            // Otherwise add the item to user cart
            cartData[data.user_id][bookId] = item;
          }
        }
        
        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cartData));
        
        // Clear guest cart
        localStorage.removeItem('guestCart');
      }
      
      // Call onLogin callback
      onLogin();
      
      // Close the popup
      onClose();
      
      // Dispatch cart updated event to refresh navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Invalid email or password';
      setError(errorMessage);
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
