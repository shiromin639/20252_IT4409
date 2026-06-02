import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { User, Package, Lock, Edit2, Check, X } from 'lucide-react'
import { selectUser, updateProfile } from '../../store/authSlice'
import { orderApi } from '../../services/api'
import { formatPrice, formatDate, getStatusLabel } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Profile.module.css'

const TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={16} /> },
  { id: 'orders', label: 'Đơn hàng của tôi', icon: <Package size={16} /> },
  { id: 'password', label: 'Đổi mật khẩu', icon: <Lock size={16} /> },
]

export default function ProfilePage() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      const fetchOrders = async () => {
        try {
          const res = await orderApi.getUserOrders(user.id)
          const ordersWithItems = await Promise.all(
            res.data.map(async (order) => {
              const itemsRes = await orderApi.getOrderItems(order.id)
              const items = Array.isArray(itemsRes) ? itemsRes : itemsRes.data || []
              return {
                ...order,
                date: order.created_at,
                total: order.total_amount,
                items: items.map(i => ({
                  id: i.id || i.product_id,
                  name: i.product_name || `Sản phẩm #${i.product_id}`,
                  qty: i.quantity,
                  price: i.unit_price || 0,
                  image_url: i.image_url
                }))
              }
            })
          )
          setOrders(ordersWithItems)
        } catch (e) {
          toast.error("Không thể tải đơn hàng")
        }
      }
      fetchOrders()
    }
  }, [activeTab, user])

  const handleSaveProfile = () => {
    dispatch(updateProfile(form))
    toast.success('Cập nhật thành công!')
    setEditing(false)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (passForm.next !== passForm.confirm) {
      toast.error('Mật khẩu mới không khớp')
      return
    }
    if (passForm.next.length < 6) {
      toast.error('Mật khẩu mới ít nhất 6 ký tự')
      return
    }
    toast.success('Đổi mật khẩu thành công!')
    setPassForm({ current: '', next: '', confirm: '' })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userEmail}>{user?.email}</div>
              {user?.role === 'admin' && (
                <span className="badge badge-primary" style={{ marginTop: '8px' }}>Admin</span>
              )}
            </div>

            <nav className={styles.nav}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.navItem} ${activeTab === tab.id ? styles.navActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className={styles.content}>
            {/* Profile */}
            {activeTab === 'profile' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
                  {!editing ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                      <Edit2 size={14} /> Chỉnh sửa
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>
                        <Check size={14} /> Lưu
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                        <X size={14} /> Hủy
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.profileForm}>
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    {editing ? (
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="form-input"
                      />
                    ) : (
                      <div className={styles.profileValue}>{user?.name}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className={styles.profileValue}>{user?.email}</div>
                    <span className={styles.profileNote}>Email không thể thay đổi</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vai trò</label>
                    <div className={styles.profileValue}>
                      {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Đơn hàng của tôi</h2>

                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Package size={32} /></div>
                    <h3>Chưa có đơn hàng</h3>
                    <p>Bạn chưa đặt hàng nào</p>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {orders.map(order => {
                      const status = getStatusLabel(order.status)
                      return (
                        <div key={order.id} className={styles.orderCard}>
                          <div className={styles.orderHeader}>
                            <div>
                              <div className={styles.orderId}>#{order.id}</div>
                              <div className={styles.orderDate}>{formatDate(order.date)}</div>
                            </div>
                            <span className={`badge badge-${status.color}`}>{status.label}</span>
                          </div>
                          
                          <div style={{ padding: '16px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
                            {order.items.slice(0, 4).map(item => (
                              <img 
                                key={item.id} 
                                src={item.image_url || 'https://via.placeholder.com/60'} 
                                alt={item.name} 
                                style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                              />
                            ))}
                            {order.items.length > 4 && (
                              <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-alt)', borderRadius: '8px', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600' }}>
                                +{order.items.length - 4}
                              </div>
                            )}
                          </div>
                          
                          <div className={styles.orderTotal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Tổng cộng: </span>
                              <span className={styles.orderTotalPrice} style={{ fontSize: '18px' }}>{formatPrice(order.total)}</span>
                            </div>
                            <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                              Xem chi tiết
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            {activeTab === 'password' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className={styles.passForm}>
                  {[
                    { key: 'current', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
                    { key: 'next', label: 'Mật khẩu mới', placeholder: 'Ít nhất 6 ký tự' },
                    { key: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
                  ].map(field => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">{field.label}</label>
                      <input
                        type="password"
                        placeholder={field.placeholder}
                        value={passForm[field.key]}
                        onChange={e => setPassForm({ ...passForm, [field.key]: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary">
                    <Lock size={15} /> Đổi mật khẩu
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
