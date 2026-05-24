import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CheckCircle, CreditCard, Banknote, MapPin, User, Phone,
  Copy, Check, RefreshCw, Clock, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react'
import { selectCartItems, selectCartTotal, clearCartAsync } from '../../store/cartSlice'
import { selectUser } from '../../store/authSlice'
import { orderApi } from '../../services/api'
import { formatPrice } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

/* ─── Bank info ─── */
const BANK_INFO = {
  bankName: 'Vietcombank',
  bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
  accountNumber: '1234567890',
  accountName: 'CONG TY TNHH TECHLAP',
  branch: 'Chi nhánh TP. Hồ Chí Minh',
  logo: '🏦',
}

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    icon: <Banknote size={20} />,
    desc: 'Trả tiền mặt cho nhân viên giao hàng',
  },
  {
    id: 'transfer',
    label: 'Chuyển khoản ngân hàng',
    icon: <CreditCard size={20} />,
    desc: 'Quét mã QR hoặc chuyển khoản thủ công',
  },
]

/* ─── QR Code component dùng VietQR API (free, no key needed) ─── */
function QRCodeSection({ amount, orderRef, onConfirm, loading }) {
  const [copied, setCopied] = useState(null)
  const [countdown, setCountdown] = useState(15 * 60) // 15 phút
  const [expired, setExpired] = useState(false)
  const [qrError, setQrError] = useState(false)

  // VietQR public API – format: bank/accountNumber/amount/description
  const addInfo = encodeURIComponent(`TechLap ${orderRef}`)
  const qrUrl = `https://img.vietqr.io/image/970436-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`

  // countdown timer
  useEffect(() => {
    if (countdown <= 0) { setExpired(true); return }
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { setExpired(true); return 0 } return c - 1 }), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Đã sao chép!')
    setTimeout(() => setCopied(null), 2000)
  }

  const refresh = () => { setCountdown(15 * 60); setExpired(false) }

  const CopyBtn = ({ text, id }) => (
    <button className={styles.copyBtn} onClick={() => copy(text, id)} aria-label="Copy">
      {copied === id ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )

  return (
    <div className={styles.qrSection}>
      {/* Header */}
      <div className={styles.qrHeader}>
        <div className={styles.qrTitle}>
          <span className={styles.qrTitleIcon}>📲</span>
          Quét mã QR để thanh toán
        </div>
        <div className={`${styles.qrTimer} ${countdown < 120 ? styles.qrTimerWarn : ''}`}>
          <Clock size={13} />
          {expired ? 'Hết hạn' : `${mm}:${ss}`}
        </div>
      </div>

      {/* Amount */}
      <div className={styles.qrAmount}>
        <span className={styles.qrAmountLabel}>Số tiền cần chuyển</span>
        <span className={styles.qrAmountValue}>{formatPrice(amount)}</span>
      </div>

      <div className={styles.qrBody}>
        {/* QR Image */}
        <div className={styles.qrImageWrap}>
          {expired ? (
            <div className={styles.qrExpired}>
              <AlertCircle size={32} />
              <p>Mã QR đã hết hạn</p>
              <button className="btn btn-secondary btn-sm" onClick={refresh}>
                <RefreshCw size={14} /> Tạo mã mới
              </button>
            </div>
          ) : qrError ? (
            <div className={styles.qrExpired}>
              <AlertCircle size={32} />
              <p>Không tải được mã QR</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setQrError(false)}>
                <RefreshCw size={14} /> Thử lại
              </button>
            </div>
          ) : (
            <>
              <img
                src={qrUrl}
                alt="QR chuyển khoản"
                className={styles.qrImage}
                onError={() => setQrError(true)}
              />
              <div className={styles.qrScanHint}>Dùng app ngân hàng bất kỳ để quét</div>
            </>
          )}
        </div>

        {/* Bank Info */}
        <div className={styles.bankInfo}>
          <div className={styles.bankHeader}>
            <span className={styles.bankLogo}>{BANK_INFO.logo}</span>
            <div>
              <div className={styles.bankName}>{BANK_INFO.bankName}</div>
              <div className={styles.bankFullName}>{BANK_INFO.bankFullName}</div>
            </div>
          </div>

          <div className={styles.bankFields}>
            {[
              { label: 'Số tài khoản', value: BANK_INFO.accountNumber, id: 'acc' },
              { label: 'Chủ tài khoản', value: BANK_INFO.accountName, id: 'name' },
              { label: 'Số tiền', value: formatPrice(amount), id: 'amt' },
              { label: 'Nội dung CK', value: `TechLap ${orderRef}`, id: 'ref', highlight: true },
            ].map(f => (
              <div key={f.id} className={styles.bankField}>
                <span className={styles.bankFieldLabel}>{f.label}</span>
                <div className={styles.bankFieldRow}>
                  <span className={`${styles.bankFieldValue} ${f.highlight ? styles.bankFieldHighlight : ''}`}>
                    {f.value}
                  </span>
                  <CopyBtn text={f.value} id={f.id} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.bankNote}>
            <AlertCircle size={14} />
            <span>Nhập <strong>đúng nội dung chuyển khoản</strong> để đơn hàng được xác nhận tự động.</span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        className={`btn btn-primary btn-lg ${styles.confirmBtn}`}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.btnSpinner} /> Đang xử lý...
          </>
        ) : (
          <><CheckCircle size={18} /> Tôi đã chuyển khoản xong</>
        )}
      </button>

      <p className={styles.qrNote}>
        Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán (thường trong vòng 5 phút).
      </p>
    </div>
  )
}

/* ─── Main CheckoutPage ─── */
export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)

  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('form')          // 'form' | 'qr' | 'success'
  const [orderRef, setOrderRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const shipping = total >= 5000000 ? 0 : 150000
  const finalTotal = total + shipping

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!/^[0-9]{10,11}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ giao hàng'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (payment === 'transfer') {
      // Generate order ref and show QR
      const ref = 'TL' + Date.now().toString().slice(-8)
      setOrderRef(ref)
      setStep('qr')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // COD flow
    setLoading(true)
    try {
      const orderData = {
        user_id: user.id,
        shipping_address: form.address,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity }))
      }
      await orderApi.create(orderData)
      await dispatch(clearCartAsync())
      setStep('success')
      toast.success('Đặt hàng thành công! 🎉')
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const handleQRConfirm = async () => {
    setLoading(true)
    try {
      const orderData = {
        user_id: user.id,
        shipping_address: form.address,
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity }))
      }
      await orderApi.create(orderData)
      await dispatch(clearCartAsync())
      setStep('success')
      toast.success('Xác nhận thành công! 🎉')
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
            {payment === 'transfer'
              ? ' Chúng tôi sẽ xác nhận đơn hàng ngay sau khi nhận được thanh toán.'
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

  /* ── QR SCREEN ── */
  if (step === 'qr') {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.qrPageWrap}>
            {/* Back button */}
            <button className={styles.backBtn} onClick={() => setStep('form')}>
              ← Quay lại chỉnh sửa
            </button>

            <div className={styles.qrPageLayout}>
              {/* QR Section */}
              <div className={styles.qrMain}>
                <QRCodeSection
                  amount={finalTotal}
                  orderRef={orderRef}
                  onConfirm={handleQRConfirm}
                  loading={loading}
                />
              </div>

              {/* Order summary sidebar */}
              <div className={styles.qrSidebar}>
                <div className={styles.orderSummary}>
                  <h3 className={styles.summaryTitle}>Thông tin đơn hàng</h3>

                  <div className={styles.customerInfo}>
                    <div className={styles.customerRow}>
                      <User size={14} /><span>{form.name}</span>
                    </div>
                    <div className={styles.customerRow}>
                      <Phone size={14} /><span>{form.phone}</span>
                    </div>
                    <div className={styles.customerRow}>
                      <MapPin size={14} /><span>{form.address}</span>
                    </div>
                  </div>

                  <div className={styles.orderItems}>
                    {items.map(item => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.orderItemImg}>
                          <img src={item.image} alt={item.name} />
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
                      <span>Tạm tính</span><span>{formatPrice(total)}</span>
                    </div>
                    <div className={styles.orderLine}>
                      <span>Phí vận chuyển</span>
                      <span>{shipping === 0 ? <span className={styles.free}>Miễn phí</span> : formatPrice(shipping)}</span>
                    </div>
                  </div>

                  <div className={styles.orderTotal}>
                    <span>Tổng thanh toán</span>
                    <span className={styles.orderTotalPrice}>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
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

                {/* Transfer preview hint */}
                {payment === 'transfer' && (
                  <div className={styles.transferHint}>
                    <span className={styles.transferHintIcon}>📲</span>
                    <div>
                      <div className={styles.transferHintTitle}>Bước tiếp theo: Quét mã QR</div>
                      <div className={styles.transferHintDesc}>
                        Sau khi xác nhận đơn hàng, bạn sẽ thấy mã QR và thông tin tài khoản để chuyển khoản.
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
                      <img src={item.image} alt={item.name} />
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
                  : payment === 'transfer'
                    ? `Tiếp theo: Quét QR thanh toán`
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
