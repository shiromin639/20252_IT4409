import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CheckCircle, XCircle, Home, ShoppingBag } from 'lucide-react'
import { clearCartAsync } from '../../store/cartSlice'
import styles from './PaymentReturn.module.css'

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const dispatch = useDispatch()

  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true'
    const id = searchParams.get('order_id')
    const errorCode = searchParams.get('error_code')
    const errorMsg = searchParams.get('error')

    setOrderId(id || '')

    if (isSuccess) {
      setStatus('success')
      // VNPay payment was successful, clear the cart
      dispatch(clearCartAsync())
    } else {
      setStatus('error')
      if (errorMsg === 'invalid_signature') {
        setErrorMessage('Chữ ký xác thực không hợp lệ. Giao dịch có thể đã bị giả mạo.')
      } else if (errorCode) {
        setErrorMessage(`Thanh toán thất bại (Mã lỗi: ${errorCode}). Vui lòng thử lại.`)
      } else {
        setErrorMessage('Đã xảy ra lỗi trong quá trình thanh toán.')
      }
    }
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.card}>
            <div className={styles.spinner} />
            <h2>Đang xác thực giao dịch...</h2>
            <p>Vui lòng không đóng trình duyệt.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          {status === 'success' ? (
            <>
              <div className={styles.iconSuccess}>
                <CheckCircle size={64} strokeWidth={1.5} />
              </div>
              <h1 className={styles.title}>Thanh toán thành công!</h1>
              <p className={styles.desc}>
                Cảm ơn bạn đã tin tưởng TechLap. Đơn hàng <strong>TL{orderId}</strong> của bạn đã được thanh toán qua VNPay.
              </p>
              <div className={styles.actions}>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  <Home size={18} /> Về trang chủ
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
                  <ShoppingBag size={18} /> Xem đơn hàng
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.iconError}>
                <XCircle size={64} strokeWidth={1.5} />
              </div>
              <h1 className={styles.title}>Thanh toán thất bại</h1>
              <p className={styles.desc}>{errorMessage}</p>
              <div className={styles.actions}>
                <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
                  Thử lại
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                  <Home size={18} /> Về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
