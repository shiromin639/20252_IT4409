import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ title, items, linkText, linkTo = '/products' }) => {
  return (
    <div className="bg-white p-4 z-10 flex flex-col h-100">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>

      <div className="grid grid-cols-2 gap-4 flex-1 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col cursor-pointer group">
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-2 mb-2">
              <img
                src={item.image}
                alt={item.name}
                className="max-h-24 object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-xs text-gray-800">{item.name}</span>
          </div>
        ))}
      </div>

      <Link to={linkTo} className="text-sm text-blue-700 hover:text-red-700 hover:underline">
        {linkText}
      </Link>
    </div>
  );
};

export default CategoryCard;