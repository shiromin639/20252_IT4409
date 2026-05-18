import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, title, price, imageUrl, sold }) => {
  return (
    <Link to={`/product/${id}`} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col group cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm text-gray-800 line-clamp-2 min-h-10 mb-2">
          {title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-end justify-between mb-3">
            <span className="text-red-600 font-bold text-lg">
              {price.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs text-gray-500 hidden sm:block">
              Đã bán {sold}
            </span>
          </div>

          <span className="block w-full text-center bg-blue-50 text-blue-600 border border-blue-600 font-medium py-1.5 rounded transition-colors text-sm group-hover:bg-blue-600 group-hover:text-white">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;