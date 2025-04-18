import React from 'react'
import './index.css'
import About from './components/About'
import Header from './components/Header'
import OnSale from './components/OnSale'
import Feature from './components/Feature'
import ShopPage from "./components/ShopPage/ShopPage"
import Navbar from './components/Navbar'
import Login from './components/Login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductDetail from './components/ProductDetail'

export default function App() {
  return (
    <Router>
      <div className='w-full overflow-hidden'>
        <Navbar/>
        <Routes>
          <Route path="/" element={
            <>
              <Header/>
              <About/>
              <OnSale/>
              <Feature/>
              <ShopPage/>
              <ProductDetail/>
              
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </div>
    </Router>
  )
}