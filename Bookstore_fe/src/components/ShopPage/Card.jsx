import React from 'react';

export default function Card({ book }) {
  const {
    id,
    book_title,
    book_summary,
    book_price,
    book_cover_photo,
    discounts,
    author,
  } = book;

  const handleClick = () => {
    // Open the book details page in a new tab
    window.open(`/product/${id}`, '_blank', 'noopener,noreferrer');
  };

  const formattedPrice = parseFloat(book_price).toFixed(2);
  const discount_price = discounts && discounts.length > 0 ? discounts[0].discount_price : null;
  const discount_percentage = discounts && discounts.length > 0 ? discounts[0].discount_percentage : null;

  return (
    <div
      onClick={handleClick}
      className="flex flex-col h-full rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white cursor-pointer"
      role="button"
      aria-label={`View details for ${book_title} in a new tab`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()} // Keyboard accessibility
    >
      <div className="relative w-full pb-[75%] overflow-hidden group">
        <img
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={book_cover_photo}
          alt={book_title}
        />
        {discount_percentage && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium">
            {discount_percentage}% OFF
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h1 className="font-bold text-xl text-gray-800 line-clamp-2">{book_title}</h1>
        <h2 className="mt-2 font-light text-sm text-gray-600 line-clamp-3">{book_summary}</h2>
      </div>

      <div className="px-5 pb-4 mt-auto">
        <div className="flex items-center">
          {discount_price ? (
            <>
              <span className="text-lg font-bold text-red-600 mr-2">${discount_price}</span>
              <span className="text-gray-400 line-through mr-2">${formattedPrice}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-800">${formattedPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}