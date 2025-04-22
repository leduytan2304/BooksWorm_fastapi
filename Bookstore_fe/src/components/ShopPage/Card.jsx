import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from '@heroicons/react/24/solid';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select Filter');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={toggleDropdown} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg focus:outline-none hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
      >
        <FunnelIcon className="h-4 w-4" />
        <span>{selectedOption}</span>
        {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg overflow-hidden z-10 border border-gray-100 transform transition-all duration-200 ease-out">
          <ul className="py-1">
            <li 
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100"
              onClick={() => handleSelect('Option 1')}
            >
              Option 1
            </li>
            <li 
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100"
              onClick={() => handleSelect('Option 2')}
            >
              Option 2
            </li>
            <li 
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150"
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

export default function Card({ book }) {
  const {
    id,
    book_title,
    book_summary,
    book_price,
    book_cover_photo,
    discount,
    author
  } = book;
  console.log(book);
  const navigate = useNavigate();
  const handleClick = () =>{
    navigate(`/product/${id}`, { state: { bookId: id } });
  }
  const formattedPrice = parseFloat(book_price).toFixed(2);
  
  
  const discountedPrice = discount ? (book_price * (1 - discount / 100)).toFixed(2) : null;
  console.log('discountedPrice: ' + discountedPrice);
  return (
    <divo onClick={handleClick} className="flex flex-col h-full rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white">
      <div className="relative w-full pb-[75%] overflow-hidden group">
        <img 
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          src={book_cover_photo} 
          alt={book_title} 
        />
        {discount && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium">
            {discount}% OFF
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h1 className="font-bold text-xl text-gray-800 line-clamp-2">{book_title}</h1>
        <h2 className="mt-2 font-light text-sm text-gray-600 line-clamp-3">{book_summary}</h2>
      </div>
      
      
      <div className="px-5 pb-4 mt-auto">
        <div className="flex items-center">
          {discount ? (
            <>
              <span className="text-gray-400 line-through mr-2">${formattedPrice}</span>
              <span className="text-lg font-bold text-red-600">${discountedPrice}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">${formattedPrice}</span>
          )}
         
        </div>
       
       
      </div>
    </divo>
  );
}