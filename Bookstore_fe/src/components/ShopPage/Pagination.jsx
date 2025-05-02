import React from 'react';

const Pagination = () => {
  const pages = [1, 2, 3]; // Example page numbers
  const activePage = 2; // Example active page

  return (
    <div className="flex items-center space-x-2">
      {/* Previous Button */}
      <button
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        disabled={activePage === 1} // Disable if on the first page
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          className={`px-4 py-2 rounded ${
            activePage === page
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        disabled={activePage === pages.length} // Disable if on the last page
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
