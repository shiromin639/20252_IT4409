import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, refreshCart, setView, showNotification, setLoading, loading } = useApp();

  const handleUpdateQuantity = async (productId: number, newQty: number, maxQty: number) => {
    if (newQty < 1) return;
    if (newQty > maxQty) {
      showNotification(`Only ${maxQty} items available in stock.`, 'error');
      return;
    }
    setLoading(true);
    try {
      await api.updateCartItem(productId, newQty);
      await refreshCart();
      showNotification('Cart updated!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update quantity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (cartItemId: number) => {
    setLoading(true);
    try {
      await api.deleteCartItem(cartItemId);
      await refreshCart();
      showNotification('Item removed from cart', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    setLoading(true);
    try {
      await api.clearCart();
      await refreshCart();
      showNotification('Cart cleared', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to clear cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
          <ShoppingBag size={48} color="var(--text-muted)" />
        </div>
        <h2 style={{ marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Looks like you haven't added anything to your cart yet.</p>
        <button className="primary" onClick={() => setView('products')}>
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>Your Shopping Cart</h1>
        <button className="danger" onClick={handleClearCart} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={16} /> Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Side: Cart Items List */}
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item: any) => (
                <tr key={item.cartItemId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={item.product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'}
                          alt={item.product?.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.product?.productName}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Stock: {item.product?.quantity}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatMoney(item.productPrice)}</td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '6px' }}>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.productId, item.quantity - 1, item.product.quantity)}
                        style={{ background: 'transparent', padding: '6px 10px', color: 'white' }}
                        disabled={loading}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 8px', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.productId, item.quantity + 1, item.product.quantity)}
                        style={{ background: 'transparent', padding: '6px 10px', color: 'white' }}
                        disabled={loading}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatMoney(item.subTotal)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="danger"
                      onClick={() => handleDeleteItem(item.cartItemId)}
                      style={{ padding: '8px', borderRadius: '6px' }}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="glass-panel" style={{ height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Order Summary</h2>
          
          <div style={{ height: '1px', background: 'var(--panel-border)' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>{formatMoney(cart.totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--panel-border)' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '20px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{formatMoney(cart.totalPrice)}</span>
          </div>

          <button className="primary" onClick={() => setView('checkout')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>
          
          <button className="outline" onClick={() => setView('products')} style={{ width: '100%' }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
