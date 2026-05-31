import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, Search, Grid, List } from 'lucide-react'
import { productApi } from '../../services/api'
import { ramOptions, priceRanges } from '../../constants'
import { formatPrice } from '../../utils'
import ProductCard from '../../components/product/ProductCard'
import { Pagination, SkeletonCard } from '../../components/common'
import { useDebounce, usePagination } from '../../hooks'
import styles from './Products.module.css'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Bán chạy nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [apiBrands, setApiBrands] = useState([])

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || 'all',
    sort: searchParams.get('sort') || 'popular',
    search: searchParams.get('search') || '',
    ram: '',
    priceRange: null,
    category: searchParams.get('category') || '',
  })

  const debouncedSearch = useDebounce(filters.search, 400)
  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(products, 12)
  const location = useLocation()

  // Sync URL changes to local filters (e.g. when searching from Navbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSearch = params.get('search') || '';
    const newBrand = params.get('brand') || 'all';
    const newCategory = params.get('category') || '';
    
    console.log('[ProductsPage] location.search changed:', location.search, 'New Search:', newSearch);
    
    setFilters(prev => {
      // Only update if actually different to prevent infinite loops
      if (prev.search === newSearch && prev.brand === newBrand && prev.category === newCategory) {
        return prev;
      }
      return {
        ...prev,
        search: newSearch,
        brand: newBrand,
        category: newCategory,
      }
    })
  }, [location.search])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      if (apiBrands.length === 0) {
        const brandsRes = await productApi.getBrands();
        setApiBrands(brandsRes);
      }
      
      const params = {
        brand: filters.brand !== 'all' ? filters.brand : undefined,
        sort: filters.sort,
        search: debouncedSearch || undefined,
        ram: filters.ram || undefined,
        minPrice: filters.priceRange?.min,
        maxPrice: filters.priceRange?.max !== Infinity ? filters.priceRange?.max : undefined,
        category: filters.category || undefined,
      }
      console.log('[ProductsPage] Fetching products with params:', params);
      const result = await productApi.getAll(params)
        setProducts(result.data)
        setTotalCount(result.count)
    } finally {
      setLoading(false)
    }
  }, [filters.brand, filters.sort, debouncedSearch, filters.ram, filters.priceRange, filters.category, apiBrands.length])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ brand: 'all', sort: 'popular', search: '', ram: '', priceRange: null, category: '' })
    setSearchParams({})
  }

  const activeFilterCount = [
    filters.brand !== 'all',
    filters.ram,
    filters.priceRange,
    filters.category,
  ].filter(Boolean).length

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Tất cả sản phẩm</h1>
            {!loading && (
              <p className={styles.pageCount}>
                Tìm thấy <strong>{totalCount}</strong> sản phẩm
              </p>
            )}
          </div>

          {/* Sort + Filter toggle */}
          <div className={styles.headerActions}>
            <div className={styles.sortWrap}>
              <select
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles.sortIcon} />
            </div>

            <button
              className={`${styles.filterToggle} ${activeFilterCount > 0 ? styles.filterActive : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm laptop theo tên, hãng, cấu hình..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className={styles.searchInput}
          />
          {filters.search && (
            <button className={styles.searchClear} onClick={() => updateFilter('search', '')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.layout}>
          {/* ── FILTER SIDEBAR ── */}
          <aside className={`${styles.sidebar} ${showFilter ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3>Bộ lọc</h3>
              {activeFilterCount > 0 && (
                <button className={styles.resetBtn} onClick={resetFilters}>
                  <X size={13} /> Xóa tất cả
                </button>
              )}
            </div>

            {/* Brand */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Thương hiệu</h4>
              <div className={styles.filterOptions}>
                <button
                  className={`${styles.filterChip} ${filters.brand === 'all' ? styles.active : ''}`}
                  onClick={() => updateFilter('brand', 'all')}
                >
                  Tất cả
                </button>
                {apiBrands.map(b => (
                  <button
                    key={b}
                    className={`${styles.filterChip} ${String(filters.brand).toLowerCase() === String(b).toLowerCase() ? styles.active : ''}`}
                    onClick={() => updateFilter('brand', String(b).toLowerCase())}
                  >
                    {String(b || '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Mức giá</h4>
              <div className={styles.filterOptions}>
                <button
                  className={`${styles.filterChip} ${!filters.priceRange ? styles.active : ''}`}
                  onClick={() => updateFilter('priceRange', null)}
                >
                  Tất cả
                </button>
                {priceRanges.map((r, i) => (
                  <button
                    key={i}
                    className={`${styles.filterChip} ${filters.priceRange === r ? styles.active : ''}`}
                    onClick={() => updateFilter('priceRange', r)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RAM */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>RAM</h4>
              <div className={styles.filterOptions}>
                <button
                  className={`${styles.filterChip} ${!filters.ram ? styles.active : ''}`}
                  onClick={() => updateFilter('ram', '')}
                >
                  Tất cả
                </button>
                {ramOptions.map(r => (
                  <button
                    key={r}
                    className={`${styles.filterChip} ${filters.ram === r ? styles.active : ''}`}
                    onClick={() => updateFilter('ram', r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className={styles.content}>
            {/* Active filters strip */}
            {activeFilterCount > 0 && (
              <div className={styles.activeFilters}>
                {filters.brand !== 'all' && (
                  <div className={styles.activeFilter}>
                    {String(filters.brand || 'all').toUpperCase()}
                    <button onClick={() => updateFilter('brand', 'all')}><X size={12} /></button>
                  </div>
                )}
                {filters.priceRange && (
                  <div className={styles.activeFilter}>
                    {filters.priceRange.label}
                    <button onClick={() => updateFilter('priceRange', null)}><X size={12} /></button>
                  </div>
                )}
                {filters.ram && (
                  <div className={styles.activeFilter}>
                    RAM {filters.ram}
                    <button onClick={() => updateFilter('ram', '')}><X size={12} /></button>
                  </div>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Search size={32} />
                </div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button className="btn btn-primary" onClick={resetFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="product-grid">
                {paginatedItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
