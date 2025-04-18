import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileMenu]);

  return (
    <div className="absolute top-0 left-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent">
        <img src={assets.logo} alt="" />

        <ul className="hidden md:flex items-center gap-7 text-white ml-auto">
          <Link to="/" className="cursor-pointer hover:text-gray-400">
            Home
          </Link>
          <Link to="/about" className="cursor-pointer hover:text-gray-400">
            About
          </Link>
          <Link to="/shop" className="cursor-pointer hover:text-gray-400">
            Shop
          </Link>
          <button className="hidden md:block bg-white text-black px-8 py-2 rounded-full">
          <Link to="/login" className="cursor-pointer hover:text-gray-400">
            Login
          </Link>
          </button>
        </ul>

        <img
          onClick={() => setShowMobileMenu(true)}
          src={assets.menu_icon}
          className="md:hidden w-7"
          alt=""
        />
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${
          showMobileMenu ? "fixed w-full" : "h-0 w-0"
        } bg-white transition-all right-0 top-0 bottom-0 overflow-hidden`}
      >
        <div className="flex justify-end p-6 cursor-pointer">
          <img
            onClick={() => setShowMobileMenu(false)}
            src={assets.cross_icon}
            className="w-6"
            alt=""
          />
        </div>
        <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
          <Link
            onClick={() => setShowMobileMenu(false)}
            to="/"
            className="px-4 py-2 rounded-full inline-block"
          >
            Home
          </Link>
          <Link
            onClick={() => setShowMobileMenu(false)}
            to="/about"
            className="px-4 py-2 rounded-full inline-block"
          >
            About
          </Link>
          <Link
            onClick={() => setShowMobileMenu(false)}
            to="/projects"
            className="px-4 py-2 rounded-full inline-block"
          >
            Projects
          </Link>
        </ul>
      </div>
    </div>
  );
}
