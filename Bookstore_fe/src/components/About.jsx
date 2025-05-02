// About.jsx
import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 mt-20 ">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        {/* Header Section */}
        <div className="border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
        </div>

        {/* Main Content Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2  text-center">Welcome to Bookworm</h2>
            <p className="text-gray-600">
              Bookworm is an independent New York bookstore and language school with locations in Manhattan and Brooklyn. We specialize in travel books and language classes.
            </p>
          </div>

          {/* Story and Vision Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Our Story */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Story</h3>
              <p className="text-gray-600">
                The name Bookworm was taken from the original name for New York International Airport, which was renamed JFK in December 1963. Our Manhattan store just celebrated its 75th anniversary. The owner, who is a graduate of nearby Cornell University, has lived in the area since 1970. Avenue South, at the corner of Perry Street. From March 2008 through May 2016, the store was located in the Flatiron District.
              </p>
            </div>

            {/* Our Vision */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                One of the last travel bookstores in the country, our Manhattan store carries a range of guidebooks to suit the needs and tastes of every traveler and budget. We believe that a novel or travelogue can be just as valuable a key to a place as any guidebook or phrasebook. Our dedicated staff is happy to make reading recommendations for any traveler, book-lover, or gift giver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;