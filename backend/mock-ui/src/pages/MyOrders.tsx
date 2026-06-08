import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  RefreshCw, XCircle, QrCode, ArrowLeft, Calendar, MapPin,
  Phone, CreditCard, ChevronRight, Package, Clock, Star, Send
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  PENDING:   { label: 'Pending Payment', badge: 'warning', color: 'var(--warning)' },
  CONFIRMED: { label: 'Confirmed',        badge: 'info',    color: '#38bdf8' },
  SHIPPING:  { label: 'Shipping',         badge: 'primary', color: 'var(--primary)' },
  DELIVERED: { label: 'Delivered',        badge: 'success', color: 'var(--success)' },
  CANCELLED: { label: 'Cancelled',        badge: 'danger',  color: 'var(--danger)' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG['PENDING'];
  return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
};

export const MyOrders: React.FC = () => {
  const { showNotification, setLoading, loading, selectedOrderId } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Rating state
  const [ratingForm, setRatingForm] = useState<{ productId: number; orderId: number; stars: number; comment: string } | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      const list = res || [];
      setOrders(list);
      if (selectedOrderId) {
        const target = list.find((o: any) => o.orderId === selectedOrderId);
        if (target) setSelectedOrder(target);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyOrders(); }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Cancel this order?')) return;
    setLoading(true);
    try {
      await api.cancelOrder(orderId);
      showNotification('Order cancelled', 'success');
      const updated = await api.getOrderDetails(orderId);
      setSelectedOrder(updated);
      fetchMyOrders();
    } catch (err: any) {
      showNotification(err.message || 'Failed to cancel order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQr = async (orderId: number) => {
    setQrLoading(true);
    setQrData(null);
    try {
      const qr = await api.getPaymentQr(orderId);
      setQrData(qr);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load QR code', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingForm) return;
    setRatingLoading(true);
    try {
      await api.submitRating(ratingForm);
      showNotification('Rating submitted! Thank you ⭐', 'success');
      setRatingForm(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit rating', 'error');
    } finally {
      setRatingLoading(false);
    }
  };

  const formatMoney = (amount: any) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  // === ORDER DETAIL VIEW ===
  if (selectedOrder) {
    const isPending = selectedOrder.status?.toUpperCase() === 'PENDING';
    const isSePay = selectedOrder.paymentMethod === 'SEPAY';
    const canRate = selectedOrder.canRate || selectedOrder.status?.toUpperCase() === 'DELIVERED';

    return (
      <div className="animate-fade-in">
        <button className="ghost" onClick={() => { setSelectedOrder(null); setQrData(null); setRatingForm(null); }} style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Order #{selectedOrder.orderId}</h1>
            <div style={{ color: 'var(--text-subtle)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} /> {formatDate(selectedOrder.createdAt)}
            </div>
          </div>
          <StatusBadge status={selectedOrder.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left: Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel">
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="var(--primary)" /> Items Ordered
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', gap: '14px', alignItems: 'center',
                    padding: '12px', background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px', border: '1px solid var(--panel-border)',
                  }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.03)' }}>
                      <img
                        src={item.productImage?.startsWith('http') ? item.productImage : 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=200'}
                        alt={item.productName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=200'; }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{item.productName}</div>
                      <div style={{ color: 'var(--text-subtle)', fontSize: '12px' }}>
                        {item.quantity} × {formatMoney(item.productPrice)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatMoney(item.subTotal)}</div>
                      {canRate && (
                        <button
                          className="ghost"
                          style={{ fontSize: '12px', color: 'var(--warning)', padding: '4px 8px', marginTop: '4px' }}
                          onClick={() => setRatingForm({ productId: item.productId, orderId: selectedOrder.orderId, stars: 5, comment: '' })}
                        >
                          <Star size={12} /> Rate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '280px', marginLeft: 'auto' }}>
                  {Number(selectedOrder.voucherDiscount) > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span>{formatMoney(Number(selectedOrder.totalPrice) + Number(selectedOrder.voucherDiscount))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--success)' }}>
                        <span>Voucher ({selectedOrder.voucherCode})</span>
                        <span>-{formatMoney(selectedOrder.voucherDiscount)}</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>{formatMoney(selectedOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Form */}
            {ratingForm && (
              <div className="glass-panel animate-fade-in">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} color="var(--warning)" /> Rate Product
                </h3>
                <form onSubmit={handleSubmitRating} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRatingForm({ ...ratingForm, stars: s })}
                          style={{ background: 'transparent', padding: '4px', cursor: 'pointer' }}
                        >
                          <Star size={24} fill={s <= ratingForm.stars ? '#fbbf24' : 'transparent'} color={s <= ratingForm.stars ? '#fbbf24' : 'var(--text-subtle)'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Comment (optional)</label>
                    <textarea
                      value={ratingForm.comment}
                      onChange={e => setRatingForm({ ...ratingForm, comment: e.target.value })}
                      placeholder="Share your experience..."
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="outline" onClick={() => setRatingForm(null)}>Cancel</button>
                    <button type="submit" className="primary" disabled={ratingLoading}>
                      {ratingLoading ? <span className="loader" /> : <><Send size={14} /> Submit Rating</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right: Delivery & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3>Delivery & Payment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={17} color="var(--primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '2px' }}>SHIPPING ADDRESS</div>
                    <div style={{ fontWeight: 500 }}>{selectedOrder.shippingAddress}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Phone size={17} color="var(--primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '2px' }}>CONTACT</div>
                    <div style={{ fontWeight: 500 }}>{selectedOrder.phoneNumber || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <CreditCard size={17} color="var(--primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '2px' }}>PAYMENT</div>
                    <div style={{ fontWeight: 500 }}>
                      {selectedOrder.paymentMethod === 'SEPAY' ? '🏦 Bank Transfer (SePay)' : '💵 Cash on Delivery'}
                    </div>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div style={{
                    padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px', border: '1px solid var(--panel-border)',
                    fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic',
                  }}>
                    "{selectedOrder.notes}"
                  </div>
                )}
              </div>

              {isPending && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)' }}>
                  {isSePay && (
                    <button className="primary" onClick={() => handleShowQr(selectedOrder.orderId)} style={{ justifyContent: 'center' }}>
                      {qrLoading ? <span className="loader" /> : <><QrCode size={16} /> Show Payment QR</>}
                    </button>
                  )}
                  <button className="danger" onClick={() => handleCancelOrder(selectedOrder.orderId)} disabled={loading} style={{ justifyContent: 'center' }}>
                    <XCircle size={16} /> Cancel Order
                  </button>
                </div>
              )}
            </div>

            {/* QR Code Panel */}
            {isSePay && qrData && (
              <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <h3>Scan to Pay</h3>
                <div style={{ background: 'white', padding: '14px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                  <img src={qrData.qrUrl} alt="Payment QR" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>
                <div style={{ width: '100%', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <div><span style={{ color: 'var(--text-subtle)' }}>Amount: </span><strong style={{ color: 'var(--primary)' }}>{formatMoney(qrData.amount)}</strong></div>
                  <div><span style={{ color: 'var(--text-subtle)' }}>Description: </span><code style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{qrData.description}</code></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-subtle)' }}>
                  <Clock size={12} /> Waiting for payment confirmation...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === ORDERS LIST VIEW ===
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track and manage your orders</p>
        </div>
        <button className="outline" onClick={fetchMyOrders} disabled={loading} style={{ gap: '6px' }}>
          <RefreshCw size={14} className={loading ? 'loader' : ''} style={loading ? { animation: 'spin 0.7s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <span className="loader loader-lg" />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Package size={56} color="var(--text-subtle)" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-subtle)', fontSize: '14px' }}>Your order history will appear here after your first purchase.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order: any) => (
            <div
              key={order.orderId}
              className="glass-panel"
              onClick={() => setSelectedOrder(order)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                padding: '20px 24px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--panel-border)')}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'rgba(99,102,241,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Package size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Order #{order.orderId}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-subtle)', display: 'flex', gap: '12px' }}>
                    <span>{formatDate(order.createdAt)}</span>
                    <span>·</span>
                    <span>{order.items?.length || 0} item(s)</span>
                    <span>·</span>
                    <span className={`badge ${order.paymentMethod === 'SEPAY' ? 'info' : 'primary'}`} style={{ fontSize: '10px' }}>
                      {order.paymentMethod || 'COD'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <StatusBadge status={order.status} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '16px' }}>{formatMoney(order.totalPrice)}</div>
                </div>
                <ChevronRight size={18} color="var(--text-subtle)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
