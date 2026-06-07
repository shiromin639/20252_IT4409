import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Plus, Edit, Trash2, Package, FolderOpen, ShoppingBag, Save, X, RefreshCw, ChevronDown, ChevronUp, BarChart2, Ticket, DollarSign, Users, TrendingUp, Upload, ImageIcon } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export const AdminDashboard: React.FC = () => {
  const { categories, refreshCategories, showNotification, setLoading, loading } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'orders' | 'vouchers'>('analytics');

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);

  // Vouchers state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [voucherForm, setVoucherForm] = useState({
    voucherId: null as number | null,
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    usageLimit: 100,
    expiryDate: '',
    description: '',
  });

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productForm, setProductForm] = useState({
    productId: null as number | null,
    productName: '',
    description: '',
    quantity: 1,
    price: 0,
    discount: 0,
    specialPrice: 0,
    categoryId: '' as string | number,
    image: '',
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);


  // Categories state
  const [catForm, setCatForm] = useState({
    categoryId: null as number | null,
    categoryName: '',
    description: '',
  });


  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const loadProducts = async () => {
    try {
      const res = await api.getAdminProducts({ pageSize: 100 });
      setProducts(res.content || []);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load products', 'error');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.getAdminOrders();
      setOrders(res || []);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load orders', 'error');
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await api.getAdminDashboard();
      setAnalytics(res);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load analytics', 'error');
    }
  };

  const loadVouchers = async () => {
    try {
      const res = await api.getAdminVouchers();
      setVouchers(res || []);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load vouchers', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'products') {
      loadProducts();
      refreshCategories();
    } else if (activeTab === 'categories') {
      refreshCategories();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'vouchers') {
      loadVouchers();
    }
  }, [activeTab]);

  // Product Actions
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file (JPEG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image must be smaller than 5MB', 'error');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let savedProductId = productForm.productId;

      if (productForm.productId) {
        // Edit
        await api.updateProduct(productForm.productId, productForm);
        showNotification('Product updated successfully', 'success');
      } else {
        // Add
        if (!productForm.categoryId) {
          showNotification('Please select a category', 'error');
          setLoading(false);
          return;
        }
        const created = await api.addProduct(productForm.categoryId, productForm);
        savedProductId = created.productId;
        showNotification('Product created successfully', 'success');
      }

      // Upload image if a file was selected
      if (imageFile && savedProductId) {
        setImageUploading(true);
        try {
          await api.uploadProductImage(savedProductId, imageFile);
          showNotification('Image uploaded successfully', 'success');
        } catch (imgErr: any) {
          showNotification(imgErr.message || 'Product saved, but image upload failed', 'error');
        } finally {
          setImageUploading(false);
        }
      }

      loadProducts();
      // Reset form + image state
      setProductForm({ productId: null, productName: '', description: '', quantity: 1, price: 0, discount: 0, specialPrice: 0, categoryId: '', image: '' });
      clearImageSelection();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (prod: any) => {
    setProductForm({
      productId: prod.productId,
      productName: prod.productName || '',
      description: prod.description || '',
      quantity: prod.quantity || 0,
      price: prod.price || 0,
      discount: prod.discount || 0,
      specialPrice: prod.specialPrice || 0,
      categoryId: prod.category?.categoryId || '',
      image: prod.image || '',
    });
    // Show existing product image as preview
    clearImageSelection();
    if (prod.image && prod.image.startsWith('http')) {
      setImagePreview(prod.image);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    setLoading(true);
    try {
      await api.deleteProduct(id);
      showNotification('Product deleted', 'success');
      loadProducts();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete product', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Category Actions
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (catForm.categoryId) {
        await api.updateCategory(catForm.categoryId, catForm);
        showNotification('Category updated successfully', 'success');
      } else {
        await api.addCategory(catForm);
        showNotification('Category created successfully', 'success');
      }
      setCatForm({ categoryId: null, categoryName: '', description: '' });
      refreshCategories();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCat = (cat: any) => {
    setCatForm({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName || '',
      description: cat.description || '',
    });
    // form is inline, no modal to open
  };

  const handleDeleteCat = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    setLoading(true);
    try {
      await api.deleteCategory(id);
      showNotification('Category deleted', 'success');
      refreshCategories();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete category', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    setLoading(true);
    try {
      await api.updateOrderStatus(orderId, status);
      showNotification(`Order status updated to ${status}`, 'success');
      loadOrders();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || '';
    if (s === 'PENDING') return <span className="badge warning">Pending</span>;
    if (s === 'AWAITING_PAYMENT') return <span className="badge info">Awaiting Payment</span>;
    if (s === 'CONFIRMED') return <span className="badge primary">Confirmed</span>;
    if (s === 'DELIVERED') return <span className="badge success">Delivered</span>;
    if (s === 'SHIPPING') return <span className="badge primary">Shipping</span>;
    if (s === 'CANCELLED') return <span className="badge danger">Cancelled</span>;
    return <span className="badge primary">{s}</span>;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Voucher Actions
  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (voucherForm.voucherId) {
        await api.updateVoucher(voucherForm.voucherId, voucherForm);
        showNotification('Voucher updated successfully', 'success');
      } else {
        await api.createVoucher(voucherForm);
        showNotification('Voucher created successfully', 'success');
      }
      loadVouchers();
      setVoucherForm({ voucherId: null, code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderValue: 0, maxDiscountAmount: 0, usageLimit: 100, expiryDate: '', description: '' });
    } catch (err: any) {
      showNotification(err.message || 'Failed to save voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVoucher = (v: any) => {
    setVoucherForm({
      voucherId: v.voucherId,
      code: v.code || '',
      discountType: v.discountType || 'PERCENTAGE',
      discountValue: v.discountValue || 0,
      minOrderValue: v.minOrderValue || 0,
      maxDiscountAmount: v.maxDiscountAmount || 0,
      usageLimit: v.usageLimit || 100,
      expiryDate: v.expiryDate ? new Date(v.expiryDate).toISOString().slice(0, 16) : '',
      description: v.description || '',
    });
  };

  const handleDeactivateVoucher = async (id: number) => {
    if (!window.confirm('Deactivate this voucher?')) return;
    setLoading(true);
    try {
      await api.deactivateVoucher(id);
      showNotification('Voucher deactivated', 'success');
      loadVouchers();
    } catch (err: any) {
      showNotification(err.message || 'Failed to deactivate voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={`outline ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} /> Analytics
          </button>
          <button className={`outline ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={16} /> Products
          </button>
          <button className={`outline ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={16} /> Categories
          </button>
          <button className={`outline ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={16} /> Orders
          </button>
          <button className={`outline ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveTab('vouchers')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={16} /> Vouchers
          </button>
        </div>
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Revenue</span>
                <DollarSign size={16} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatMoney(analytics.totalRevenue)}</div>
            </div>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Orders</span>
                <ShoppingBag size={16} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{analytics.totalOrders}</div>
            </div>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Products</span>
                <Package size={16} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{analytics.totalProducts}</div>
            </div>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Users</span>
                <Users size={16} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{analytics.totalUsers}</div>
            </div>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Avg Order Value</span>
                <TrendingUp size={16} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatMoney(analytics.averageOrderValue)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Revenue Chart */}
            <div className="glass-panel">
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Revenue Overview (Last 6 Months)</h3>
              <div style={{ height: '300px' }}>
                <Bar
                  data={{
                    labels: analytics.revenueByMonth?.map((r: any) => r.month) || [],
                    datasets: [
                      {
                        label: 'Revenue (VND)',
                        data: analytics.revenueByMonth?.map((r: any) => r.revenue) || [],
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderRadius: 4,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            {/* Top Products */}
            <div className="glass-panel">
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Top Products</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analytics.topProducts?.map((p: any) => (
                  <div key={p.productId} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={p.image || 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=100'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.productName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sold: {p.totalSold}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                      {formatMoney(p.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
          {/* Left: Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Products ({products.length})</h2>
              <button className="primary" onClick={() => {
                setProductForm({ productId: null, productName: '', description: '', quantity: 1, price: 0, discount: 0, specialPrice: 0, categoryId: '', image: '' });
                clearImageSelection();
              }} style={{ gap: '6px' }}>
                <Plus size={15} /> New Product
              </button>
            </div>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod: any) => (
                    <tr key={prod.productId} style={{ background: productForm.productId === prod.productId ? 'rgba(99,102,241,0.06)' : undefined }}>
                      <td>
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                          <img src={prod.image?.startsWith('http') ? prod.image : 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=100'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{prod.productName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{prod.category?.categoryName || ''}</div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{formatMoney(prod.price)}</td>
                      <td><span className={prod.discount > 0 ? 'badge danger' : ''} style={{ fontSize: '12px' }}>{prod.discount > 0 ? `-${prod.discount}%` : '—'}</span></td>
                      <td style={{ fontWeight: 600, color: prod.quantity <= 0 ? 'var(--danger)' : 'var(--success)', fontSize: '13px' }}>{prod.quantity}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="outline" onClick={() => handleEditProduct(prod)} style={{ padding: '6px 10px', fontSize: '12px', gap: '4px' }}>
                            <Edit size={13} /> Edit
                          </button>
                          <button className="danger" onClick={() => handleDeleteProduct(prod.productId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-subtle)' }}>No products yet. Add one →</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Inline Form */}
          <div className="glass-panel" style={{ position: 'sticky', top: '80px' }}>
            <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {productForm.productId ? <><Edit size={16} color="var(--primary)" /> Edit Product</> : <><Plus size={16} color="var(--success)" /> New Product</>}
            </h3>
            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Product Name *</label>
                <input type="text" value={productForm.productName} onChange={e => setProductForm({ ...productForm, productName: e.target.value })} required placeholder="e.g. Mechanical Keyboard" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Short description..."
                  rows={2}
                  style={{ resize: 'vertical', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Price (VND) *</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} required min={0} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Discount (%)</label>
                  <input type="number" value={productForm.discount} onChange={e => setProductForm({ ...productForm, discount: Number(e.target.value) })} min={0} max={100} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Stock Qty *</label>
                  <input type="number" value={productForm.quantity} onChange={e => setProductForm({ ...productForm, quantity: Number(e.target.value) })} required min={0} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Category *</label>
                  <select value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })} required>
                    <option value="">Select...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Product Image</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
                />
                {imagePreview ? (
                  <div className="image-preview-container" style={{ position: 'relative' }}>
                    <img src={imagePreview} alt="preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={(e) => { e.stopPropagation(); clearImageSelection(); }}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                    {imageFile && (
                      <div style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imageFile.name}</span>
                        <span style={{ marginLeft: 'auto', flexShrink: 0 }}>{(imageFile.size / 1024).toFixed(0)} KB</span>
                      </div>
                    )}
                    {imageUploading && (
                      <div className="image-uploading-overlay">
                        <span className="loader" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`image-upload-zone ${isDragOver ? 'drag-over' : ''}`}
                    onClick={() => imageInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <Upload size={24} className="upload-icon" />
                    <div className="upload-text">
                      <strong>Click to upload</strong> or drag and drop
                    </div>
                    <div className="upload-hint">PNG, JPG, WebP up to 5MB</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                {productForm.productId && (
                  <button type="button" className="outline" style={{ flex: 1 }} onClick={() => {
                    setProductForm({ productId: null, productName: '', description: '', quantity: 1, price: 0, discount: 0, specialPrice: 0, categoryId: '', image: '' });
                    clearImageSelection();
                  }}>
                    <X size={14} /> Clear
                  </button>
                )}
                <button type="submit" className="primary" style={{ flex: 2, justifyContent: 'center', padding: '11px' }} disabled={loading}>
                  {loading ? <span className="loader" /> : <><Save size={14} /> {productForm.productId ? 'Update' : 'Create'} Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
          {/* Left: Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Categories ({categories.length})</h2>
              <button className="primary" onClick={() => setCatForm({ categoryId: null, categoryName: '', description: '' })} style={{ gap: '6px' }}>
                <Plus size={15} /> New Category
              </button>
            </div>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat: any) => (
                    <tr key={cat.categoryId} style={{ background: catForm.categoryId === cat.categoryId ? 'rgba(99,102,241,0.06)' : undefined }}>
                      <td style={{ color: 'var(--text-subtle)', fontSize: '13px' }}>#{cat.categoryId}</td>
                      <td style={{ fontWeight: 600 }}>{cat.categoryName}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{cat.description || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="outline" onClick={() => handleEditCat(cat)} style={{ padding: '6px 10px', fontSize: '12px', gap: '4px' }}>
                            <Edit size={13} /> Edit
                          </button>
                          <button className="danger" onClick={() => handleDeleteCat(cat.categoryId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-subtle)' }}>No categories yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Inline Form */}
          <div className="glass-panel" style={{ position: 'sticky', top: '80px' }}>
            <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {catForm.categoryId ? <><Edit size={16} color="var(--primary)" /> Edit Category</> : <><Plus size={16} color="var(--success)" /> New Category</>}
            </h3>
            <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Category Name *</label>
                <input type="text" value={catForm.categoryName} onChange={e => setCatForm({ ...catForm, categoryName: e.target.value })} required placeholder="e.g. Keyboards" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Description</label>
                <input type="text" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                {catForm.categoryId && (
                  <button type="button" className="outline" style={{ flex: 1 }} onClick={() => setCatForm({ categoryId: null, categoryName: '', description: '' })}>
                    <X size={14} /> Clear
                  </button>
                )}
                <button type="submit" className="primary" style={{ flex: 2, justifyContent: 'center', padding: '11px' }} disabled={loading}>
                  {loading ? <span className="loader" /> : <><Save size={14} /> {catForm.categoryId ? 'Update' : 'Create'} Category</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>All Orders</h2>
            <button className="outline" onClick={loadOrders}><RefreshCw size={14} /></button>
          </div>

          <div className="glass-panel" style={{ padding: 0 }}>
            {orders.map((ord: any) => {
              const isExpanded = expandedOrderId === ord.orderId;
              return (
                <div key={ord.orderId} style={{ borderBottom: '1px solid var(--panel-border)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)}>
                    <div>
                      <span style={{ fontWeight: 600, marginRight: '16px' }}>Order #{ord.orderId}</span>
                      <span style={{ color: 'var(--text-muted)', marginRight: '16px' }}>By: {ord.username}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatMoney(ord.totalPrice)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
                      {getStatusBadge(ord.status)}
                      <select
                        value={ord.status}
                        onChange={e => handleUpdateOrderStatus(ord.orderId, e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="AWAITING_PAYMENT">AWAITING_PAYMENT</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPING">SHIPPING</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <button className="outline" onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)} style={{ padding: '4px' }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="animate-fade-in" style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                      <h4 style={{ marginTop: 0 }}>Items Detail</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {ord.items?.map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span>{item.productName} <strong style={{ color: 'var(--primary)' }}>x{item.quantity}</strong></span>
                            <span>{formatMoney(item.subTotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                        <div>
                          <strong>Address:</strong> {ord.shippingAddress} <br />
                          <strong>Phone:</strong> {ord.phoneNumber || 'N/A'}
                        </div>
                        <div>
                          <strong>Payment Method:</strong> {ord.paymentMethod} <br />
                          <strong>Notes:</strong> {ord.notes || 'None'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders in system.</div>
            )}
          </div>
        </div>
      )}

      {/* VOUCHERS TAB */}
      {activeTab === 'vouchers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', alignItems: 'start' }}>
          {/* Left: Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>Vouchers ({vouchers.length})</h2>
              <button className="primary" onClick={() => setVoucherForm({ voucherId: null, code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderValue: 0, maxDiscountAmount: 0, usageLimit: 100, expiryDate: '', description: '' })} style={{ gap: '6px' }}>
                <Plus size={15} /> New Voucher
              </button>
            </div>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Usage</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v: any) => (
                    <tr key={v.voucherId} style={{ background: voucherForm.voucherId === v.voucherId ? 'rgba(99,102,241,0.06)' : undefined, opacity: v.isActive ? 1 : 0.6 }}>
                      <td style={{ fontWeight: 600 }}>{v.code}</td>
                      <td>
                        {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatMoney(v.discountValue)}
                      </td>
                      <td style={{ fontSize: '13px' }}>{v.usedCount} / {v.usageLimit || '∞'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge ${v.isActive ? 'success' : 'danger'}`}>
                          {v.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="outline" onClick={() => handleEditVoucher(v)} style={{ padding: '6px 10px', fontSize: '12px', gap: '4px' }}>
                            <Edit size={13} /> Edit
                          </button>
                          {v.isActive && (
                            <button className="danger outline" onClick={() => handleDeactivateVoucher(v.voucherId)} style={{ padding: '6px 10px', fontSize: '12px' }} title="Deactivate">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vouchers.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-subtle)' }}>No vouchers yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Inline Form */}
          <div className="glass-panel" style={{ position: 'sticky', top: '80px' }}>
            <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {voucherForm.voucherId ? <><Edit size={16} color="var(--primary)" /> Edit Voucher</> : <><Plus size={16} color="var(--success)" /> New Voucher</>}
            </h3>
            <form onSubmit={handleVoucherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Voucher Code *</label>
                <input type="text" value={voucherForm.code} onChange={e => setVoucherForm({ ...voucherForm, code: e.target.value })} required placeholder="e.g. SUMMER2026" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Discount Type *</label>
                  <select value={voucherForm.discountType} onChange={e => setVoucherForm({ ...voucherForm, discountType: e.target.value })} required>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Discount Value *</label>
                  <input type="number" value={voucherForm.discountValue} onChange={e => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })} required min={0} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Min Order Value *</label>
                  <input type="number" value={voucherForm.minOrderValue} onChange={e => setVoucherForm({ ...voucherForm, minOrderValue: Number(e.target.value) })} required min={0} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Max Discount Amount</label>
                  <input type="number" value={voucherForm.maxDiscountAmount} onChange={e => setVoucherForm({ ...voucherForm, maxDiscountAmount: Number(e.target.value) })} min={0} placeholder="No cap if 0" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Usage Limit *</label>
                  <input type="number" value={voucherForm.usageLimit} onChange={e => setVoucherForm({ ...voucherForm, usageLimit: Number(e.target.value) })} required min={1} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Expiry Date *</label>
                  <input type="datetime-local" value={voucherForm.expiryDate} onChange={e => setVoucherForm({ ...voucherForm, expiryDate: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Description</label>
                <input type="text" value={voucherForm.description} onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })} placeholder="Optional description" />
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                {voucherForm.voucherId && (
                  <button type="button" className="outline" style={{ flex: 1 }} onClick={() => setVoucherForm({ voucherId: null, code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderValue: 0, maxDiscountAmount: 0, usageLimit: 100, expiryDate: '', description: '' })}>
                    <X size={14} /> Clear
                  </button>
                )}
                <button type="submit" className="primary" style={{ flex: 2, justifyContent: 'center', padding: '11px' }} disabled={loading}>
                  {loading ? <span className="loader" /> : <><Save size={14} /> {voucherForm.voucherId ? 'Update' : 'Create'} Voucher</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
