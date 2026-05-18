import React from 'react';
import { Link } from 'react-router-dom';

const Banner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl overflow-hidden shadow-sm relative h-48 md:h-80 flex items-center justify-center">
      <div className="text-center text-white z-10 px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Đại Tiệc Laptop - Giảm Đến 50%
        </h1>
        <p className="text-base md:text-xl font-medium drop-shadow mb-6">
          Săn ngay deal hot, rước máy xịn về nhà!
        </p>
        <Link to="/products" className="inline-block px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full hover:bg-yellow-300 transition-transform transform hover:scale-105 shadow-lg">
          Khám Phá Ngay
        </Link>
      </div>
      <div className="absolute inset-0 bg-black opacity-20"></div>
    </div>
  );
};

export default Banner;
