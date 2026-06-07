import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ArrowLeft, CreditCard, Tag, Check, AlertCircle, Truck, Shield, MapPin, Plus, ChevronDown, QrCode, Copy, CheckCircle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { refreshCart, setView, showNotification, setSelectedOrderId, user, setLoading, loading } = useApp();

  const [preview, setPreview] = useState<any>(null);
  const [addressMode, setAddressMode] = useState<'saved' | 'custom'>('saved');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [notes, setNotes] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // QR Payment Modal state
  const [qrModal, setQrModal] = useState<{
    show: boolean;
    qrUrl: string;
    orderId: number;
    amount: string;
    description: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'verifying' | 'confirmed' | 'timeout'>('waiting');
  const pollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start polling for payment confirmation
  const startPaymentPolling = (orderId: number) => {
    setPaymentStatus('waiting');

    // Poll every 4 seconds
    pollingRef.current = setInterval(async () => {
      try {
        const order = await api.getOrderDetails(orderId);
        if (order.status !== 'AWAITING_PAYMENT') {
          // Payment confirmed! (status changed to CONFIRMED or beyond)
          setPaymentStatus('confirmed');
          stopPolling();
        }
      } catch {
        // Ignore polling errors
      }
    }, 4000);

    // Timeout after 3 minutes — show hint but keep polling
    timeoutRef.current = setTimeout(() => {
      setPaymentStatus(prev => prev === 'waiting' ? 'timeout' : prev);
    }, 180000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const loadPreview = async (code?: string) => {
    try {
      const res = await api.previewCheckout(code);
      setPreview(res);
      if (code !== undefined) setAppliedVoucher(code || '');
      // Auto-select default address
      if (res.savedAddresses?.length > 0 && !selectedAddressId) {
        const defaultAddr = res.savedAddresses.find((a: any) => a.isDefault) || res.savedAddresses[0];
        setSelectedAddressId(defaultAddr.addressId);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to load checkout preview', 'error');
    }
  };

  const loadVouchers = async () => {
    try { setAvailableVouchers(await api.getAvailableVouchers()); } catch { /* ignore */ }
  };

  useEffect(() => { loadPreview(); loadVouchers(); }, []);

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherLoading(true);
    try { await loadPreview(voucherCode.trim()); } finally { setVoucherLoading(false); }
  };

  const handleSelectVoucher = async (code: string) => {
    setVoucherCode(code);
    setShowVoucherList(false);
    setVoucherLoading(true);
    try { await loadPreview(code); } finally { setVoucherLoading(false); }
  };

  const handleRemoveVoucher = async () => {
    setVoucherCode('');
    setAppliedVoucher('');
    await loadPreview('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addressMode === 'saved' && !selectedAddressId) {
      showNotification('Please select a shipping address', 'error');
      return;
    }
    if (addressMode === 'custom' && !shippingAddress.trim()) {
      showNotification('Please enter your shipping address', 'error');
      return;
    }
    setLoading(true);
    try {
      const data: any = {
        paymentMethod,
        voucherCode: (appliedVoucher && preview?.voucherValid) ? appliedVoucher : null,
        notes,
      };
      if (addressMode === 'saved') {
        data.addressId = selectedAddressId;
      } else {
        data.shippingAddress = shippingAddress;
        data.phoneNumber = phoneNumber;
      }
      const order = await api.confirmCheckout(data);
      await refreshCart();

      // If SEPAY: show QR payment modal and start polling
      if (paymentMethod === 'SEPAY' && order.paymentUrl) {
        setQrModal({
          show: true,
          qrUrl: order.paymentUrl,
          orderId: order.orderId,
          amount: formatMoney(order.totalPrice),
          description: 'DH' + order.orderId,
        });
        startPaymentPolling(order.orderId);
      } else {
        showNotification('Order placed successfully! 🎉', 'success');
        setSelectedOrderId(order.orderId);
        setView('my-orders');
      }
    } catch (err: any) {
      showNotification(err.message || 'Checkout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Manual verify — user clicks "I've paid"
  const handleManualVerify = async () => {
    if (!qrModal) return;
    setPaymentStatus('verifying');
    try {
      const order = await api.getOrderDetails(qrModal.orderId);
      if (order.status !== 'AWAITING_PAYMENT') {
        setPaymentStatus('confirmed');
        stopPolling();
      } else {
        setPaymentStatus('waiting');
        showNotification('Payment not received yet. Please complete the transfer and wait.', 'error');
      }
    } catch {
      setPaymentStatus('waiting');
      showNotification('Could not verify payment. Please wait...', 'error');
    }
  };

  const handlePaymentComplete = () => {
    if (qrModal) {
      setSelectedOrderId(qrModal.orderId);
    }
    stopPolling();
    setQrModal(null);
    showNotification('Payment confirmed! 🎉', 'success');
    setView('my-orders');
  };

  const handleCancelPayment = () => {
    stopPolling();
    setQrModal(null);
    setPaymentStatus('waiting');
    showNotification('You can pay later from My Orders page', 'info');
    setView('my-orders');
  };

  const formatMoney = (amount: any) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);

  if (!preview) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <span className="loader loader-lg" />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading checkout...</span>
      </div>
    );
  }

  const voucherApplied = appliedVoucher && preview.voucherValid;
  const savings = Number(preview.voucherDiscount) || 0;
  const savedAddresses = preview.savedAddresses || [];

  return (
    <div className="animate-fade-in">
      <button className="ghost" onClick={() => setView('cart')} style={{ marginBottom: '28px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h1 style={{ marginBottom: '28px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Delivery Info */}
          <div className="glass-panel">
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="var(--primary)" /> Delivery Details
            </h2>

            {/* Address Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={addressMode === 'saved' ? 'primary' : 'outline'}
                onClick={() => setAddressMode('saved')}
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
              >
                <MapPin size={14} /> Saved Addresses
              </button>
              <button
                type="button"
                className={addressMode === 'custom' ? 'primary' : 'outline'}
                onClick={() => setAddressMode('custom')}
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
              >
                <Plus size={14} /> Type Address
              </button>
            </div>

            <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {addressMode === 'saved' ? (
                <div>
                  {savedAddresses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {savedAddresses.map((addr: any) => (
                        <label
                          key={addr.addressId}
                          style={{
                            display: 'flex', gap: '14px', alignItems: 'center',
                            padding: '14px 16px',
                            background: selectedAddressId === addr.addressId ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${selectedAddressId === addr.addressId ? 'rgba(99,102,241,0.3)' : 'var(--panel-border)'}`,
                            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.addressId}
                            onChange={() => setSelectedAddressId(addr.addressId)}
                            style={{ width: 'auto', accentColor: 'var(--primary)' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px' }}>{addr.label}</span>
                              {addr.isDefault && <span className="badge success" style={{ fontSize: '9px' }}>Default</span>}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{addr.recipientName} · {addr.phoneNumber}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{addr.fullAddress}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-subtle)', fontSize: '14px' }}>
                      No saved addresses. <button type="button" className="ghost" style={{ color: 'var(--primary)' }} onClick={() => setAddressMode('custom')}>Type an address</button> or <button type="button" className="ghost" style={{ color: 'var(--primary)' }} onClick={() => setView('profile')}>add one in profile</button>.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Shipping Address <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input type="text" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required placeholder="e.g. 123 Đường ABC, Quận 1, TP.HCM" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Phone</label>
                    <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="e.g. 0901234567" />
                  </div>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="COD">💵 Cash on Delivery</option>
                    <option value="SEPAY">🏦 Bank Transfer (SePay)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Notes (Optional)</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Delivery instructions..." />
                </div>
              </div>
            </form>
          </div>

          {/* Voucher */}
          <div className="glass-panel">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="var(--warning)" /> Voucher Code
            </h3>

            {voucherApplied ? (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '14px' }}>
                  <Check size={16} />
                  <strong>{appliedVoucher}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>— {preview.voucherMessage}</span>
                </div>
                <button className="ghost" style={{ color: 'var(--danger)', fontSize: '12px' }} onClick={handleRemoveVoucher}>
                  Remove
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleApplyVoucher} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="outline" disabled={voucherLoading || !voucherCode.trim()}>
                    {voucherLoading ? <span className="loader" /> : 'Apply'}
                  </button>
                  <button type="button" className="outline" onClick={() => setShowVoucherList(!showVoucherList)}>
                    <ChevronDown size={14} />
                  </button>
                </form>

                {/* Available vouchers dropdown */}
                {showVoucherList && availableVouchers.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {availableVouchers.map((v: any) => (
                      <div
                        key={v.voucherId}
                        onClick={() => handleSelectVoucher(v.code)}
                        style={{
                          padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--panel-border)', borderRadius: '8px',
                          cursor: 'pointer', transition: 'all 0.15s', fontSize: '13px',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--panel-border)')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--primary)' }}>{v.code}</strong>
                          <span className="badge warning" style={{ fontSize: '10px' }}>
                            {v.discountType === 'PERCENTAGE' ? `${v.discountValue}% OFF` : `${formatMoney(v.discountValue)} OFF`}
                          </span>
                        </div>
                        {v.description && <div style={{ color: 'var(--text-subtle)', marginTop: '4px' }}>{v.description}</div>}
                        <div style={{ color: 'var(--text-subtle)', fontSize: '12px', marginTop: '2px' }}>Min order: {formatMoney(v.minOrderValue)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {appliedVoucher && !preview.voucherValid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', color: 'var(--danger)', fontSize: '13px' }}>
                <AlertCircle size={14} /> {preview.voucherMessage || 'Invalid voucher code'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '80px' }}>
          <div className="glass-panel">
            <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto' }}>
              {preview.items?.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.productName || `Item #${i + 1}`}</span>
                    <span style={{ color: 'var(--text-subtle)', marginLeft: '6px' }}>×{item.quantity}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                    {formatMoney(Number(item.productPrice || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider" style={{ marginBottom: '16px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatMoney(preview.subTotal)}</span>
              </div>
              {savings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Voucher Discount</span>
                  <span>-{formatMoney(savings)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
            </div>

            <div className="divider" style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '20px', marginBottom: '20px' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatMoney(preview.totalPrice)}</span>
            </div>

            {savings > 0 && (
              <div style={{
                padding: '10px 14px', background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px',
                fontSize: '13px', color: 'var(--success)', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <Check size={14} /> You save {formatMoney(savings)} with this order!
              </div>
            )}

            <button
              form="checkout-form"
              type="submit"
              className="primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? <span className="loader" /> : <>
                <CreditCard size={17} /> Place Order — {formatMoney(preview.totalPrice)}
              </>}
            </button>

            {paymentMethod === 'SEPAY' && (
              <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '12px', marginTop: '10px' }}>
                You'll receive a QR code to complete payment
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '12px', color: 'var(--text-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={13} color="var(--success)" /> Secure checkout
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={13} color="var(--primary)" /> Free delivery
            </span>
          </div>
        </div>
      </div>

      {/* ==========================================
          QR PAYMENT MODAL
          ========================================== */}
      {qrModal && qrModal.show && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <div className="glass-panel" style={{
            maxWidth: '480px', width: '90%', textAlign: 'center',
            padding: '36px 32px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
          }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
              }}>
                <QrCode size={28} color="white" />
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: '22px' }}>Scan to Pay</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                Order #{qrModal.orderId}
              </p>
            </div>

            {/* QR Code Image */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '16px',
              display: 'inline-block', marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              <img
                src={qrModal.qrUrl}
                alt="SePay QR Payment"
                style={{ width: '260px', height: '260px', display: 'block' }}
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div style="width:260px;height:260px;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px">QR failed to load. Use details below.</div>';
                }}
              />
            </div>

            {/* Payment Details */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--panel-border)',
              borderRadius: '12px', padding: '16px', marginBottom: '20px',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '18px' }}>{qrModal.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transfer Content</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{
                    fontWeight: 700, fontSize: '16px', color: 'var(--warning)',
                    background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '6px',
                  }}>
                    {qrModal.description}
                  </code>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => handleCopyContent(qrModal.description)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    title="Copy"
                  >
                    {copied ? <CheckCircle size={16} color="var(--success)" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* CONFIRMED STATE */}
            {paymentStatus === 'confirmed' ? (
              <div className="animate-fade-in">
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '2px solid var(--success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <CheckCircle size={32} color="var(--success)" />
                </div>
                <h3 style={{ color: 'var(--success)', margin: '0 0 8px' }}>Payment Confirmed!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                  Your payment has been received. Order #{qrModal.orderId} is now being processed.
                </p>
                <button
                  className="primary"
                  onClick={handlePaymentComplete}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                >
                  Go to My Orders →
                </button>
              </div>
            ) : (
              /* WAITING / VERIFYING STATE */
              <>
                {/* Status indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '12px', marginBottom: '16px',
                  background: paymentStatus === 'timeout' ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.06)',
                  border: `1px solid ${paymentStatus === 'timeout' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.15)'}`,
                  borderRadius: '10px',
                }}>
                  {paymentStatus === 'verifying' ? (
                    <>
                      <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verifying payment...</span>
                    </>
                  ) : paymentStatus === 'timeout' ? (
                    <>
                      <AlertCircle size={16} color="var(--warning)" />
                      <span style={{ fontSize: '13px', color: 'var(--warning)' }}>Payment not yet received. Still listening...</span>
                    </>
                  ) : (
                    <>
                      <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Waiting for payment confirmation...</span>
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div style={{
                  fontSize: '12px', color: 'var(--text-subtle)',
                  marginBottom: '20px', lineHeight: '1.8',
                }}>
                  <p style={{ margin: '0 0 4px' }}>1. Open your banking app and scan the QR code</p>
                  <p style={{ margin: '0 0 4px' }}>2. Ensure the transfer content is <strong style={{ color: 'var(--warning)' }}>{qrModal.description}</strong></p>
                  <p style={{ margin: 0 }}>3. This page will update automatically when payment is received</p>
                </div>

                {/* Manual verify button */}
                <button
                  className="outline"
                  onClick={handleManualVerify}
                  disabled={paymentStatus === 'verifying'}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', marginBottom: '12px' }}
                >
                  {paymentStatus === 'verifying'
                    ? <><span className="loader" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Checking...</>
                    : <><Check size={15} /> I've completed the transfer</>
                  }
                </button>

                {/* Cancel / pay later */}
                <button
                  type="button"
                  className="ghost"
                  onClick={handleCancelPayment}
                  style={{ fontSize: '12px', color: 'var(--text-subtle)', width: '100%', justifyContent: 'center' }}
                >
                  Cancel & pay later from My Orders
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
