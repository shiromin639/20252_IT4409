import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartSummary = () => {
  const { cartTotal, cartItems, clearCart } = useCart();
  const shipping = cartTotal > 500000 ? 0 : 30000;
  const total = cartTotal + shipping;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 sticky top-24">
      <h2 className="text-lg font-bold text-gray-800">Tóm tắt đơn hàng</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính ({cartItems.length} sản phẩm)</span>
          <span>{cartTotal.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')} ₫`}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">Miễn phí vận chuyển cho đơn từ 500.000₫</p>
        )}
      </div>

      <div className="border-t pt-3 flex justify-between font-bold text-gray-800">
        <span>Tổng cộng</span>
        <span className="text-red-600 text-xl">{total.toLocaleString('vi-VN')} ₫</span>
      </div>

      <Link
        to="/checkout"
        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Thanh toán
      </Link>

      <button
        onClick={clearCart}
        className="w-full text-sm text-gray-500 hover:text-red-500 py-2 transition-colors"
      >
        Xóa toàn bộ giỏ hàng
      </button>
    </div>
  );
};

export default CartSummary;
