import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CheckCircle, CreditCard, Banknote, MapPin, User, Phone,
  Copy, Check, RefreshCw, Clock, AlertCircle, ChevronDown, ChevronUp, Mail
} from 'lucide-react'
import { selectCartItems, selectCartTotal, clearCartAsync } from '../../store/cartSlice'
import { selectUser } from '../../store/authSlice'
import { Image } from '../../components/common'
import { orderApi } from '../../services/api'
import { formatPrice } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    icon: <Banknote size={20} />,
    desc: 'Trả tiền mặt cho nhân viên giao hàng',
  },
  {
    id: 'vnpay',
    label: 'Thanh toán qua VNPay',
    icon: <CreditCard size={20} />,
    desc: 'Thẻ ATM, Visa, MasterCard, JCB, QR Pay',
  },
]

/* ─── Main CheckoutPage ─── */
export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)

  const [form, setForm] = useState({ 
    name: user?.name || user?.full_name || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    address: '', 
    note: '' 
  })
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('form')          // 'form' | 'success'
  const [orderRef, setOrderRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }))
    }
  }, [user])

  const shipping = total >= 5000000 ? 0 : 150000
  const finalTotal = total + shipping

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (!/^[0-9]{10,11}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ giao hàng'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      console.log("Submit clicked. Payment method:", payment);
      
      if (!user || !user.id) {
        console.error("Checkout failed: user object is null or missing id", user);
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        navigate('/login');
        setLoading(false);
        return;
      }

      const validItems = items.filter(item => item && item.id);
      if (validItems.length === 0) {
        console.error("Checkout failed: no valid items in cart", items);
        toast.error("Giỏ hàng không hợp lệ.");
        setLoading(false);
        return;
      }

      const orderData = {
        user_id: user.id,
        shipping_address: form.address,
        payment_method: payment === 'vnpay' ? 'VNPAY' : 'COD',
        items: validItems.map(item => ({ product_id: item.id, quantity: item.quantity }))
      }
      console.log("Order Data payload:", orderData);
      
      const order = await orderApi.create(orderData)
      console.log("Order API response:", order);
      
      if (payment === 'vnpay') {
        console.log("Preparing VNPay request...");
        const vnpayPayload = {
          order_id: order.id || order.data?.id,
          amount: finalTotal,
          order_info: `Thanh toan don hang ${order.id || order.data?.id}`
        };
        console.log("VNPay payload:", vnpayPayload);
        
        const vnpayRes = await orderApi.createVNPay(vnpayPayload);
        console.log("VNPay response:", vnpayRes);
        
        // Use either response.data (if full axios response) or response directly
        const paymentUrl = vnpayRes.data?.payment_url || vnpayRes.payment_url;
        console.log("Redirecting to:", paymentUrl);
        
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          console.error("No payment URL received!", vnpayRes);
        }
        return;
      }
      
      // COD flow
      await dispatch(clearCartAsync())
      setOrderRef('TL' + (order.id || order.data?.id))
      setStep('success')
      toast.success('Đặt hàng thành công! 🎉')
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step === 'form') {
    navigate('/cart')
    return null
  }

  /* ── SUCCESS SCREEN ── */
  if (step === 'success') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successAnim}>
            <CheckCircle size={64} strokeWidth={1.5} />
          </div>
          <h2>Đặt hàng thành công!</h2>
          <p>
            Cảm ơn bạn đã tin tưởng TechLap.
            {payment === 'vnpay'
              ? ' Đơn hàng của bạn đã được thanh toán thành công qua VNPay.'
              : ' Chúng tôi sẽ liên hệ xác nhận và giao hàng trong thời gian sớm nhất.'}
          </p>
          {orderRef && (
            <div className={styles.successRef}>
              Mã giao dịch: <strong>{orderRef}</strong>
            </div>
          )}
          <div className={styles.successActions}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Về trang chủ</button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/profile')}>Xem đơn hàng</button>
          </div>
        </div>
      </div>
    )
  }


  /* ── FORM SCREEN ── */
  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.pageTitle}>Thanh toán</h1>

        {/* Progress */}
        <div className={styles.progress}>
          <div className={`${styles.progressStep} ${styles.progressActive}`}>
            <span>1</span> Thông tin
          </div>
          <div className={styles.progressLine} />
          <div className={styles.progressStep}>
            <span>2</span> Thanh toán
          </div>
          <div className={styles.progressLine} />
          <div className={styles.progressStep}>
            <span>3</span> Hoàn tất
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.layout}>
            {/* Left */}
            <div className={styles.formSection}>
              {/* Shipping Info */}
              <div className={styles.formCard}>
                <h2 className={styles.cardTitle}>
                  <MapPin size={18} /> Thông tin giao hàng
                </h2>

                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <div className={styles.inputWithIcon}>
                    <User size={16} className={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }) }}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                  {errors.name && <span className="form-error">⚠ {errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <div className={styles.inputWithIcon}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="nguyenvana@example.com"
                      value={form.email}
                      onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }) }}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                  {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <div className={styles.inputWithIcon}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={form.phone}
                      onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }) }}
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                  {errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ giao hàng *</label>
                  <textarea
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={form.address}
                    onChange={e => { setForm({ ...form, address: e.target.value }); setErrors({ ...errors, address: '' }) }}
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.address && <span className="form-error">⚠ {errors.address}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ghi chú (tùy chọn)</label>
                  <textarea
                    placeholder="Ghi chú cho người giao hàng..."
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    className="form-input"
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className={styles.formCard}>
                <h2 className={styles.cardTitle}>
                  <CreditCard size={18} /> Phương thức thanh toán
                </h2>

                <div className={styles.paymentOptions}>
                  {PAYMENT_METHODS.map(m => (
                    <label
                      key={m.id}
                      className={`${styles.paymentOption} ${payment === m.id ? styles.paymentSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={payment === m.id}
                        onChange={() => setPayment(m.id)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.paymentIcon} ${payment === m.id ? styles.paymentIconActive : ''}`}>
                        {m.icon}
                      </span>
                      <div className={styles.paymentText}>
                        <div className={styles.paymentLabel}>{m.label}</div>
                        <div className={styles.paymentDesc}>{m.desc}</div>
                      </div>
                      {payment === m.id && (
                        <span className={styles.paymentCheck}><Check size={14} /></span>
                      )}
                    </label>
                  ))}
                </div>

                {/* VNPay hint */}
                {payment === 'vnpay' && (
                  <div className={styles.transferHint}>
                    <span className={styles.transferHintIcon}>🔒</span>
                    <div>
                      <div className={styles.transferHintTitle}>Thanh toán an toàn qua VNPay</div>
                      <div className={styles.transferHintDesc}>
                        Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất giao dịch.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right – Order Summary */}
            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>Đơn hàng của bạn</h2>

              {/* Mobile toggle */}
              <button
                type="button"
                className={styles.summaryToggle}
                onClick={() => setSummaryOpen(!summaryOpen)}
              >
                {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {summaryOpen ? 'Ẩn' : 'Xem'} chi tiết ({items.length} sản phẩm)
              </button>

              <div className={`${styles.orderItems} ${summaryOpen ? styles.orderItemsOpen : ''}`}>
                {items.map(item => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.orderItemImg}>
                      <Image 
                        src={item.image_url || item.image || item.specifications?.image_url || item.specs?.image_url} 
                        alt={item.name || 'Product'} 
                        category={item.category?.name || item.category_name || ''}
                        productName={item.name || ''}
                        brand={item.brand || item.specifications?.brand || ''}
                      />
                      <span className={styles.orderItemQty}>{item.quantity}</span>
                    </div>
                    <div className={styles.orderItemInfo}>
                      <div className={styles.orderItemName}>{item.name}</div>
                      <div className={styles.orderItemSpec}>{item.specifications?.ram || 'RAM'} · {item.specifications?.storage || 'SSD'}</div>
                    </div>
                    <div className={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className={styles.orderTotals}>
                <div className={styles.orderLine}>
                  <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className={styles.orderLine}>
                  <span>Phí vận chuyển</span>
                  <span>
                    {shipping === 0
                      ? <span className={styles.free}>Miễn phí</span>
                      : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <div className={styles.freeNote}>🎉 Bạn được miễn phí vận chuyển!</div>
                )}
              </div>

              <div className={styles.orderTotal}>
                <span>Tổng thanh toán</span>
                <span className={styles.orderTotalPrice}>{formatPrice(finalTotal)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                disabled={loading}
              >
                {loading
                  ? 'Đang xử lý...'
                  : payment === 'vnpay'
                    ? `Thanh toán qua VNPay`
                    : `Đặt hàng · ${formatPrice(finalTotal)}`}
              </button>

              <p className={styles.termsNote}>
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <a href="#">Điều khoản dịch vụ</a> của TechLap.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
