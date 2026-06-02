import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Package, CheckCircle, Truck, MapPin, CreditCard, RotateCcw, XCircle, Star } from 'lucide-react'
import { orderApi } from '../../services/api'
import { selectUser } from '../../store/authSlice'
import { addToCartAsync } from '../../store/cartSlice'
import { formatPrice, formatDate, getStatusLabel } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Order.module.css'

const STEPS = [
  { id: 'pending', label: 'Chờ xác nhận', icon: <Package size={20} /> },
  { id: 'confirmed', label: 'Đã xác nhận', icon: <CheckCircle size={20} /> },
  { id: 'shipped', label: 'Đang giao', icon: <Truck size={20} /> },
  { id: 'delivered', label: 'Hoàn thành', icon: <MapPin size={20} /> },
]

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const [orderRes, itemsRes] = await Promise.all([
          orderApi.getOrderById(orderId),
          orderApi.getOrderItems(orderId)
        ])
        
        // Ensure user is authorized to view this order (or is admin)
        const orderData = orderRes.data || orderRes
        if (orderData.user_id !== user?.id && user?.role !== 'admin') {
          toast.error('Bạn không có quyền xem đơn hàng này')
          navigate('/profile')
          return
        }

        setOrder(orderData)
        setItems(Array.isArray(itemsRes) ? itemsRes : itemsRes.data || [])
      } catch (err) {
        toast.error('Không thể tải chi tiết đơn hàng')
        navigate('/profile')
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchOrder()
  }, [orderId, user, navigate])

  const handleCancelOrder = async () => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      setCancelling(true)
      try {
        await orderApi.cancelOrder(orderId)
        setOrder({ ...order, status: 'cancelled' })
        toast.success('Đã hủy đơn hàng thành công')
      } catch (err) {
        toast.error('Không thể hủy đơn hàng')
      } finally {
        setCancelling(false)
      }
    }
  }

  const handleBuyAgain = async () => {
    try {
      // Re-add all items to cart
      await Promise.all(items.map(item => 
        dispatch(addToCartAsync({ 
          product: { id: item.product_id }, 
          quantity: item.quantity 
        })).unwrap()
      ))
      navigate('/cart')
    } catch (err) {
      // Toast is handled by thunk
    }
  }

  if (loading) {
    return <div className={styles.page}><div className="container">Đang tải...</div></div>
  }

  if (!order) return null

  const statusLabel = getStatusLabel(order.status)
  
  // Calculate Timeline Progress
  let currentStepIndex = -1
  if (order.status !== 'cancelled') {
    currentStepIndex = STEPS.findIndex(s => s.id === order.status)
    // fallback if status is processing/shipping which map to shipped/confirmed
    if (currentStepIndex === -1) {
      if (order.status === 'processing') currentStepIndex = 1
      if (order.status === 'shipping') currentStepIndex = 2
    }
  }

  const progressWidth = currentStepIndex >= 0 ? `${(currentStepIndex / (STEPS.length - 1)) * 100}%` : '0%'

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.title}>
            <Link to="/profile" className="btn btn-ghost btn-sm btn-icon"><ArrowLeft size={20} /></Link>
            Chi tiết đơn hàng #{order.id}
          </div>
          <span className={`badge badge-${statusLabel.color} ${styles.titleBadge}`}>
            {statusLabel.label}
          </span>
        </div>

        {order.status === 'cancelled' && (
          <div className={styles.cancelledBadge}>
            Đơn hàng này đã bị hủy
          </div>
        )}

        {order.status !== 'cancelled' && (
          <div className={styles.card}>
            <div className={styles.timeline}>
              <div className={styles.timelineLine}></div>
              <div className={styles.timelineProgress} style={{ width: progressWidth }}></div>
              {STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                return (
                  <div key={step.id} className={`${styles.timelineStep} ${isActive ? styles.active : ''} ${isCurrent ? styles.current : ''}`}>
                    <div className={styles.timelineIcon}>
                      {step.icon}
                    </div>
                    <div className={styles.timelineLabel}>{step.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Sản phẩm đã đặt</h3>
              <div className={styles.itemsList}>
                {items.map(item => (
                  <div key={item.id} className={styles.item}>
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/150'} 
                      alt={item.product_name} 
                      className={styles.itemImage} 
                    />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.product_name || `Sản phẩm #${item.product_id}`}</div>
                      <div className={styles.itemMeta}>Số lượng: {item.quantity}</div>
                      <div className={styles.itemPriceWrap}>
                        <div className={styles.itemPrice}>{formatPrice(item.unit_price)}</div>
                        <div className={styles.itemTotal}>
                          {formatPrice(item.unit_price * item.quantity)}
                        </div>
                      </div>
                      
                      {order.status === 'delivered' && (
                        <div style={{ marginTop: '12px' }}>
                          <Link to={`/products/${item.product_id}#reviews`} className="btn btn-outline btn-sm">
                            <Star size={14} /> Đánh giá sản phẩm
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sidebarCol}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Tổng quan đơn hàng</h3>
              
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Ngày đặt hàng</div>
                <div className={styles.infoValue}>{formatDate(order.created_at)}</div>
              </div>
              
              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Địa chỉ giao hàng</div>
                <div className={styles.infoValue}>{order.shipping_address || 'Nhận tại cửa hàng'}</div>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoLabel}>Phương thức thanh toán</div>
                <div className={styles.infoValue}>
                  {order.payment_method} 
                  <span className={`badge badge-${order.payment_status === 'PAID' ? 'success' : 'warning'}`} style={{ marginLeft: '8px' }}>
                    {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              <div className={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Tổng cộng</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>

              <div className={styles.actions}>
                <button className="btn btn-primary" onClick={handleBuyAgain}>
                  <RotateCcw size={16} /> Mua lại đơn này
                </button>
                
                {order.status === 'pending' && (
                  <button 
                    className="btn btn-outline" 
                    style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                  >
                    <XCircle size={16} /> {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
