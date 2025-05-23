import React from 'react'
import Navbar from './Navbar'
export default function Header() {
  return (
    <>
    <div className='min-h-screen mb-4 bg-cover bg-center 
    flex overflow-hidden items-center w-full' style={{backgroundImage: "url('/header_img.png')"}} id='Header'
    >
        
        <div className='container text-center mx-auto py-4 px-6 md:px-20 lg:px-32 text-white' >
            <h2 className='text-5xl sm:text-6xl md:text-[82px] 
            inline-block max-w-3xl font-semibold pt-20'>Explore homes that fit your dreams</h2>
            <div className='space-x-6 mt-16'>
                <a href="#projects" className ='border border-white px-8 py-3 rounded'>Projects</a>
                <a href="#contact" className ='border bg-blue-500 px-8 py-3 rounded'>Contact Us</a>
            </div>
            {/* <img src={assets.menu_icon} className="md:hidden w-7" alt="" /> */}
        </div>
    
        
    </div>
    </>
    
  )
}
