import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Search, ShoppingCart, Zap, Star, TrendingUp, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const Products: React.FC = () => {
  const { setSelectedProduct, setView, categories, showNotification, refreshCart, user, setLoading, loading } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('productId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Typeahead state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<any>(null);

  const fetchProducts = async (kw = keyword, cat = selectedCategory, sb = sortBy, so = sortOrder) => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        keyword: kw || undefined,
        category: cat || undefined,
        sortBy: sb,
        sortOrder: so,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setProducts(res.content || []);
    } catch (err: any) {
      showNotification(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, sortOrder]);

  // Live search suggestions (debounced)
  const handleSearchInput = (value: string) => {
    setKeyword(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await api.getSearchSuggestions(value.trim());
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSuggestionClick = (product: any) => {
    setShowSuggestions(false);
    setSelectedProduct(product);
    setView('product-detail');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchProducts();
  };

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName === selectedCategory ? '' : catName);
  };

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showNotification('Please sign in to add items to cart', 'error');
      setView('login');
      return;
    }
    try {
      await api.addToCart(productId, 1);
      await refreshCart();
      showNotification('Added to cart!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to add to cart', 'error');
    }
  };

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setView('product-detail');
  };

  const handleApplyPriceFilter = () => {
    fetchProducts();
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '20px',
        padding: '48px 40px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '300px', height: '300px',
          borderRadius: '50%', background: 'rgba(99,102,241,0.08)', pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={16} color="var(--warning)" />
            <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 600 }}>NEW ARRIVALS & HOT DEALS</span>
          </div>
          <h1 style={{ marginBottom: '12px', fontSize: '2.8rem', lineHeight: 1.2 }}>
            Premium Tech,<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Great Prices
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', lineHeight: 1.7, marginBottom: '24px' }}>
            Explore the best hardware, peripherals, and accessories. Curated and reviewed for quality.
          </p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} color="var(--warning)" /> Top-rated products</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={14} color="var(--success)" /> Free shipping</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel" style={{ marginBottom: '28px', padding: '20px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }} ref={suggestionsRef}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={e => handleSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                style={{ paddingLeft: '42px' }}
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: 'rgba(18,18,28,0.98)', backdropFilter: 'blur(20px)',
                  border: '1px solid var(--panel-border)', borderRadius: '10px',
                  marginTop: '4px', maxHeight: '340px', overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  {suggestions.map((s: any) => (
                    <div
                      key={s.productId}
                      onClick={() => handleSuggestionClick(s)}
                      style={{
                        display: 'flex', gap: '12px', alignItems: 'center',
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.03)' }}>
                        <img src={s.image?.startsWith('http') ? s.image : 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=100'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.productName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{s.categoryName}</div>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '13px', flexShrink: 0 }}>
                        {formatMoney(s.specialPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ width: '180px' }}>
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.categoryId} value={cat.categoryName}>{cat.categoryName}</option>
              ))}
            </select>
            <select value={`${sortBy}-${sortOrder}`} onChange={e => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }} style={{ width: '180px' }}>
              <option value="productId-asc">Oldest First</option>
              <option value="productId-desc">Newest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <button type="button" className="outline" onClick={() => setShowFilters(!showFilters)} style={{ padding: '11px' }}>
              <SlidersHorizontal size={16} />
            </button>
            <button type="submit" className="primary" style={{ padding: '11px 24px' }}>
              Search
            </button>
          </div>
        </form>

        {/* Price range filter */}
        {showFilters && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--panel-border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>Price Range:</span>
            <input type="number" placeholder="Min (VND)" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: '150px' }} min={0} />
            <span style={{ color: 'var(--text-subtle)' }}>—</span>
            <input type="number" placeholder="Max (VND)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: '150px' }} min={0} />
            <button type="button" className="outline" onClick={handleApplyPriceFilter} style={{ padding: '9px 16px', fontSize: '13px' }}>
              Apply
            </button>
            <button type="button" className="ghost" onClick={() => { setMinPrice(''); setMaxPrice(''); fetchProducts(); }} style={{ fontSize: '13px' }}>
              Clear
            </button>
          </div>
        )}

        {/* Category pills */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--panel-border)' }}>
            <button
              type="button"
              className={selectedCategory === '' ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory('')}
              style={{ padding: '5px 14px', fontSize: '13px', borderRadius: '100px' }}
            >
              All
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.categoryId}
                type="button"
                className={selectedCategory === cat.categoryName ? 'primary' : 'outline'}
                onClick={() => handleCategoryClick(cat.categoryName)}
                style={{ padding: '5px 14px', fontSize: '13px', borderRadius: '100px' }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div style={{ color: 'var(--text-subtle)', fontSize: '13px', marginBottom: '16px' }}>
          Showing <strong style={{ color: 'var(--text-muted)' }}>{products.length}</strong> products
          {selectedCategory && <> in <strong style={{ color: 'var(--primary)' }}>{selectedCategory}</strong></>}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <span className="loader loader-lg"></span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading products...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
          {products.map((product: any) => {
            const hasDiscount = product.discount > 0;
            const isOutOfStock = product.quantity <= 0;
            return (
              <div key={product.productId} className="product-card" onClick={() => handleViewDetails(product)}>
                <div className="product-img-wrap" style={{ position: 'relative' }}>
                  <img
                    className="product-img"
                    src={product.image?.startsWith('http') ? product.image : 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&auto=format&fit=crop&q=80'}
                    alt={product.productName}
                    onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&auto=format&fit=crop&q=80'; }}
                  />
                  {hasDiscount && (
                    <span className="badge danger" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                      -{product.discount}% OFF
                    </span>
                  )}
                  {isOutOfStock && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="badge danger" style={{ fontSize: '12px', padding: '6px 14px' }}>Out of Stock</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                  <div>
                    <h3 className="truncate-2" style={{ fontSize: '15px', marginBottom: '4px', lineHeight: 1.4 }}>
                      {product.productName}
                    </h3>
                    <p className="truncate-2" style={{ color: 'var(--text-subtle)', fontSize: '13px', lineHeight: 1.5 }}>
                      {product.description || 'Premium quality product'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatMoney(Number(product.specialPrice) || Number(product.price))}
                    </span>
                    {hasDiscount && (
                      <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-subtle)' }}>
                        {formatMoney(Number(product.price))}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      className="primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '13px', padding: '9px' }}
                      disabled={isOutOfStock}
                      onClick={(e) => handleAddToCart(product.productId, e)}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                    <button
                      className="outline"
                      style={{ padding: '9px 12px' }}
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(product); }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px' }}>
              <Search size={48} color="var(--text-subtle)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>No products found</h3>
              <p style={{ color: 'var(--text-subtle)', fontSize: '14px' }}>Try adjusting your search or filter</p>
              <button className="outline" onClick={() => { setKeyword(''); setSelectedCategory(''); setMinPrice(''); setMaxPrice(''); fetchProducts('', ''); }} style={{ marginTop: '16px' }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
