import { useState, useEffect, useCallback, useRef } from 'react'

// Debounce hook for search
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Pagination hook
export function usePagination(items, itemsPerPage = 12) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  return { currentPage, totalPages, paginatedItems, goToPage }
}

// Local storage hook
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// Scroll position hook
export function useScrollTop() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrolled
}

// Wishlist hook
import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlistAsync, selectWishlistItems } from '../store/wishlistSlice'
import { useNavigate } from 'react-router-dom'

export function useWishlist() {
  const dispatch = useDispatch()
  const wishlist = useSelector(selectWishlistItems)
  const isAuth = useSelector(state => !!state.auth.user)
  const navigate = useNavigate()

  const toggle = useCallback((id) => {
    if (!isAuth) {
      navigate('/login')
      return
    }
    dispatch(toggleWishlistAsync(id))
  }, [dispatch, isAuth, navigate])

  const isWished = useCallback((id) => wishlist.some(i => i.id === id), [wishlist])

  return { wishlist, toggle, isWished }
}

// Click outside hook
export function useClickOutside(callback) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback])

  return ref
}
