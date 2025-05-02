import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "./ShopPage/Card";
const Feature = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommended");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/books/${activeTab}`);
        setBooks(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // In a real app, you might fetch different data based on the tab
    // For example: axios.get(`http://localhost:8000/api/books/${tab}`);
  };

  // Function to get the display price (either discount or regular price)
  const getDisplayPrice = (book) => {
    if (book.discounts && book.discounts.length > 0) {
      // Get the current date to check if discount is still valid
      const currentDate = new Date();
      const discount = book.discounts[0];
      const discountEndDate = new Date(discount.discount_end_date);
      
      if (currentDate <= discountEndDate) {
        return `$${discount.discount_price.toFixed(2)}`;
      }
    }
    return `$${book.book_price.toFixed(2)}`;
  };

  return (
    <div className="container mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full">
      {/* Title */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Featured Books</h1>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        <button 
          className={`px-4 py-2 border rounded ${activeTab === "recommended" ? "bg-gray-400" : "bg-gray-100 hover:bg-gray-200"}`}
          onClick={() => handleTabChange("recommended")}
        >
          Recommended
        </button>
        <button 
          className={`px-4 py-2 border rounded ${activeTab === "popular" ? "bg-gray-400" : "bg-gray-100 hover:bg-gray-200"}`}
          onClick={() => handleTabChange("popular")}
        >
          Popular
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-500">Loading books...</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      )}

      {/* Grid of Books */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 p-8 border-2 border-gray-500 box-border">
          {books.map((book, index) => (
                             <div
                             key={index}
                             className="flex-shrink-0 px-2"
                            
                           >
                             <Card book={book} />
                           </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feature;