import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";
import Pagination from "./Pagination";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon, MinusIcon, PlusIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/solid';

function Dropdown({ selectedOption, setSelectedOption, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Map option values to display text
  const optionLabels = {
    "discount_desc": "sort by on sale",
    "popular_desc": "sort by popularity",
    "final_price_asc": "sort by: low to high",
    "final_price_desc": "sort by: high to low"
  };

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
        <span>{optionLabels[selectedOption] || selectedOption}</span>
        <ChevronDownIcon className="h-5 w-5 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
          <ul className="text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("discount_desc")}
            >
              sort by on sale
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("popular_desc")}
            >
              sort by popularity
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("final_price_asc")}
            >
              sort by: low to high
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelect("final_price_desc")}
            >
              sort by: high to low
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [star, setStar] = useState("");
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);
  
  // Add search state and navigation
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Function to clear search filter
  const clearSearchFilter = () => {
    setSearchQuery("");
    // Update URL without search parameter
    const params = new URLSearchParams(location.search);
    params.delete("search");
    navigate({ search: params.toString() });
  };
  
  // Extract search query from URL on component mount or URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    setSearchQuery(search || "");
    
    // Reset to page 1 when search changes
    if (search) {
      setCurrentPage(1);
    }
  }, [location.search]);
  // Fetch authors when component mounts
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/authors");
        
        // Remove duplicates by author_name
        const uniqueAuthorsMap = new Map();
        response.data.forEach(author => {
          // Only add if we don't already have this author name, or replace with this one
          if (!uniqueAuthorsMap.has(author.author_name)) {
            uniqueAuthorsMap.set(author.author_name, author);
          }
        });
        
        // Convert Map back to array and sort alphabetically
        const uniqueAuthors = Array.from(uniqueAuthorsMap.values());
        const sortedAuthors = uniqueAuthors.sort((a, b) => 
          a.author_name.localeCompare(b.author_name)
        );
        
        console.log("Original authors:", response.data.length);
        console.log("Unique authors:", sortedAuthors.length);
        setAuthors(sortedAuthors);
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
        let url = `http://localhost:8000/api/books?filterBy=${selectedOption}&limit=10000`;
        
        // Add author_id filter if selected
        if (selectedAuthor) {
          url += `&author_id=${parseInt(selectedAuthor, 10)}`;
        }

        // Add star rating filter if selected
        if (star) {
          url += `&star=${star}`;
        }
        
        // Add category filter if selected
        if (selectedCategory) {
          url += `&category_id=${parseInt(selectedCategory, 10)}`;
        }
        
        // Add search query if present
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        console.log("Fetching total books count with URL:", url);
        
        const response = await axios.get(url);
        // Count the total number of books returned
        const count = response.data.length;
        console.log("Total books count:", count);
        setTotalBooks(count);
      } catch (err) {
        console.error("Error fetching total book count:", err);
        // Set totalBooks to 0 on error
        setTotalBooks(0);
      }
    };

    fetchTotalBooks();
  }, [selectedOption, selectedAuthor, star, selectedCategory, searchQuery]); // Add searchQuery to dependencies

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
        
        // Add category filter if selected
        if (selectedCategory) {
          url += `&category_id=${parseInt(selectedCategory, 10)}`;
        }
        
        // Add search query if present
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
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
  }, [selectedOption, showPage, currentPage, selectedAuthor, star, selectedCategory, searchQuery]); // Add searchQuery to dependencies

  // Calculate total pages - ensure we don't show extra pages when records < showPage
  const totalPages = totalBooks <= 0 ? 1 : Math.ceil(totalBooks / showPage);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/category');
        setCategory(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching category:", err);
      }
    };

    fetchCategories();
  }, []);
  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedAuthor("");
    setStar("");
    setSelectedCategory("");
    setSearchQuery("");
    setCurrentPage(1);
    
    // Update URL without any filter parameters
    navigate("/product");
  };

  return (
    <>
      <div
        className="container relative mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full"
        id="Projects"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-gray-400 pb-2">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-left">
              Shop Page
            </h1>
            <p className="text-sm sm:text-lg">
              Filter By: 
              {searchQuery && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium mr-2">
                  "{searchQuery}" 
                  <button 
                    onClick={clearSearchFilter}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              {selectedAuthor ? (
                <span className="mr-2">
                  {authors.find(a => a.id === parseInt(selectedAuthor, 10))?.author_name || ''}
                </span>
              ) : (
                <span className="mr-2">All Authors</span>
              )}
              {star ? (
                <span className="mr-2">
                  / {star} Star{star === '1' ? '' : 's'} & Up
                </span>
              ) : (
                <span className="mr-2">/ All Ratings</span>
              )}
              {selectedCategory ? (
                <span>
                  / {category.find(c => c.id === parseInt(selectedCategory, 10))?.category_name || ''}
                </span>
              ) : (
                <span>/ All Categories</span>
              )}
            </p>
          </div>
          
          {/* Add Clear All Filters button */}
          {(searchQuery || selectedAuthor || star || selectedCategory) && (
            <button
              onClick={clearAllFilters}
              className="mt-2 sm:mt-0 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All Filters
            </button>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-row">
          <p className="text-lg">Filter By:
          </p>
          <p className="text-lg ml-40">
            {totalBooks === 0 ? 
              "0 results found" : 
              `Show ${Math.max(1, (showPage * (currentPage - 1)) + 1)} - ${Math.min(totalBooks, currentPage * showPage)} of ${totalBooks}`
            }
          </p>
          </div>
         
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
          {/* Left Sidebar with Filter Accordions */}
          <div className="mr-10 flex-[1]">
            {/* Category Accordion */}
            <div className="border border-gray-300 rounded-md mb-4 w-48 overflow-hidden">
              <button 
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center"
              >
                <h2 className="text-lg">Category</h2>
                <svg 
                  className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${categoryDropdownOpen ? 'max-h-60' : 'max-h-0'} overflow-y-auto`}>
                <div className="p-4">
                  <div 
                    className={`px-2 py-1 mb-1 rounded cursor-pointer ${selectedCategory === '' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                  >
                    All Categories
                  </div>
                  {category.map(cat => (
                    <div 
                      key={cat.id} 
                      className={`px-2 py-1 mb-1 rounded cursor-pointer ${selectedCategory === cat.id.toString() ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setSelectedCategory(cat.id.toString());
                        setCurrentPage(1);
                        console.log("Category selected:", cat.id, cat.category_name);
                      }}
                    >
                      {cat.category_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
                
            {/* Author Accordion */}
            <div className="border border-gray-300 rounded-md mb-4 w-48 overflow-hidden">
              <button 
                onClick={() => setAuthorDropdownOpen(!authorDropdownOpen)}
                className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center"
              >
                <h2 className="text-lg">Author</h2>
                <svg 
                  className={`w-4 h-4 transition-transform ${authorDropdownOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${authorDropdownOpen ? 'max-h-60' : 'max-h-0'} overflow-y-auto`}>
                <div className="p-4">
                  <div 
                    className={`px-2 py-1 mb-1 rounded cursor-pointer ${selectedAuthor === '' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      setSelectedAuthor('');
                      setCurrentPage(1);
                    }}
                  >
                    All Authors
                  </div>
                  {authors.map(author => (
                    <div 
                      key={author.id} 
                      className={`px-2 py-1 mb-1 rounded cursor-pointer ${selectedAuthor === author.id.toString() ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setSelectedAuthor(author.id.toString());
                        setCurrentPage(1);
                        console.log("Selected author:", author.id, author.author_name);
                      }}
                    >
                      {author.author_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating Accordion */}
            <div className="border border-gray-300 rounded-md w-48 overflow-hidden">
              <button 
                onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
                className="w-full px-4 py-3 bg-gray-100 text-left font-bold flex justify-between items-center"
              >
                <h2 className="text-lg">Rating</h2>
                <svg 
                  className={`w-4 h-4 transition-transform ${ratingDropdownOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${ratingDropdownOpen ? 'max-h-60' : 'max-h-0'} overflow-y-auto`}>
                <div className="p-4">
                  <div 
                    className={`px-2 py-1 mb-1 rounded cursor-pointer ${star === '' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      setStar('');
                      setCurrentPage(1);
                    }}
                  >
                    All Ratings
                  </div>
                  {['5', '4', '3', '2', '1'].map(rating => (
                    <div 
                      key={rating} 
                      className={`px-2 py-1 mb-1 rounded cursor-pointer ${star === rating ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setStar(rating);
                        setCurrentPage(1);
                      }}
                    >
                      {rating} {rating === '1' ? 'Star' : 'Stars'} & Up
                    </div>
                  ))}
                </div>
              </div>
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
              // If we only have 1 page worth of results, just show page 1
              if (totalPages <= 1) {
                return (
                  <button
                    className="px-3 py-1 border-t border-b border-gray-300 text-sm bg-gray-200"
                  >
                    1
                  </button>
                );
              }
              
              // If we only have 2 pages, show both pages
              if (totalPages === 2) {
                return [
                  <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-1 border-t border-b border-gray-300 text-sm ${
                      currentPage === 1 ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  >
                    1
                  </button>,
                  <button
                    key={2}
                    onClick={() => setCurrentPage(2)}
                    className={`px-3 py-1 border-t border-b border-gray-300 text-sm ${
                      currentPage === 2 ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                  >
                    2
                  </button>
                ];
              }

              // For 3+ pages, create a sliding window
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
              disabled={currentPage === totalPages}
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












