import React, { useState } from 'react';
import { ShoppingCart, Star, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      <nav className="text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.category}`} className="hover:text-blue-600">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.title}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-yellow-500">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{product.rating}/5</span>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-500">Đã bán {product.sold}</span>
      </div>

      <div className="text-3xl font-bold text-red-600">
        {product.price.toLocaleString('vi-VN')} ₫
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Thương hiệu:</span>
        <Link to={`/products?brand=${product.brand}`} className="text-blue-600 hover:underline font-medium">{product.brand}</Link>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Tình trạng:</span>
        {product.stock > 0 ? (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Check className="w-4 h-4" /> Còn hàng ({product.stock})
          </span>
        ) : (
          <span className="text-red-600 font-medium">Hết hàng</span>
        )}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-medium border-x">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="px-3 py-2 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" /> Đã thêm vào giỏ
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
