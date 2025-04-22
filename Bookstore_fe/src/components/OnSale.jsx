import { React, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { PlayIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const OnSale = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/books/onsale');
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching discounted books:', err);
        setError('Failed to load books on sale');
        setLoading(false);
      }
    };

    fetchDiscountedBooks();
  }, []);

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth >= 1280) { // xl breakpoint
        setCardsToShow(4);
      } else if (window.innerWidth >= 1024) { // lg breakpoint
        setCardsToShow(3);
      } else if (window.innerWidth >= 768) { // md breakpoint
        setCardsToShow(2);
      } else {
        setCardsToShow(1);
      }
    };
    
    updateCardsToShow();
    window.addEventListener("resize", updateCardsToShow);
    return () => window.removeEventListener("resize", updateCardsToShow);
  }, []);

  const nextProject = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, books.length - cardsToShow);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };
  
  const prevProject = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, books.length - cardsToShow);
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });
  };

  // Calculate card width based on cardsToShow
  const getCardWidth = () => {
    return `${100 / cardsToShow}%`;
  };

  return (
    <div
      className="container mx-auto py-4 pt-20 px-4 
      sm:px-6 md:px-10 lg:px-16 my-20 w-full overflow-hidden"
      id="Projects"
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl sm:text-4xl font-bold-100 mb-2 text-left">
          On Sale
        </h1>
        <button className="flex items-center gap-1 bg-blue-400 rounded-md p-1 text-white hover:bg-blue-500 transition">
          View All <PlayIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Display loading state */}
      {loading && (
        <div className="text-center py-8">
          <p>Loading books on sale...</p>
        </div>
      )}

      {/* Display error message */}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Book slider - only show when not loading and no error */}
      {!loading && !error && books.length > 0 && (
        <div className="relative p-4 sm:p-8 border border-solid border-gray-400">
          {/* Left arrow - always on left side */}
          <button
            onClick={prevProject}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full z-10 hover:bg-gray-300 transition"
            aria-label="Previous Book"
          >
            <img className="w-6 h-6" src={assets.left_arrow} alt="Previous" />
          </button>

          <div className="overflow-hidden w-full px-10">
            <div className="overflow-hidden w-full">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
                }}
              >
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 px-2"
                    style={{ width: getCardWidth() }}
                  >
                    <div className="relative">
                      <img
                        src={book.book_cover_photo}
                        alt={book.book_title}
                        className="w-full h-auto object-cover aspect-[3/4] mb-14"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
                        }}
                      />
                      <div className="absolute left-0 right-0 bottom-0 flex justify-center">
                        <div className="inline-block bg-white w-full px-3 py-2 shadow-md">
                          <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 truncate">
                            {book.book_title}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            
                            <span className="line-through ml-2 text-gray-400">${book.book_price}</span>
                            <span className="text-xl font-bold text-red-500 ml-2">${book.discounts?.[0]?.discount_price} </span>
                            <span className="hidden sm:inline"> | {book.author?.author_name}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right arrow - always on right side */}
          <button
            onClick={nextProject}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full z-10 hover:bg-gray-300 transition"
            aria-label="Next Book"
          >
            <img className="w-6 h-6" src={assets.right_arrow} alt="Next" />
          </button>
        </div>
      )}

      {/* Display message if no books are on sale */}
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-8 border border-solid border-gray-400">
          <p>No books currently on sale.</p>
        </div>
      )}
    </div>
  );
};

export default OnSale;