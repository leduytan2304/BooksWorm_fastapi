import React from 'react'
import { assets } from '../assets/assets'

export default function 

() {
  return (
    <div className='flex flex-col items-center justify-center container 
    mx-auto p-14 md:px-20 lg:px-32 w-full overflow-hidden' id='About'>
        <h1 className='text-2xl sm:text-4xl font-bold mb-2'>About
            <span className='underline underline-offset-4 decoration-1 under font-light'> Our Brand</span>
        </h1>
    <p className = 'text-gray-500 max-w-80 text-center mb-8'> 
        Passionate About Properties, Delicated to your vision
    </p>
        <div className='flex flex-col mb:flex-row items-center md:items-start
        md:gap-20'>
            <img className='w-full sm:w-1/2 mx-w-lg' src={assets.brand_img} alt="" />
        </div>
    </div>
  )
}
