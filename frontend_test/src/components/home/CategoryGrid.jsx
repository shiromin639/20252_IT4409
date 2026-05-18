import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data';

const CategoryGrid = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Danh Mục Nổi Bật</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/category/${cat.name}`} className="flex flex-col items-center cursor-pointer group">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-2 group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 border border-gray-100">
              {cat.icon}
            </div>
            <span className="text-sm text-center font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
