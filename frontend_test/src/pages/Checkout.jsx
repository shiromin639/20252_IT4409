import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ShippingForm from '../components/checkout/ShippingForm';
import OrderSummary from '../components/checkout/OrderSummary';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    note: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = () => {
    const { fullName, phone, address } = form;
    if (!fullName || !phone || !address) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ.');
      return;
    }

    setPlacingOrder(true);
    setTimeout(() => {
      clearCart();
      setPlacingOrder(false);
      setOrderSuccess(true);
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center max-w-lg mx-auto">
        <div className="text-6xl mb-4">&#10004;</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 mb-6">Cảm ơn bạn đã mua sắm tại TechStore. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <p className="text-gray-500 text-lg mb-4">Giỏ hàng trống. Không thể thanh toán.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">Quay về trang chủ</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ShippingForm form={form} onChange={handleChange} />
        </div>
        <div>
          <OrderSummary onPlaceOrder={handlePlaceOrder} placingOrder={placingOrder} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
