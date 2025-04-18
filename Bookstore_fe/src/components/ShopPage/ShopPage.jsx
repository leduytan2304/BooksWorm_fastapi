import React, { useEffect, useState } from 'react';
import Card from './Card';
import Pagination from './Pagination';

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
        className="px-4 py-2 bg-blue-500 text-white rounded-lg focus:outline-none"
      >
        {selectedOption}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
          <ul className="text-sm">
            <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleSelect('Option 1')}>Option 1</li>
            <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleSelect('Option 2')}>Option 2</li>
            <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleSelect('Option 3')}>Option 3</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/books')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false)
        console.log(data);
        
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="container relative mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full " id="Projects">
        <div className="flex justify-between items-center mb-6 border-b border-gray-400">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-left">Shop Page</h1>
        </div>
        
        {/* Filter Section */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg">Filter By</p>
          <div>
            <Dropdown />
            <Dropdown />
          </div>
        </div>
        
        {/* Flex Layout Section */}
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
            
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                
                {books.map((book) => (
                  <Card key={Book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='mt-10 flex justify-center items-center'>
        <Pagination/>
      </div>
    </>
  );
}