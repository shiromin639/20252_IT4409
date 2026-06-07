import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ArrowLeft, ShoppingCart, Minus, Plus, Check, Star, ChevronDown } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { selectedProduct, setView, showNotification, refreshCart, user } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Ratings state
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [showAllRatings, setShowAllRatings] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      api.getProductRatingSummary(selectedProduct.productId)
        .then(setRatingSummary)
        .catch(() => {});
      api.getProductRatings(selectedProduct.productId, 0, 5)
        .then(res => setRatings(res.content || []))
        .catch(() => {});
    }
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <button className="outline" onClick={() => setView('products')} style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Shop
        </button>
        <p style={{ color: 'var(--text-muted)' }}>No product selected.</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      showNotification('Please sign in to add items to cart', 'error');
      setView('login');
      return;
    }
    setAdding(true);
    try {
      await api.addToCart(selectedProduct.productId, quantity);
      await refreshCart();
      showNotification('Added to cart!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const hasDiscount = selectedProduct.discount > 0;
  const price = Number(selectedProduct.specialPrice) || Number(selectedProduct.price);
  const originalPrice = Number(selectedProduct.price);
  const inStock = selectedProduct.quantity > 0;

  return (
    <div className="animate-fade-in">
      <button className="ghost" onClick={() => setView('products')} style={{ marginBottom: '28px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Shop
      </button>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '480px' }}>
          {/* Left: Image */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px', borderRight: '1px solid var(--panel-border)',
            position: 'relative',
          }}>
            {hasDiscount && (
              <span className="badge danger" style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '13px' }}>
                -{selectedProduct.discount}% OFF
              </span>
            )}
            <img
              src={selectedProduct.image?.startsWith('http') ? selectedProduct.image : 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=700&auto=format&fit=crop&q=80'}
              alt={selectedProduct.productName}
              style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '12px' }}
              onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=700&auto=format&fit=crop&q=80'; }}
            />
          </div>

          {/* Right: Info */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <span className="badge info" style={{ marginBottom: '12px' }}>Product Detail</span>
              <h1 style={{ fontSize: '1.8rem', lineHeight: 1.3, marginBottom: '12px' }}>{selectedProduct.productName}</h1>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '14px' }}>
                {selectedProduct.description || 'Premium quality product, carefully selected for our catalog.'}
              </p>
            </div>

            {/* Rating Summary */}
            {ratingSummary && ratingSummary.totalRatings > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(ratingSummary.averageRating) ? '#fbbf24' : 'transparent'} color={s <= Math.round(ratingSummary.averageRating) ? '#fbbf24' : 'var(--text-subtle)'} />
                  ))}
                </div>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{ratingSummary.averageRating}</span>
                <span style={{ color: 'var(--text-subtle)', fontSize: '13px' }}>({ratingSummary.totalRatings} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatMoney(price)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '16px', textDecoration: 'line-through', color: 'var(--text-subtle)' }}>
                  {formatMoney(originalPrice)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Availability</span>
                <span style={{ fontWeight: 600, color: inStock ? 'var(--success)' : 'var(--danger)' }}>
                  {inStock ? `✓ In Stock (${selectedProduct.quantity} left)` : '✗ Out of Stock'}
                </span>
              </div>
              {hasDiscount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Discount</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{selectedProduct.discount}% off</span>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Free shipping on all orders', 'Easy returns within 7 days', 'Genuine product guarantee'].map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Check size={14} color="var(--success)" /> {b}
                </div>
              ))}
            </div>

            {/* Quantity + CTA */}
            {inStock && (
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Quantity</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    border: '1px solid var(--panel-border)', borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 0, color: 'var(--text-muted)' }}
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '10px 20px', fontWeight: 700, fontSize: '16px', minWidth: '50px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(selectedProduct.quantity, q + 1))}
                      style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 0, color: 'var(--text-muted)' }}
                      disabled={quantity >= selectedProduct.quantity}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    className="primary"
                    onClick={handleAddToCart}
                    disabled={adding}
                    style={{ flex: 1, justifyContent: 'center', padding: '11px 24px', fontSize: '15px' }}
                  >
                    {adding ? <span className="loader" /> : <><ShoppingCart size={16} /> Add to Cart</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {ratings.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="var(--warning)" /> Customer Reviews
            </h2>
            {ratingSummary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '18px' }}>{ratingSummary.averageRating}</span>
                <span>/ 5</span>
                <span style={{ color: 'var(--text-subtle)' }}>({ratingSummary.totalRatings} reviews)</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(showAllRatings ? ratings : ratings.slice(0, 3)).map((r: any) => (
              <div key={r.ratingId} className="glass-panel" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px' }}>
                      {r.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.username}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} fill={s <= r.stars ? '#fbbf24' : 'transparent'} color={s <= r.stars ? '#fbbf24' : 'var(--text-subtle)'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{r.comment}</p>
                )}
              </div>
            ))}
            {ratings.length > 3 && !showAllRatings && (
              <button className="outline" onClick={() => setShowAllRatings(true)} style={{ alignSelf: 'center', gap: '6px' }}>
                <ChevronDown size={14} /> Show All Reviews ({ratings.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
