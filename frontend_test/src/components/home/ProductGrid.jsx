import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../data';
import ProductCard from '../common/ProductCard';

const ProductGrid = ({ title = "Gợi Ý Hôm Nay" }) => {
  const displayedProducts = [...products, ...products];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayedProducts.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.image}
                  sold={product.sold}
                />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/products" className="px-8 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
          Xem thêm sản phẩm
        </Link>
      </div>
    </div>
  );
};

export default ProductGrid;
