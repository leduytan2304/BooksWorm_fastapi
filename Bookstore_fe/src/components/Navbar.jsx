import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Cookies from "js-cookie";
import { ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoginPopup from "./LoginPopup";
import axios from 'axios';

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const location = useLocation(); // Get current location
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileMenu]);

  // Add this function outside of any useEffect to make it reusable
  const fetchUserData = async () => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        // Call the backend endpoint to get user data using axios
        const response = await axios.get('http://localhost:8000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Axios automatically parses JSON
        const userData = response.data;
        setIsLoggedIn(true);
        setUserEmail(userData.email || '');
        setFirstName(userData.first_name || Cookies.get('firstName') || '');
        setLastName(userData.last_name || Cookies.get('lastName') || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Token is invalid or expired
        setIsLoggedIn(false);
        setUserEmail('');
        setFirstName('');
        setLastName('');
        Cookies.remove('token');
        Cookies.remove('firstName');
        Cookies.remove('lastName');
      }
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setFirstName('');
      setLastName('');
    }
  };

  // Update the useEffect to use this function
  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        // Call the backend logout endpoint using axios
        await axios.post('http://localhost:8000/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    
    // Remove cookies
    Cookies.remove('token');
    Cookies.remove('userEmail');
    Cookies.remove('userId');
    Cookies.remove('firstName');
    Cookies.remove('lastName');
    
    // Update state
    setIsLoggedIn(false);
    setUserEmail('');
    setFirstName('');
    setLastName('');
    setCartItemCount(0); // Reset cart count to 0
    
    // Clear user cart from localStorage
    const userId = Cookies.get('userId');
    if (userId) {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
      if (storedCart[userId]) {
        delete storedCart[userId];
        localStorage.setItem('cart', JSON.stringify(storedCart));
      }
    }
    
    // Redirect to home page
    navigate('/');
  };

  const handleSuccessfulLogin = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        await fetchUserData(); // Reload user data
        setShowLoginPopup(false);
      } catch (error) {
        console.error('Error updating user data after login:', error);
      }
    }
  };

  // Get full name or username from email if no name is available
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}`
    : firstName 
      ? firstName 
      : userEmail 
        ? userEmail.split('@')[0] 
        : '';

  // Simple useEffect to update cart count
  useEffect(() => {
    // Function to calculate cart items
    const calculateCartCount = () => {
      try {
        const token = Cookies.get('token');
        const userId = Cookies.get('userId');
        
        if (token && userId) {
          // For logged-in users
          const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
          if (!storedCart[userId]) return 0;
          
          return Object.values(storedCart[userId]).reduce((total, item) => {
            return total + item.quantity;
          }, 0);
        } else {
          // For guest users
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{}');
          return Object.values(guestCart).reduce((total, item) => {
            return total + item.quantity;
          }, 0);
        }
      } catch (error) {
        console.error('Error calculating cart items:', error);
        return 0;
      }
    };

    // Update cart count immediately
    setCartItemCount(calculateCartCount());
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartItemCount(calculateCartCount());
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Helper function to determine if a link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to shop page with search query
      navigate(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false); // Hide search bar after submission
    }
  };

  // Toggle search bar visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Focus the search input when it becomes visible
      setTimeout(() => {
        const searchInput = document.getElementById('navbar-search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 bg-gray-800">
        <div className="container mx-auto flex items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent">
          {/* Logo */}
          <img src={assets.logo} alt="Bookstore Logo" className="mr-4" />
          
          {/* Search bar - visible on desktop */}
          <div className="hidden md:flex flex-grow max-w-md mr-4">
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Search for books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow py-2 px-4 rounded-l-md focus:outline-none text-black"
              />
              <button 
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Navigation links */}
          <ul className="hidden md:flex items-center gap-7 text-white ml-auto">
            <Link 
              to="/" 
              className={`cursor-pointer hover:text-gray-400 ${isActive('/') ? 'text-yellow-400 font-bold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`cursor-pointer hover:text-gray-400 ${isActive('/about') ? 'text-yellow-400 font-bold' : ''}`}
            >
              About
            </Link>
            <Link 
              to="/product" 
              className={`cursor-pointer hover:text-gray-400 ${isActive('/product') ? 'text-yellow-400 font-bold' : ''}`}
            >
              Shop
            </Link>
            <li className="relative">
              <Link 
                className={`cursor-pointer hover:text-gray-400 ${isActive('/cart') ? 'text-yellow-400 font-bold' : ''}`} 
                to="/cart"
              >
                Cart
                <span className={`absolute -top-1 -right-3 ${cartItemCount > 0 ? 'bg-red-500' : 'bg-gray-500'} text-white text-xs rounded-full px-1`}>
                  {cartItemCount}
                </span>
              </Link>
            </li>
            
            {isLoggedIn ? (
              <>
                <span className="text-white">Hi {displayName}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-black px-8 py-2 rounded-full hover:bg-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowLoginPopup(true)}
                className="hidden md:block bg-white text-black px-8 py-2 rounded-full"
              >
                Login
              </button>
            )}
          </ul>

          {/* Mobile menu button and search icon */}
          <div className="md:hidden flex items-center ml-auto">
            <button 
              onClick={toggleSearch}
              className="text-white mr-4"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <img
              onClick={() => setShowMobileMenu(true)}
              src={assets.menu_icon}
              className="w-7"
              alt="Menu"
            />
          </div>
        </div>

        {/* Mobile search bar - shown when search is toggled on mobile */}
        {showSearch && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-gray-800 py-3 px-6 z-50">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search for books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow py-2 px-4 rounded-l-md focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600"
              >
                Search
              </button>
              <button 
                type="button"
                onClick={toggleSearch}
                className="ml-2 text-white hover:text-gray-400"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        <div
          className={`md:hidden ${
            showMobileMenu ? "fixed w-full" : "h-0 w-0"
          } bg-white transition-all right-0 top-0 bottom-0 overflow-hidden`}
        >
          <div className="flex justify-end p-6 cursor-pointer">
            <img
              onClick={() => setShowMobileMenu(false)}
              src={assets.cross_icon}
              className="w-6"
              alt="Close"
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <Link
              onClick={() => setShowMobileMenu(false)}
              to="/"
              className={`px-4 py-2 rounded-full inline-block ${isActive('/') ? 'bg-gray-200 font-bold' : ''}`}
            >
              Home
            </Link>
            <Link
              onClick={() => setShowMobileMenu(false)}
              to="/about"
              className={`px-4 py-2 rounded-full inline-block ${isActive('/about') ? 'bg-gray-200 font-bold' : ''}`}
            >
              About
            </Link>
            <Link
              onClick={() => setShowMobileMenu(false)}
              to="/product"
              className={`px-4 py-2 rounded-full inline-block ${isActive('/product') ? 'bg-gray-200 font-bold' : ''}`}
            >
              Shop
            </Link>
            <Link
              onClick={() => setShowMobileMenu(false)}
              to="/cart"
              className={`px-4 py-2 rounded-full inline-block relative ${isActive('/cart') ? 'bg-gray-200 font-bold' : ''}`}
            >
              Cart
              <span className={`absolute -top-2 -right-2 ${cartItemCount > 0 ? 'bg-red-500' : 'bg-gray-500'} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center`}>
                {cartItemCount}
              </span>
            </Link>
            
            {/* Search option in mobile menu */}
            <button
              onClick={() => {
                setShowMobileMenu(false);
                setTimeout(() => toggleSearch(), 300); // Toggle search after menu closes
              }}
              className="px-4 py-2 rounded-full inline-block"
            >
              Search
            </button>
            
            {isLoggedIn ? (
              <>
                <span className="px-4 py-2">Hi {displayName}</span>
                <button 
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowLoginPopup(true);
                  setShowMobileMenu(false);
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded-full"
              >
                Login
              </button>
            )}
          </ul>
        </div>
      </div>

      {/* Login popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        onLogin={handleSuccessfulLogin}
      />
    </>
  );
}
































