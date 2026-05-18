import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const Cart = () => {
  const { cartItems } = useCart();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
