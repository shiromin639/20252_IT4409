import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Phone, ShieldCheck, Tag, CreditCard, HeadphonesIcon, Newspaper } from 'lucide-react'
import { selectCartCount } from '../../store/cartSlice'
import { selectIsAuthenticated, selectUser, selectIsAdmin, logout } from '../../store/authSlice'
import { useClickOutside } from '../../hooks'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [searchVal, setSearchVal] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const cartCount = useSelector(selectCartCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const userMenuRef = useClickOutside(() => setUserMenuOpen(false))

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Đã đăng xuất')
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.topHeader}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>TechLap</span>
        </Link>

        {/* Search */}
        <div className={styles.searchWrap}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Bạn cần tìm laptop gì hôm nay?"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          
          {/* Hotline */}
          <a href="tel:18006969" className={styles.actionItem}>
            <div className={styles.actionIcon}><Phone size={16} /></div>
            <div className={styles.actionText}>
              <span className={styles.actionLabel}>Gọi mua hàng</span>
              <span className={styles.actionValue}>1800.6969</span>
            </div>
          </a>

          {/* User Account */}
          {isAuthenticated ? (
            <div className={styles.userMenu} ref={userMenuRef}>
              <div className={styles.actionItem} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className={styles.actionIcon}><User size={16} /></div>
                <div className={styles.actionText}>
                  <span className={styles.actionLabel}>Xin chào,</span>
                  <span className={styles.actionValue}>{user?.name?.split(' ').pop() || 'User'}</span>
                </div>
              </div>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className={styles.dropdownName}>{user?.name}</div>
                      <div className={styles.dropdownEmail}>{user?.email}</div>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    <User size={15} /> Tài khoản của tôi
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={15} /> Quản trị viên
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={handleLogout}>
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.actionItem}>
              <div className={styles.actionIcon}><User size={16} /></div>
              <div className={styles.actionText}>
                <span className={styles.actionLabel}>Đăng nhập</span>
                <span className={styles.actionValue}>Tài khoản</span>
              </div>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className={styles.actionItem}>
            <div className={styles.actionIcon}>
              <ShoppingCart size={16} />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>}
            </div>
            <div className={styles.actionText}>
              <span className={styles.actionLabel}>Giỏ hàng</span>
              <span className={styles.actionValue}>Của bạn</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Quick Links Subheader */}
      <div className={styles.subHeader}>
        <div className={styles.subHeaderInner}>
          <Link to="/warranty" className={styles.quickLink}><ShieldCheck size={16} /> Bảo hành</Link>
          <Link to="/promotions" className={styles.quickLink}><Tag size={16} /> Khuyến mãi</Link>
          <Link to="/installment" className={styles.quickLink}><CreditCard size={16} /> Trả góp</Link>
          <Link to="/support" className={styles.quickLink}><HeadphonesIcon size={16} /> Hỗ trợ kỹ thuật</Link>
          <Link to="/news" className={styles.quickLink}><Newspaper size={16} /> Tin công nghệ</Link>
        </div>
      </div>
    </header>
  )
}
