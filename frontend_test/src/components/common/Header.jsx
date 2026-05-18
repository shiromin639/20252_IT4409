import React, { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        <Link to="/" className="text-2xl font-extrabold tracking-wider">
          MINI<span className="text-yellow-300">SHOP</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-3xl hidden md:flex rounded-sm overflow-hidden bg-white">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-gray-800 px-4 py-2 outline-none text-sm"
          />
          <button type="submit" className="bg-blue-800 hover:bg-blue-900 px-6 flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="cursor-pointer">Xin chào, {user.name}</span>
              <button onClick={logout} className="text-yellow-300 hover:text-yellow-200 text-xs">Đăng xuất</button>
            </div>
          ) : (
            <Link to="/login" className="hidden lg:block text-sm cursor-pointer hover:text-gray-200">
              Đăng nhập / Đăng ký
            </Link>
          )}
          <Link to="/cart" className="relative cursor-pointer group">
            <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-blue-600">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;