import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";
import Pagination from "./Pagination";
import { ChevronDownIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

function Dropdown({ selectedOption, setSelectedOption, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setCurrentPage(1); // Reset to page 1
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg focus:outline-none flex items-center"
      >
        <span>{selectedOption}</span>
        <ChevronDownIcon className="h-5 w-5 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
          <ul className="text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("discount_desc")}
            >
              discount_desc
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("popular_desc")}
            >
              popular_desc
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("final_price_asc")}
            >
              final_price_asc
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("final_price_desc")}
            >
              final_price_desc
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function DropdownShowPage({ showPage, setShowPage, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectShowPage = (option) => {
    setShowPage(option);
    setCurrentPage(1); // Reset to page 1
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg focus:outline-none flex items-center"
      >
        <span>Show {showPage}</span>
        <ChevronDownIcon className="h-5 w-5 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
          <ul className="text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelectShowPage(5)}
            >
              Show 5
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelectShowPage(15)}
            >
              Show 15
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelectShowPage(20)}
            >
              Show 20
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelectShowPage(25)}
            >
              Show 25
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("discount_desc");
  const [showPage, setShowPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [star, setStar] = useState("");
  // Fetch authors when component mounts
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/authors");
        setAuthors(response.data);
      } catch (err) {
        console.error("Error fetching authors:", err);
      }
    };

    fetchAuthors();
  }, []);

  // Fetch total book count once when component mounts or filter changes
  useEffect(() => {
    const fetchTotalBooks = async () => {
      try {
        // Build URL with all current filters
        let url = `http://localhost:8000/api/books?filterBy=${selectedOption}`;
        
        // Add author_id filter if selected
        if (selectedAuthor) {
          url += `&author_id=${parseInt(selectedAuthor, 10)}`;
        }

        // Add star rating filter if selected
        if (star) {
          url += `&star=${star}`;
        }
        
        const response = await axios.get(url);
        // Count the total number of books returned
        const count = response.data.length;
        setTotalBooks(count);
      } catch (err) {
        console.error("Error fetching total book count:", err);
      }
    };

    fetchTotalBooks();
  }, [selectedOption, selectedAuthor, star]); // Re-fetch when any filter changes

  // Fetch paginated books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * showPage;
        
        let url = `http://localhost:8000/api/books?filterBy=${selectedOption}&limit=${showPage}&offset=${offset}`;
        
        // Add author_id filter if selected
        if (selectedAuthor) {
          // Ensure author_id is passed as a number
          url += `&author_id=${parseInt(selectedAuthor, 10)}`;
        }

        // Add star rating filter if selected
        if (star) {
          url += `&star=${star}`;
        }
        
        console.log("Fetching books with URL:", url);
        
        const response = await axios.get(url);
        console.log("API response:", response.data);
        setBooks(response.data);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedOption, showPage, currentPage, selectedAuthor,star]);

  // Calculate total pages
  const totalPages = Math.ceil(totalBooks / showPage);

  return (
    <>
      <div
        className="container relative mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full"
        id="Projects"
      >
        <div className="flex justify-between items-center mb-6 border-b border-gray-400">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-left">
            Shop Page
          </h1>
        </div>

        {/* Filter Section */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg">Filter By</p>
          <div className="flex flex-row gap-10">
            <Dropdown
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              setCurrentPage={setCurrentPage}
              className="mr-20"
            />
            <DropdownShowPage 
              showPage={showPage} 
              setShowPage={setShowPage} 
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>

        {/* Flex Layout Section */}
        <div className="flex flex-row">
          {/* Left Sidebar with Filter Dropdowns */}
          <div className="mr-10 flex-[1] hidden md:block">
            {/* Category Dropdown */}
            <div className="border border-gray-300 rounded-md p-4 mb-4 w-48">
              <h2 className="text-lg font-bold mb-2">Category</h2>
              <select
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) =>
                  console.log("Category selected:", e.target.value)
                }
              >
                <option value="">All Categories</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="science">Science</option>
                <option value="history">History</option>
              </select>
            </div>
                
            {/* Author Dropdown */}
            <div className="border border-gray-300 rounded-md p-4 mb-4 w-48 relative author-dropdown">
              <h2 className="text-lg font-bold mb-2">Author</h2>
              <div className="relative">
                <button 
                  onClick={() => setAuthorDropdownOpen(!authorDropdownOpen)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
                >
                  <span>
                    {selectedAuthor 
                      ? authors.find(a => a.id === parseInt(selectedAuthor, 10))?.author_name || 'All Authors' 
                      : 'All Authors'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {authorDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedAuthor('');
                        setAuthorDropdownOpen(false);
                        console.log("Selected All Authors");
                      }}
                    >
                      All Authors
                    </div>
                    {authors.map(author => (
                      <div 
                        key={author.id} 
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedAuthor(author.id.toString());
                          setAuthorDropdownOpen(false);
                          console.log("Selected author:", author.id, author.author_name);
                        }}
                      >
                        {author.author_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Dropdown */}
            <div className="border border-gray-300 rounded-md p-4 w-48">
              <h2 className="text-lg font-bold mb-2">Rating</h2>
              <select
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                  setStar(e.target.value);
                  console.log("Rating selected:", e.target.value);
                }}
                value={star}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars & Up</option>
                <option value="3">3 Stars & Up</option>
                <option value="2">2 Stars & Up</option>
                <option value="1">1 Star & Up</option>
              </select>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-[5]">
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Card key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center items-center">
        <div className="flex justify-center p-4">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-l text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>

            {(() => {
              // Don't show pagination if there's only one page
              if (totalPages <= 1) {
                return (
                  <button
                    className="px-3 py-1 border-t border-b border-gray-300 text-sm bg-gray-200"
                  >
                    1
                  </button>
                );
              }

              // Create a sliding window of pages
              let startPage = Math.max(1, currentPage - 1);
              let endPage = Math.min(startPage + 2, totalPages);

              // Adjust start if we're near the end
              if (endPage - startPage < 2 && startPage > 1) {
                startPage = Math.max(1, endPage - 2);
              }

              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 border-t border-b border-gray-300 text-sm ${
                      currentPage === i ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded-r text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
















