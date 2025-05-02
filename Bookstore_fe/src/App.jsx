import React, { useState } from 'react'
import './index.css'
import About from './components/About'
import Header from './components/Header'
import OnSale from './components/OnSale'
import Feature from './components/Feature'
import ShopPage from "./components/ShopPage/ShopPage"
import Navbar from './components/Navbar'
import LoginPopup from './components/LoginPopup'
import Cart from './components/Cart'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductDetail from './components/ProductDetail'
import Cookies from 'js-cookie';

export default function App() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  const handleSuccessfulLogin = async () => {
    const token = Cookies.get('token');
    if (token) {
      // Handle successful login
      setShowLoginPopup(false);
    }
  };

  return (
    <Router>
      <div className='w-full overflow-hidden'>
        <Navbar onLoginClick={() => setShowLoginPopup(true)} />
        
        {/* Login popup that can appear on any page */}
        <LoginPopup 
          isOpen={showLoginPopup} 
          onClose={() => setShowLoginPopup(false)} 
          onLogin={handleSuccessfulLogin}
        />
        
        <Routes>
          <Route path="/" element={
            <>
              {/* <Header/> */}
              {/* <About/> */}
              <OnSale/>
              <Feature/>
              {/* <ShopPage/> */}
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/product" element={<ShopPage />} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/product/:id" element={<ProductDetail/>} />
        </Routes>
      </div>
    </Router>
  )
}
