import React from 'react';
import { useCart } from '../../context/CartContext';

const OrderSummary = ({ onPlaceOrder, placingOrder }) => {
  const { cartItems, cartTotal, getProduct } = useCart();
  const shipping = cartTotal > 500000 ? 0 : 30000;
  const total = cartTotal + shipping;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 sticky top-24">
      <h2 className="text-lg font-bold text-gray-800">Đơn hàng của bạn</h2>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {cartItems.map((item) => {
          const product = getProduct(item.productId);
          if (!product) return null;
          return (
            <div key={item.productId} className="flex items-center gap-3 text-sm">
              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-400">Ảnh</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 truncate">{product.title}</p>
                <p className="text-gray-500">SL: {item.quantity}</p>
              </div>
              <span className="text-gray-800 font-medium whitespace-nowrap">
                {(product.price * item.quantity).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span>{cartTotal.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')} ₫`}</span>
        </div>
      </div>

      <div className="border-t pt-3 flex justify-between font-bold text-gray-800">
        <span>Tổng thanh toán</span>
        <span className="text-red-600 text-xl">{total.toLocaleString('vi-VN')} ₫</span>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={placingOrder}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {placingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của TechStore
      </p>
    </div>
  );
};

export default OrderSummary;
