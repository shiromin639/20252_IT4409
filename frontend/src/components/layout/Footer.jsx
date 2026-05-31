import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand Col */}
        <div className={styles.col}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>TechLap</span>
          </Link>
          <p className={styles.desc}>
            Hệ thống bán lẻ laptop uy tín hàng đầu Việt Nam. Cung cấp sản phẩm chính hãng, dịch vụ bảo hành tận tâm và giá cả cạnh tranh nhất.
          </p>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={18} />
              <span>1800 6969 (Miễn phí)</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={18} />
              <span>support@techlap.vn</span>
            </div>
          </div>
          <div className={styles.social}>
            <a href="#" className={styles.socialBtn}><Facebook size={18} /></a>
            <a href="#" className={styles.socialBtn}><Youtube size={18} /></a>
            <a href="#" className={styles.socialBtn}><Instagram size={18} /></a>
            <a href="#" className={styles.socialBtn}><Twitter size={18} /></a>
          </div>
        </div>

        {/* Links Col 1 */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Thông tin công ty</h3>
          <div className={styles.links}>
            <Link to="/about" className={styles.link}>Giới thiệu công ty</Link>
            <Link to="/contact" className={styles.link}>Liên hệ hợp tác</Link>
            <Link to="/careers" className={styles.link}>Tuyển dụng</Link>
            <Link to="/news" className={styles.link}>Tin tức công nghệ</Link>
            <Link to="/stores" className={styles.link}>Hệ thống cửa hàng</Link>
          </div>
        </div>

        {/* Links Col 2 */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Chính sách</h3>
          <div className={styles.links}>
            <Link to="/policy/warranty" className={styles.link}>Chính sách bảo hành</Link>
            <Link to="/policy/return" className={styles.link}>Chính sách đổi trả</Link>
            <Link to="/policy/shipping" className={styles.link}>Chính sách giao hàng</Link>
            <Link to="/policy/privacy" className={styles.link}>Bảo mật thông tin</Link>
            <Link to="/policy/payment" className={styles.link}>Hướng dẫn thanh toán</Link>
          </div>
        </div>

        {/* Support & Payment */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Tổng đài hỗ trợ</h3>
          <div className={styles.links}>
            <span className={styles.link}>Gọi mua: <strong>1800.6969</strong> (8:00 - 21:00)</span>
            <span className={styles.link}>Bảo hành: <strong>1800.6970</strong> (8:00 - 21:00)</span>
            <span className={styles.link}>Khiếu nại: <strong>1800.6971</strong> (8:00 - 21:00)</span>
          </div>

          <h3 className={styles.colTitle} style={{ marginTop: '24px' }}>Thanh toán</h3>
          <div className={styles.paymentMethods}>
            <div className={styles.paymentIcon}>VISA</div>
            <div className={styles.paymentIcon}>ATM</div>
            <div className={styles.paymentIcon}>MOMO</div>
            <div className={styles.paymentIcon}>VNPAY</div>
            <div className={styles.paymentIcon}>COD</div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copyright}>
            © {new Date().getFullYear()} TechLap. Bản quyền thuộc về Công ty cổ phần TechLap.
          </p>
        </div>
      </div>
    </footer>
  )
}
