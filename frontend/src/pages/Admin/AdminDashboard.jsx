import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut,
  TrendingUp, DollarSign, ShoppingCart, Star, Plus, Edit2,
  Trash2, Search, ChevronDown, BarChart2, Eye
} from 'lucide-react'
import { selectUser, logout } from '../../store/authSlice'
import { adminApi, productApi } from '../../services/api'
import { formatPrice, formatDate, getStatusLabel } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

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
export function AdminHome() {
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, productsCount: 0, usersCount: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, usersRes, recentOrdersRes] = await Promise.all([
          adminApi.getAllOrders(0, 10000), // Get all for stats
          productApi.getAll({ limit: 10000 }),
          adminApi.getUsers(0, 10000),
          adminApi.getAllOrders(0, 5) // Just recent 5 for display
        ])
        
        const rev = ordersRes.data.reduce((sum, o) => sum + Number(o.total_amount), 0)
        setStats({
          revenue: rev,
          ordersCount: ordersRes.count || ordersRes.data.length,
          productsCount: productsRes.count || productsRes.data.length,
          usersCount: usersRes.count || usersRes.data.length
        })
        setRecentOrders(recentOrdersRes.data)
        setTopProducts(productsRes.data.slice(0, 5))
      } catch (err) {
        console.error("Failed to load stats", err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className={styles.adminContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Tổng quan</h1>
        <span className={styles.contentDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Doanh thu gần đây" value={formatPrice(stats.revenue)} icon={<DollarSign size={20} />} trend="Chỉ hiển thị đơn mới nhất" color="primary" />
        <StatCard label="Tổng đơn hàng" value={stats.ordersCount} icon={<ShoppingBag size={20} />} trend="Đang cập nhật" color="success" />
        <StatCard label="Sản phẩm" value={stats.productsCount} icon={<Package size={20} />} trend="Đang cập nhật" color="warning" />
        <StatCard label="Người dùng" value={stats.usersCount} icon={<Users size={20} />} trend="Đang cập nhật" color="primary" />
      </div>

      <div className={styles.recentGrid}>
        <div className={styles.recentCard}>
          <h3 className={styles.recentTitle}>Đơn hàng gần đây</h3>
          <div className={styles.recentList}>
            {recentOrders.map(order => {
              const status = getStatusLabel(order.status)
              return (
                <div key={order.id} className={styles.recentRow}>
                  <div>
                    <div className={styles.recentId}>#{order.id}</div>
                    <div className={styles.recentSub}>{formatDate(order.created_at)}</div>
                  </div>
                  <span className={`badge badge-${status.color}`}>{status.label}</span>
                  <div className={styles.recentPrice}>{formatPrice(order.total_amount)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.recentCard}>
          <h3 className={styles.recentTitle}>Sản phẩm mới</h3>
          <div className={styles.recentList}>
            {topProducts.map((p, i) => (
              <div key={p.id} className={styles.recentRow}>
                <div className={styles.rankNum}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.recentId} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div className={styles.recentSub}>Giá: {formatPrice(p.price)}</div>
                </div>
              </div>
            ))}
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

  useEffect(() => {
    productApi.getAll({ limit: 100 }).then(res => {
      setProducts(res.data)
      setTotal(res.count)
    }).catch(console.error)
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
        <button className="btn btn-primary btn-sm">
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
                      <img src={p.image || 'https://via.placeholder.com/150?text=Laptop'} alt={p.name} className={styles.productThumb} />
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
                  <td>{(p.sold || 0).toLocaleString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/products/${p.id}`} className="btn btn-ghost btn-sm btn-icon" title="Xem">
                        <Eye size={14} />
                      </Link>
                      <button className="btn btn-secondary btn-sm btn-icon" title="Sửa">
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
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const status = getStatusLabel(order.status)
                return (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{formatDate(order.created_at)}</td>
                    <td className={styles.priceCell}>{formatPrice(order.total_amount)}</td>
                    <td><span className={`badge badge-${status.color}`}>{status.label}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn btn-secondary btn-sm">Chi tiết</button>
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
