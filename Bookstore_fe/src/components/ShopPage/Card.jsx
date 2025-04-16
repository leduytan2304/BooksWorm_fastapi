import React, { useState } from 'react';

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

export default function Card() {
  return (
    <div className="outline">
      <div className="relative w-full pb-[75%]">
        <img 
          className='absolute top-0 left-0 w-full h-full object-cover' 
          src="https://marketplace.canva.com/EAFPHUaBrFc/1/0/1003w/canva-black-and-white-modern-alone-story-book-cover-QHBKwQnsgzs.jpg" 
          alt="Book Cover" 
        />
      </div>
      <h1 className='ml-5 mt-5 font-bold text-xl'>Book Title</h1>
      <h2 className='ml-5 mt-1 mb-5 font-light text-sm'>Author Name</h2>
      <div className='flex justify-start items-center text-gray-400 border bt-2 bg-slate-100'>
        <h3 className='h-12 ml-5 flex justify-center items-center'>Price</h3>
      </div>
    </div>
  );
}


