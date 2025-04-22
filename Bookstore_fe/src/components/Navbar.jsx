import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Cookies from "js-cookie";
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileMenu]);

  // Check if user is logged in on component mount and cookie changes
  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get('token');
      
      if (token) {
        try {
          // Call the backend endpoint to get user data
          const response = await fetch('http://localhost:8000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setIsLoggedIn(true);
            setUserEmail(userData.email || '');
          } else {
            // Token is invalid or expired
            setIsLoggedIn(false);
            setUserEmail('');
            Cookies.remove('token');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsLoggedIn(false);
          setUserEmail('');
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = () => {
    // Remove cookies
    Cookies.remove('token');
    Cookies.remove('userEmail');
    
    // Update state
    setIsLoggedIn(false);
    setUserEmail('');
    
    // Redirect to home page
    navigate('/');
  };

  // Get username from email (everything before @)
  const username = userEmail ? userEmail.split('@')[0] : '';

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gray-800">
      <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent">
        <img src={assets.logo} alt="" />

        <ul className="hidden md:flex items-center gap-7 text-white ml-auto">
          <Link to="/" className="cursor-pointer hover:text-gray-400">
            Home
          </Link>
          <Link to="/about" className="cursor-pointer hover:text-gray-400">
            About
          </Link>
          <Link to="/product" className="cursor-pointer hover:text-gray-400">
            Shop
          </Link>
          
          {isLoggedIn ? (
            <>
              <span className="text-white">Hi {username}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-black px-8 py-2 rounded-full hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <button className="hidden md:block bg-white text-black px-8 py-2 rounded-full">
              <Link to="/login" className="cursor-pointer hover:text-gray-400">
                Login
              </Link>
            </button>
          )}
        </ul>

        <img
          onClick={() => setShowMobileMenu(true)}
          src={assets.menu_icon}
          className="md:hidden w-7"
          alt=""
        />
      </div>

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
            alt=""
          />
        </div>
        <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
          <Link
            onClick={() => setShowMobileMenu(false)}
            to="/"
            className="px-4 py-2 rounded-full inline-block"
          >
            Home
          </Link>
          <Link
            onClick={() => setShowMobileMenu(false)}
            to="/about"
            className="px-4 py-2 rounded-full inline-block"
          >
            About
          </Link>
          <Link
            onClick={() => setShowMobileMenu(false)}
            to="/projects"
            className="px-4 py-2 rounded-full inline-block"
          >
            Projects
          </Link>
          
          {isLoggedIn ? (
            <>
              <span className="px-4 py-2">Hi {username}</span>
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
            <Link
              onClick={() => setShowMobileMenu(false)}
              to="/login"
              className="bg-gray-800 text-white px-4 py-2 rounded-full inline-block"
            >
              Login
            </Link>
          )}
        </ul>
      </div>
    </div>
  );
}


