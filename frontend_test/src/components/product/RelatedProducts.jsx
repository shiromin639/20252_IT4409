import React from 'react';
import { products } from '../../data';
import ProductCard from '../common/ProductCard';

const RelatedProducts = ({ currentProductId, category, brand }) => {
  const related = products
    .filter((p) => p.id !== currentProductId && (p.category === category || p.brand === brand))
    .slice(0, 6);

  if (related.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {related.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            imageUrl={product.image}
            sold={product.sold}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
