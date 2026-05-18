import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../data';
import ProductCard from '../common/ProductCard';

const FlashSale = () => {
  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-1 rounded-xl shadow-sm">
      <div className="bg-white p-4 rounded-lg h-full w-full">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-red-600 italic">⚡ FLASH SALE</h2>
            <div className="hidden md:flex space-x-1">
              <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">02</span>
              <span className="font-bold">:</span>
              <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">45</span>
              <span className="font-bold">:</span>
              <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">30</span>
            </div>
          </div>
        <Link to="/products" className="text-sm text-red-600 hover:underline font-medium">
          Xem tất cả deal &gt;
        </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => (
            <div key={`flash-${product.id}`} className="relative border border-red-100 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 z-10 rounded-bl-lg">
                -15%
              </div>
              <ProductCard
                id={product.id}
                title={product.title}
                price={product.price * 0.85}
                imageUrl={product.image}
                sold={product.sold}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashSale;
