import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, LogOut, Shield, Package, LogIn, User } from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, setUser, view, setView, cart, showNotification } = useApp();

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setView('products');
      showNotification('Logged out successfully', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Logout failed', 'error');
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const cartCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <nav className="navbar">
      <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => setView('products')}>
        <Package size={24} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
        <span style={{ fontWeight: 'bold', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TechShop</span>
      </div>

      <div className="nav-links">
        <div className={`nav-item ${view === 'products' ? 'active' : ''}`} onClick={() => setView('products')}>
          Shop
        </div>

        {user ? (
          <>
            <div className={`nav-item ${view === 'my-orders' ? 'active' : ''}`} onClick={() => setView('my-orders')}>
              My Orders
            </div>
            
            {isAdmin && (
              <div className={`nav-item ${view === 'admin-dashboard' ? 'active' : ''}`} onClick={() => setView('admin-dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={16} /> Admin Panel
              </div>
            )}

            <div className={`nav-item ${view === 'cart' ? 'active' : ''}`} onClick={() => setView('cart')} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShoppingCart size={18} /> Cart
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                  {cartCount}
                </span>
              )}
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--panel-border)' }}></div>
            
            <div
              className={`nav-item ${view === 'profile' ? 'active' : ''}`}
              onClick={() => setView('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={16} />
              <span style={{ fontSize: '14px' }}>{user.username}</span>
            </div>
            
            <button className="outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <>
            <button className="outline" onClick={() => setView('login')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogIn size={14} /> Sign In / Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
