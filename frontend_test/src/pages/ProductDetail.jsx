import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data';
import ProductInfo from '../components/product/ProductInfo';
import ProductSpecs from '../components/product/ProductSpecs';
import RelatedProducts from '../components/product/RelatedProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm.</p>
        <Link to="/" className="text-blue-600 hover:underline">Quay về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl p-6 shadow-sm">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-lg">Hình ảnh sản phẩm</span>
        </div>
        <ProductInfo product={product} />
      </div>

      <ProductSpecs specs={product.specs} />

      <RelatedProducts
        currentProductId={product.id}
        category={product.category}
        brand={product.brand}
      />
    </div>
  );
};

export default ProductDetail;
