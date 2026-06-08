import { useState } from 'react';
import {
  CreditCard,
  LogOut,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/products', label: 'Sản phẩm', icon: ShoppingBag },
  { path: '/cart', label: 'Giỏ hàng', icon: ShoppingCart },
  { path: '/checkout', label: 'Thanh toán', icon: CreditCard },
  { path: '/orders', label: 'Đơn hàng', icon: PackageCheck },
];

function Header({ cartCount, currentPath, filters, logout, navigate, setFilters, user }) {
  const [query, setQuery] = useState(filters.search);

  function handleSubmit(event) {
    event.preventDefault();
    setFilters((current) => ({ ...current, search: query }));
    navigate('/products');
  }

  return (
    <header className="topbar">
      <div className="brand-block">
        <button className="brand-mark" type="button" onClick={() => navigate('/')}>
          TM
        </button>
        <div>
          <strong>TechMall</strong>
          <span>Frontend test</span>
        </div>
      </div>

      <form className="top-search" onSubmit={handleSubmit}>
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm sản phẩm, SKU, thương hiệu"
        />
        {query && (
          <button className="icon-button subtle" type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery('')}>
            <X size={16} />
          </button>
        )}
      </form>

      <nav className="view-tabs" aria-label="Luồng mua hàng">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              className={active ? 'tab-button active' : 'tab-button'}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.path === '/cart' && cartCount > 0 && <b>{cartCount}</b>}
            </button>
          );
        })}
      </nav>

      <div className="account-actions">
        {user ? (
          <>
            <button className="account-button" type="button" onClick={() => navigate('/profile')}>
              <User size={17} />
              <span>{user.fullName}</span>
            </button>
            <button className="icon-button subtle" type="button" aria-label="Đăng xuất" onClick={logout}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button className="account-button" type="button" onClick={() => navigate('/login')}>
            <User size={17} />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
