import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut, Mail,
  TrendingUp, DollarSign, ShoppingCart, Star, Plus, Edit2,
  Trash2, Search, ChevronDown, BarChart2, Eye
} from 'lucide-react'
import { selectUser, logout } from '../../store/authSlice'
import { adminApi, productApi } from '../../services/api'
import { formatPrice, formatDate, getStatusLabel } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'
import ProductFormModal from './ProductFormModal'
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

// ── SIDEBAR ──
function AdminSidebar() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    toast.success('Đã đăng xuất')
  }

  const navItems = [
    { to: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={17} />, end: true },
    { to: '/admin/products', label: 'Sản phẩm', icon: <Package size={17} /> },
    { to: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingBag size={17} /> },
    { to: '/admin/users', label: 'Người dùng', icon: <Users size={17} /> },
    { to: '/admin/reviews', label: 'Đánh giá', icon: <Star size={17} /> },
    { to: '/admin/emails', label: 'Email', icon: <Mail size={17} /> },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <Link to="/">⚡ TechLap</Link>
        <span className={styles.adminBadge}>Admin</span>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarUser}>
        <div className={styles.sidebarAvatar}>{user?.name?.[0] || 'A'}</div>
        <div>
          <div className={styles.sidebarUserName}>{user?.name || 'Admin'}</div>
          <div className={styles.sidebarUserRole}>Quản trị viên</div>
        </div>
        <button className={styles.sidebarLogout} onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

// ── STATS CARD ──
function StatCard({ label, value, icon, trend, color = 'primary' }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statIcon} style={{ background: `var(--color-${color}-light)`, color: `var(--color-${color})` }}>
          {icon}
        </div>
      </div>
      <div className={styles.statValue}>{value}</div>
      {trend && <div className={styles.statTrend}><TrendingUp size={12} /> {trend}</div>}
    </div>
  )
}

// ── DASHBOARD HOME ──
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function AdminHome() {
  const [stats, setStats] = useState({ total_revenue: 0, total_orders: 0, total_products: 0, total_customers: 0 })
  const [dailyRevenue, setDailyRevenue] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [revenueByBrand, setRevenueByBrand] = useState([])
  const [wishlistStats, setWishlistStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const [statsRes, dailyRes, sellersRes, brandRes, wishlistRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getDailyRevenue(),
          adminApi.getBestSellers(),
          adminApi.getRevenueByBrand(),
          adminApi.getWishlistStats()
        ])
        
        setStats(statsRes.data || statsRes)
        setDailyRevenue(dailyRes.data || dailyRes)
        setBestSellers(sellersRes.data || sellersRes)
        setRevenueByBrand(brandRes.data || brandRes)
        setWishlistStats(wishlistRes.data || wishlistRes)
      } catch (err) {
        console.error("Failed to load analytics", err)
        toast.error("Lỗi khi tải dữ liệu thống kê")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className={styles.adminContent} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div>Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Phân tích & Thống kê</h1>
        <span className={styles.contentDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Tổng doanh thu" value={formatPrice(stats.total_revenue)} icon={<DollarSign size={20} />} trend="Từ trước đến nay" color="primary" />
        <StatCard label="Tổng đơn hàng" value={stats.total_orders} icon={<ShoppingBag size={20} />} trend="Từ trước đến nay" color="success" />
        <StatCard label="Tổng sản phẩm" value={stats.total_products} icon={<Package size={20} />} trend="Hoạt động" color="warning" />
        <StatCard label="Tổng khách hàng" value={stats.total_customers} icon={<Users size={20} />} trend="Đã đăng ký" color="primary" />
      </div>

      <div className={styles.recentGrid} style={{ marginTop: '2rem' }}>
        <div className={styles.recentCard} style={{ gridColumn: 'span 2' }}>
          <h3 className={styles.recentTitle}>Doanh thu 7 ngày gần nhất</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={dailyRevenue} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => formatPrice(value)} labelStyle={{ color: '#374151' }} />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.recentCard}>
          <h3 className={styles.recentTitle}>Doanh thu theo thương hiệu</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={revenueByBrand} dataKey="revenue" nameKey="brand" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {revenueByBrand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.recentCard}>
          <h3 className={styles.recentTitle}>Top 10 sản phẩm bán chạy nhất</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={bestSellers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} hide />
                <YAxis dataKey="product_name" type="category" stroke="#6b7280" fontSize={11} width={100} tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => [`${value} sản phẩm`, 'Đã bán']} />
                <Bar dataKey="sold" name="Đã bán" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={15}>
                  {bestSellers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.recentGrid} style={{ marginTop: '2rem' }}>
        <div className={styles.recentCard} style={{ gridColumn: 'span 2' }}>
          <h3 className={styles.recentTitle}>Sản phẩm yêu thích nhiều nhất</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={wishlistStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} hide />
                <YAxis dataKey="product_name" type="category" stroke="#6b7280" fontSize={11} width={100} tickFormatter={(value) => value?.length > 15 ? value.substring(0, 15) + '...' : value} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => [`${value} lượt`, 'Yêu thích']} />
                <Bar dataKey="wishlisted_count" name="Yêu thích" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={15}>
                  {wishlistStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PRODUCTS MANAGEMENT ──
export function AdminProducts() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchProducts = () => {
    productApi.getAll({ limit: 100 }).then(res => {
      setProducts(res.data)
      setTotal(res.count)
    }).catch(console.error)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await adminApi.deleteProduct(id)
        setProducts(prev => prev.filter(p => p.id !== id))
        toast.success('Đã xóa sản phẩm')
      } catch (err) {
        toast.error('Không thể xóa sản phẩm')
      }
    }
  }

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Quản lý sản phẩm</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          <Plus size={15} /> Thêm sản phẩm
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableSearch}>
            <Search size={15} />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className={styles.tableCount}>{filtered.length} / {total} sản phẩm</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Hãng</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productCell}>
                      <img src={p.image_url || p.image || p.specifications?.image_url || p.specs?.image_url || 'https://via.placeholder.com/150?text=Laptop'} alt={p.name || 'Product'} className={styles.productThumb} />
                      <span className={styles.productName}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{(p.specifications?.brand || p.brand || 'Khác').toUpperCase()}</span></td>
                  <td className={styles.priceCell}>{formatPrice(p.price)}</td>
                  <td>
                    <span className={`badge ${(p.stock || 0) > 10 ? 'badge-success' : 'badge-danger'}`}>
                      {p.stock || 10}
                    </span>
                  </td>
                  <td>{(p.total_sold || 0).toLocaleString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/products/${p.id}`} className="btn btn-ghost btn-sm btn-icon" title="Xem">
                        <Eye size={14} />
                      </Link>
                      <button className="btn btn-secondary btn-sm btn-icon" title="Sửa" onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Xóa" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => { setIsModalOpen(false); fetchProducts(); }} 
        initialData={editingProduct} 
      />
    </div>
  )
}

// ── ORDERS MANAGEMENT ──
export function AdminOrders() {
  const statusOptions = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  const [filter, setFilter] = useState('all')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    adminApi.getAllOrders(0, 100).then(res => setOrders(res.data)).catch(console.error)
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Quản lý đơn hàng</h1>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.statusTabs}>
            {statusOptions.map(s => {
              const label = s === 'all' ? 'Tất cả' : getStatusLabel(s).label
              return (
                <button
                  key={s}
                  className={`${styles.statusTab} ${filter === s ? styles.statusTabActive : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const status = getStatusLabel(order.status)
                const paymentStatusColor = order.payment_status === 'PAID' ? 'success' : order.payment_status === 'FAILED' ? 'danger' : 'warning';
                return (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{formatDate(order.created_at)}</td>
                    <td className={styles.priceCell}>{formatPrice(order.total_amount)}</td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span className="badge badge-secondary">{order.payment_method || 'COD'}</span>
                        <span className={`badge badge-${paymentStatusColor}`}>{order.payment_status || 'PENDING'}</span>
                      </div>
                    </td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ padding: '4px 8px', fontSize: '13px', width: 'auto', minWidth: '120px' }}
                        value={order.status}
                        onChange={async (e) => {
                          try {
                            const newStatus = e.target.value;
                            await adminApi.updateOrder(order.id, { status: newStatus });
                            setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                            toast.success('Cập nhật trạng thái thành công');
                          } catch (err) {
                            toast.error('Lỗi cập nhật trạng thái');
                          }
                        }}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipped">Đang giao hàng</option>
                        <option value="delivered">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn btn-secondary btn-sm" onClick={() => toast('Chức năng đang phát triển')}>Chi tiết</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── USERS MANAGEMENT ──
export function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    adminApi.getUsers(0, 100).then(res => setUsers(res.data)).catch(console.error)
  }, [])

  const toggleRole = async (user) => {
    if (confirm(`Bạn muốn đổi vai trò của ${user.full_name}?`)) {
      try {
        await adminApi.updateUserRole(user.id, !user.is_superuser)
        setUsers(users.map(u => u.id === user.id ? { ...u, is_superuser: !u.is_superuser } : u))
        toast.success('Đổi vai trò thành công')
      } catch (err) {
        toast.error('Có lỗi xảy ra')
      }
    }
  }

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Quản lý người dùng</h1>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), #6B9EFF)',
                        color: 'white', fontWeight: 700, fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {(u.full_name || 'U')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.full_name || 'No Name'}</span>
                    </div>
                  </td>
                  <td>{u.username}</td>
                  <td>
                    <span className={`badge ${u.is_superuser ? 'badge-danger' : 'badge-primary'}`}>
                      {u.is_superuser ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-secondary btn-sm btn-icon" title="Đổi vai trò" onClick={() => toggleRole(u)}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── REVIEWS MANAGEMENT ──
export function AdminReviews() {
  const statusOptions = ['all', 'active', 'hidden', 'reported']
  const [filter, setFilter] = useState('all')
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total_reviews: 0, average_platform_rating: 0 })

  const fetchReviews = () => {
    adminApi.getReviews(0, 100).then(res => setReviews(res.data)).catch(console.error)
    adminApi.getReviewStats().then(res => setStats(res)).catch(console.error)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.review_status === filter)

  const toggleStatus = async (review) => {
    const newStatus = review.review_status === 'active' ? 'hidden' : 'active'
    try {
      await adminApi.updateReviewStatus(review.id, newStatus)
      setReviews(reviews.map(r => r.id === review.id ? { ...r, review_status: newStatus } : r))
      toast.success('Đã cập nhật trạng thái')
    } catch (err) {
      toast.error('Có lỗi xảy ra')
    }
  }

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Quản lý đánh giá</h1>
      </div>

      <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
        <StatCard label="Tổng số đánh giá" value={stats.total_reviews} icon={<Star size={20} />} color="warning" />
        <StatCard label="Điểm trung bình" value={stats.average_platform_rating} icon={<BarChart2 size={20} />} color="primary" />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.statusTabs}>
            {statusOptions.map(s => {
              const labels = { all: 'Tất cả', active: 'Hiển thị', hidden: 'Đã ẩn', reported: 'Bị báo cáo' }
              return (
                <button
                  key={s}
                  className={`${styles.statusTab} ${filter === s ? styles.statusTabActive : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {labels[s]}
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm ID</th>
                <th>Khách hàng</th>
                <th>Điểm</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>#{r.product_id}</td>
                  <td>#{r.user_id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', gap: '4px' }}>
                      {r.rating} <Star size={14} fill="currentColor" />
                    </div>
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comment}</div>
                  </td>
                  <td>
                    <span className={`badge ${r.review_status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {r.review_status === 'active' ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`btn btn-sm ${r.review_status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleStatus(r)}
                      >
                        {r.review_status === 'active' ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ADMIN LAYOUT ──
export default function AdminDashboard() {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.adminMain}>
        <Outlet />
      </main>
    </div>
  )
}
