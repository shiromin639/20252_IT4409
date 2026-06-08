import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Phone, ShieldCheck, Tag, CreditCard, HeadphonesIcon, Newspaper, Heart, Loader2, History, TrendingUp } from 'lucide-react'
import { selectCartCount } from '../../store/cartSlice'
import { selectWishlistCount } from '../../store/wishlistSlice'
import { selectIsAuthenticated, selectUser, selectIsAdmin, logout } from '../../store/authSlice'
import { useClickOutside, useDebounce } from '../../hooks'
import { productApi } from '../../services/api/products'
import { searchAnalytics } from '../../services/analytics/searchAnalytics'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [searchVal, setSearchVal] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const abortControllerRef = useRef(null)

  const debouncedSearch = useDebounce(searchVal, 300)

  const cartCount = useSelector(selectCartCount)
  const wishlistCount = useSelector(selectWishlistCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const userMenuRef = useClickOutside(() => setUserMenuOpen(false))
  const searchWrapRef = useClickOutside(() => setShowDropdown(false))

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      try {
        const res = await productApi.getSearchSuggestions(debouncedSearch, abortControllerRef.current.signal)
        setSuggestions((res.data || res).slice(0, 5))
      } catch (err) {
        if (err.name !== 'CanceledError' && err.message !== 'canceled') {
          console.error("Failed to fetch suggestions", err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedSearch])

  useEffect(() => {
    setActiveIndex(-1)
  }, [searchVal])

  const executeSearch = (query) => {
    if (!query.trim()) return

    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))

    searchAnalytics.trackSearchEvent(query)

    navigate(`/products?search=${encodeURIComponent(query)}`)
    setSearchVal('')
    setShowDropdown(false)
    setSuggestions([])
  }

  const handleSearch = (e) => {
    e.preventDefault()
    executeSearch(searchVal.trim())
  }

  const handleKeyDown = (e) => {
    if (!showDropdown) return

    const totalItems = debouncedSearch.length >= 2 
      ? (suggestions.length === 0 ? 0 : suggestions.length) 
      : recentSearches.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        const selected = debouncedSearch.length >= 2 ? suggestions[activeIndex] : recentSearches[activeIndex]
        if (selected) executeSearch(selected)
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
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
        <div className={styles.searchWrap} ref={searchWrapRef}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Bạn cần tìm laptop gì hôm nay?"
              value={searchVal}
              onChange={e => {
                setSearchVal(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          {showDropdown && (searchVal.length >= 2 || recentSearches.length > 0) && (
            <div className={styles.autocompleteDropdown}>
              {searchVal.length < 2 ? (
                <>
                  <div className={styles.dropdownHeader}>Tìm kiếm gần đây</div>
                  {recentSearches.map((term, idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.suggestionItem} ${activeIndex === idx ? styles.active : ''}`}
                      onClick={() => executeSearch(term)}
                    >
                      <History size={14} className={styles.suggestionIcon} />
                      {term}
                    </div>
                  ))}
                </>
              ) : isLoading ? (
                <div className={styles.loadingIndicator}>
                  <Loader2 size={20} className={styles.loadingSpinner} />
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className={styles.dropdownHeader}>Gợi ý sản phẩm</div>
                  {suggestions.map((suggestion, idx) => {
                    const lowerSuggestion = suggestion.toLowerCase()
                    const lowerQuery = searchVal.toLowerCase()
                    const matchIndex = lowerSuggestion.indexOf(lowerQuery)
                    
                    let content
                    if (matchIndex >= 0) {
                      const before = suggestion.substring(0, matchIndex)
                      const match = suggestion.substring(matchIndex, matchIndex + searchVal.length)
                      const after = suggestion.substring(matchIndex + searchVal.length)
                      content = (
                        <>
                          {before}<span className={styles.suggestionHighlight}>{match}</span>{after}
                        </>
                      )
                    } else {
                      content = suggestion
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`${styles.suggestionItem} ${activeIndex === idx ? styles.active : ''}`}
                        onClick={() => executeSearch(suggestion)}
                      >
                        <Search size={14} className={styles.suggestionIcon} />
                        <div>{content}</div>
                      </div>
                    )
                  })}
                </>
              ) : (
                <div className={styles.emptyState}>
                  <Search size={24} style={{opacity: 0.5}} />
                  <p>Không tìm thấy gợi ý phù hợp</p>
                </div>
              )}
            </div>
          )}
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

          {/* Wishlist */}
          <Link to="/wishlist" className={styles.actionItem}>
            <div className={styles.actionIcon}>
              <Heart size={16} />
              {wishlistCount > 0 && <span className={styles.cartBadge}>{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
            </div>
            <div className={styles.actionText}>
              <span className={styles.actionLabel}>Yêu thích</span>
              <span className={styles.actionValue}>Đã lưu</span>
            </div>
          </Link>

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
