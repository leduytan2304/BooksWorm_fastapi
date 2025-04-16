import React from "react";
import { assets, projectsData } from "../assets/assets";
import { PlayIcon } from "@heroicons/react/24/solid";

const Feature = () => {
  const visibleProjects = projectsData.slice(0, 8); // Just show 8 books

  return (
    <div className="container mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full ">
      {/* Title */}
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Featured Books</h1>
      </div>

      {/* Static Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        <button className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200">
          Recommend
        </button>
        <button className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200">
          Popular
        </button>
      </div>

      {/* Grid of 8 Books */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8  p-8 border-2 border-gray-500 box-border ">
        {visibleProjects.map((project, index) => (
          <div key={index} className="relative">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-auto mb-14"
            />
            <div className="absolute left-0 right-0 bottom-5 flex justify-center">
              <div className="inline-block bg-white w-3/4 px-4 py-2 shadow-md">
                <h2 className="text-xl sm:text-lg md:text-xl font-semibold text-gray-800 text-center">
                  {project.title}
                </h2>
                <p className="text-gray-500 text-sm text-center">
                  {project.price} <span className="mx-1">|</span> {project.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feature;
