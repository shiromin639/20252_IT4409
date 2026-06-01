import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ShoppingCart, Zap, Heart, Shield, Truck, RotateCcw, Star, ChevronRight, Check } from 'lucide-react'
import { productApi, inventoryApi } from '../../services/api'
import { addToCartAsync } from '../../store/cartSlice'
import { useWishlist } from '../../hooks'
import { formatPrice } from '../../utils'
import ProductCard from '../../components/product/ProductCard'
import ProductReviews from '../../components/product/ProductReviews'
import { StarRating, LoadingPage } from '../../components/common'
import toast from 'react-hot-toast'
import styles from './ProductDetail.module.css'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toggle, isWished } = useWishlist()

  const [product, setProduct] = useState(null)
  const [stock, setStock] = useState(0)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('specs')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setActiveImage(0)
      setQuantity(1)
      try {
        const p = await productApi.getById(id)
        setProduct(p)
        
        try {
          const inv = await inventoryApi.getStock(p.id)
          setStock(inv.quantity)
        } catch (err) {
          console.error("Failed to load inventory", err)
          setStock(0)
        }

        const productBrand = p.brand || p.specifications?.brand || p.specs?.brand || '';
        const relRes = await productApi.getAll({ brand: productBrand, limit: 6 })
        setRelated(relRes.data ? relRes.data.filter(x => x.id !== p.id).slice(0, 5) : [])
      } catch {
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    window.scrollTo(0, 0)
  }, [id])

  if (loading) return <LoadingPage />
  if (!product) return null

  const wished = isWished(product.id)

  const handleAddToCart = () => {
    dispatch(addToCartAsync({ product, quantity }))
    toast.success('Đã thêm vào giỏ hàng!')
  }

  const handleBuyNow = () => {
    dispatch(addToCartAsync({ product, quantity }))
    navigate('/cart')
  }

  const specs = product.specifications || product.specs || {}
  const brand = product.brand || specs.brand || 'Unknown Brand'
  const displayBrand = typeof brand === 'string' ? brand.toUpperCase() : 'UNKNOWN'
  
  const specEntries = [
    ['Thương hiệu', brand],
    ['CPU', specs.cpu || specs.CPU || 'N/A'],
    ['RAM', specs.ram || specs.RAM || 'N/A'],
    ['Lưu trữ', specs.storage || 'N/A'],
    ['Màn hình', specs.display || specs.screen || 'N/A'],
    ['GPU', specs.gpu || specs.GPU || 'N/A'],
    ['Pin', specs.battery || 'N/A'],
    ['Hệ điều hành', specs.os || specs.OS || 'N/A'],
    ['Trọng lượng', specs.weight || 'N/A'],
  ].filter(([, val]) => val !== 'N/A')

  const mainImage = product.images?.[activeImage] || product.image_url || product.image || specs.image_url || 'https://via.placeholder.com/600x400?text=Laptop'
  const discountPercent = product.discount_percent || product.discount || 0
  const originalPrice = product.original_price || product.originalPrice || product.price

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/products">Sản phẩm</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* ── GALLERY ── */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={mainImage} alt={product.name || 'Product'} />
              {discountPercent > 0 && (
                <div className={styles.discountBadge}>-{discountPercent}%</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`Ảnh ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div className={styles.info}>
            <div className={styles.infoBrand}>{displayBrand}</div>
            <h1 className={styles.infoName}>{product.name || 'Sản phẩm không có tên'}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <StarRating rating={product.average_rating ?? product.rating ?? 5} size={16} />
              <span className={styles.ratingVal}>{product.average_rating ?? product.rating ?? 5}</span>
              <span className={styles.ratingCount}>({product.total_reviews ?? product.reviews_count ?? 0} đánh giá)</span>
              <span className={styles.soldCount}>| Đã bán {(product.total_sold || 0).toLocaleString()}</span>
            </div>

            {/* Price */}
            <div className={styles.priceBox}>
              {discountPercent > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceOriginal}>Giá gốc: <del>{formatPrice(originalPrice)}</del></span>
                </div>
              )}
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
              </div>
            </div>

            {/* Spec Quick List */}
            <div className={styles.specQuick}>
              {specEntries.slice(0, 6).map(([key, val]) => (
                <div key={key} className={styles.specQuickItem}>
                  <Check size={14} className={styles.specCheck} />
                  <span className={styles.specKey}>{key}:</span>
                  <span className={styles.specVal}>{val}</span>
                </div>
              ))}
            </div>

            {/* Stock & Quantity */}
            <div className={styles.stockRow}>
              <div className={`${styles.stockDot} ${stock > 5 ? styles.inStock : styles.lowStock}`} />
              <span className={styles.stockText}>
                {stock > 5 ? 'Còn hàng' : stock > 0 ? `Chỉ còn ${stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Số lượng:</span>
              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || stock === 0}
                >−</button>
                <span className={styles.qtyVal}>{stock === 0 ? 0 : quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || stock === 0}
                >+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={styles.ctaButtons}>
              <button
                className={`btn btn-lg ${styles.btnBuyNow}`}
                onClick={handleBuyNow}
                disabled={stock === 0}
              >
                MUA NGAY
              </button>
              <button
                className={`btn btn-lg ${styles.btnCart}`}
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
              <button
                className={`btn btn-lg btn-secondary ${wished ? styles.wishedBtn : ''}`}
                onClick={() => toggle(product.id)}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} /> Yêu thích
              </button>
            </div>

            {/* Guarantees */}
            <div className={styles.guarantees}>
              {[
                { icon: <Shield size={16} />, text: 'Bảo hành chính hãng 24 tháng' },
                { icon: <Truck size={16} />, text: 'Giao hàng miễn phí toàn quốc' },
                { icon: <RotateCcw size={16} />, text: '1 đổi 1 trong 15 ngày' },
              ].map((item, i) => (
                <div key={i} className={styles.guarantee}>
                  <span className={styles.guaranteeIcon}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className={styles.tabsSection}>
          <div className={styles.tabs}>
            {[
              { id: 'desc', label: 'Mô tả sản phẩm' },
              { id: 'specs', label: 'Thông số kỹ thuật' },
              { id: 'reviews', label: `Đánh giá (${product.total_reviews ?? product.reviews_count ?? 0})` },
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'desc' && (
              <div className={styles.description}>
                <p style={{ lineHeight: '1.8' }}>{product.description}</p>
                <br />
                <p style={{ lineHeight: '1.8' }}>
                  Laptop được kiểm tra kỹ lưỡng trước khi xuất xưởng. Đi kèm đầy đủ phụ kiện
                  trong hộp: Sạc chính hãng, túi đựng, hướng dẫn sử dụng. Hỗ trợ cài đặt
                  phần mềm văn phòng miễn phí khi mua tại TechLap.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className={styles.specsTable}>
                {specEntries.map(([key, val]) => (
                  <div key={key} className={styles.specRow}>
                    <div className={styles.specRowKey}>{key}</div>
                    <div className={styles.specRowVal}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews 
                productId={product.id} 
                initialStats={{
                  average_rating: product.average_rating ?? product.rating,
                  total_reviews: product.total_reviews ?? product.reviews_count
                }}
                onStatsUpdate={(stats) => {
                  setProduct(p => ({
                    ...p,
                    average_rating: stats.average_rating,
                    total_reviews: stats.total_reviews
                  }))
                }}
              />
            )}
          </div>
        </div>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <div className={styles.related}>
            <div className="section-header">
              <h2 className="section-title">Sản phẩm tương tự</h2>
            </div>
            <div className="product-grid">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
