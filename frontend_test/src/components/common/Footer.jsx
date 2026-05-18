import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="font-bold text-gray-800 mb-4 text-lg block">TechStore</Link>
          <p className="text-sm text-gray-600 mb-2">
            Hệ thống bán lẻ laptop, PC và phụ kiện công nghệ hàng đầu.
          </p>
          <p className="text-sm text-gray-600">Hotline: 1800 1234</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Về chúng tôi</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              <Link to="/products" className="hover:text-blue-600">
                Sản phẩm
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Hệ thống cửa hàng
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Chính sách</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              <a href="#" className="hover:text-blue-600">
                Chính sách bảo hành
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Chính sách đổi trả
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Bảo mật thông tin
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Đăng ký nhận tin</h3>
          <div className="flex">
            <input
              type="email"
              placeholder="Email của bạn"
              className="border px-3 py-2 rounded-l-lg w-full text-sm focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-blue-700">
              Gửi
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        © 2026 TechStore. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;
