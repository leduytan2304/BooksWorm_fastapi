import React, { useState } from 'react';
import Card from './Card';
import Pagination from './Pagination';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select Filter'); // State for the selected option

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle selecting an option
  const handleSelect = (option) => {
    setSelectedOption(option); // Update the selected option
    setIsOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <button 
        onClick={toggleDropdown} 
        className="px-4 py-2 bg-blue-500 text-white rounded-lg focus:outline-none"
      >
        {selectedOption} {/* Display the selected option */}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
          <ul className="text-sm">
            <li 
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect('Option 1')}
            >
              Option 1
            </li>
            <li 
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect('Option 2')}
            >
              Option 2
            </li>
            <li 
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect('Option 3')}
            >
              Option 3
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <>
      <div className="container relative mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full " id="Projects">
        <div className="flex justify-between items-center mb-6 border-b border-gray-400">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-left">Shop Page</h1>
        </div>
        
        {/* Filter Section */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg">Filter By</p>
          {/* Dropdown next to Filter By */}
          <div>
          <Dropdown className/>
          <Dropdown />
          </div>
          
        </div>
        
        {/* Flex Layout Section */}
        <div className="flex flex-row mb-6">
          {/* First child with flex-2 (takes 2 parts of available space) */}
          <div className="flex-[2] bg-red-400 p-4 ">
            Child 1 (flex-2)
          </div>
          
          {/* Second child with flex-3 (takes 3 parts of available space) */}
          <div className="flex-[3] bg-black p-4 text-white">
            Child 2 (flex-3)
          </div>
        </div>
<div className='flex flex-row '>

<div className="mr-10 flex-[1] hidden md:block">
      {/* Category Section */}
      <div className="border border-gray-300 rounded-md p-4 mb-4 w-48">
        <h2 className="text-lg font-bold mb-2">Category</h2>
        <ul className="space-y-1">
          <li className="text-gray-700">category_name</li>
          <li className="text-gray-700">Category #1</li>
          <li className="text-gray-700">Category #2</li>
        </ul>
      </div>

      {/* Author Section */}
      <div className="border border-gray-300 rounded-md p-4 mb-4 w-48">
        <h2 className="text-lg font-bold mb-2">Author</h2>
        <ul className="space-y-1">
          <li className="text-gray-700">author_name</li>
          <li className="text-gray-700">Author #1</li>
          <li className="text-gray-700">Author #2</li>
        </ul>
      </div>

      {/* Rating Section */}
      <div className="border border-gray-300 rounded-md p-4 w-48">
        <h2 className="text-lg font-bold mb-2">Rating</h2>
        <ul className="space-y-1">
          <li className="text-gray-700">1 Star</li>
          <li className="text-gray-700">2 Star</li>
          <li className="text-gray-700">3 Star</li>
          <li className="text-gray-700">4 Star</li>
          <li className="text-gray-700">5 Star</li>
        </ul>
      </div>
    </div>
    <div className='flex-[5]'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <Card/>
          <Card/>
          <Card/>
          <Card/>
          <Card/>
          <Card/>
          <Card/>
          <Card/>
          
          
          

    </div>
    </div>
   
      </div>
       
      
      <div className='mt-10 flex justify-center items-center'>
                <Pagination/>
      </div>
      </div>
      
    </>
  );
}

