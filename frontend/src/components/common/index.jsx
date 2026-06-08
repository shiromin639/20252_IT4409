// Spinner.jsx
export function Spinner({ size = 32, className = '' }) {
  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
      }}
    />
  )
}

// LoadingPage.jsx
export function LoadingPage() {
  return (
    <div className="loading-container" style={{ minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )
}

// Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(p =>
    p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  )

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {visible.map((page, i) => {
        const prev = visible[i - 1]
        return (
          <span key={page} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {prev && page - prev > 1 && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>…</span>
            )}
            <button
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        )
      })}

      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// StarRating.jsx
import { Star } from 'lucide-react'

export function StarRating({ rating, size = 14 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(rating) ? '#F59E0B' : 'none'}
          color={s <= Math.round(rating) ? '#F59E0B' : 'var(--color-border)'}
        />
      ))}
    </div>
  )
}

// ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin } from '../../store/authSlice'

export function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

// SkeletonCard.jsx
export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ aspectRatio: '4/3', borderRadius: 0 }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 20, width: '50%', borderRadius: 6, marginTop: 4 }} />
      </div>
    </div>
  )
}

export { ErrorBoundary } from './ErrorBoundary'
export { default as Image } from './Image';
