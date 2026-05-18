import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { getProduct, updateQuantity, removeFromCart } = useCart();
  const product = getProduct(item.productId);

  if (!product) return null;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
      <Link to={`/product/${product.id}`} className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
        <span className="text-xs text-gray-400">Ảnh</span>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2">
          {product.title}
        </Link>
        <p className="text-xs text-gray-500 mt-1">Thương hiệu: {product.brand}</p>
      </div>

      <div className="text-right">
        <p className="text-red-600 font-bold">{product.price.toLocaleString('vi-VN')} ₫</p>
      </div>

      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="px-2 py-1 hover:bg-gray-100 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="px-3 py-1 text-sm font-medium border-x">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="px-2 py-1 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="text-right min-w-[100px]">
        <p className="text-red-600 font-bold text-sm">
          {(product.price * item.quantity).toLocaleString('vi-VN')} ₫
        </p>
      </div>

      <button
        onClick={() => removeFromCart(item.productId)}
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
