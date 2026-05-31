import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { authApi } from '../../services/api'
import { loginUser, selectIsAuthenticated, selectIsAdmin } from '../../store/authSlice'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isCurrentlyAdmin = useSelector(selectIsAdmin)
  const isLogin = location.pathname === '/login'

  // Pre-emptive redirect for already logged in users
  useEffect(() => {
    if (isAuthenticated) {
      if (isCurrentlyAdmin) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [isAuthenticated, isCurrentlyAdmin, navigate])

  const [form, setForm] = useState({ name: '', username: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const validate = () => {
    const e = {}
    if (!isLogin && !form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!form.username.trim()) e.username = 'Tên đăng nhập / Email không được để trống'
    if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự'
    if (!isLogin && form.password !== form.confirm) e.confirm = 'Mật khẩu không khớp'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      let payload
      if (isLogin) {
        payload = await dispatch(loginUser({ username: form.username, password: form.password })).unwrap()
        toast.success('Đăng nhập thành công!')
      } else {
        await authApi.register({ username: form.username, password: form.password, full_name: form.name })
        payload = await dispatch(loginUser({ username: form.username, password: form.password })).unwrap()
        toast.success('Đăng ký thành công!')
      }
      
      const loggedInUser = payload.user
      const isAdmin = loggedInUser?.is_superuser === true || loggedInUser?.role === 'admin'
      
      if (isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      toast.error(err.message || (typeof err === 'string' ? err : 'Có lỗi xảy ra'))
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    setErrors({ ...errors, [key]: '' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>⚡ TechLap</Link>

        {/* Tabs */}
        <div className={styles.tabs}>
          <Link to="/login" className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}>
            Đăng nhập
          </Link>
          <Link to="/register" className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`}>
            Đăng ký
          </Link>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={set('name')}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tên đăng nhập hoặc Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Tên đăng nhập"
                value={form.username}
                onChange={set('username')}
                className={`form-input ${errors.username ? 'error' : ''}`}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Ít nhất 6 ký tự"
                value={form.password}
                onChange={set('password')}
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm}
                  onChange={set('confirm')}
                  className={`form-input ${errors.confirm ? 'error' : ''}`}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>
          )}

          {isLogin && (
            <div className={styles.forgotRow}>
              <a href="#" className={styles.forgotLink}>Quên mật khẩu?</a>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo hint */}
        {isLogin && (
          <div className={styles.demoHint}>
            <strong>Demo Admin:</strong> admin / admin123 (nếu đã tạo)
          </div>
        )}

        <p className={styles.switchText}>
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <Link to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </Link>
        </p>
      </div>
    </div>
  )
}
