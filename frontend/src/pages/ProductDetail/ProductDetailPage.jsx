import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ShoppingCart, Zap, Heart, Shield, Truck, RotateCcw, Star, ChevronRight, Check } from 'lucide-react'
import { productApi, inventoryApi } from '../../services/api'
import { addToCartAsync } from '../../store/cartSlice'
import { useWishlist } from '../../hooks'
import { formatPrice } from '../../utils'
import ProductCard from '../../components/product/ProductCard'
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
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setActiveImage(0)
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

        const relRes = await productApi.getAll({ brand: p.specifications?.brand || p.brand, limit: 5 })
        setRelated(relRes.data.filter(x => x.id !== p.id).slice(0, 4))
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
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    dispatch(addToCartAsync({ product, quantity }))
    navigate('/cart')
  }

  const specs = product.specifications || {}
  const specEntries = [
    ['Thương hiệu', specs.brand || 'N/A'],
    ['CPU', specs.cpu || 'N/A'],
    ['RAM', specs.ram || 'N/A'],
    ['Lưu trữ', specs.storage || 'N/A'],
    ['Màn hình', specs.screen || 'N/A'],
    ['GPU', specs.gpu || 'N/A'],
    ['Pin', specs.battery || 'N/A'],
    ['Hệ điều hành', specs.os || 'N/A'],
    ['Trọng lượng', specs.weight || 'N/A'],
  ].filter(([, val]) => val !== 'N/A')

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
              <img src={product.images?.[activeImage] || product.image || 'https://via.placeholder.com/600x400?text=Laptop'} alt={product.name} />
              {(product.discount || 0) > 0 && (
                <div className={styles.discountBadge}>-{product.discount}%</div>
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
            <div className={styles.infoBrand}>{product.brand.toUpperCase()}</div>
            <h1 className={styles.infoName}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <StarRating rating={product.rating || 5} size={16} />
              <span className={styles.ratingVal}>{product.rating || 5}</span>
              <span className={styles.ratingCount}>({product.reviews || 0} đánh giá)</span>
              <span className={styles.soldCount}>• Đã bán {(product.sold || 0).toLocaleString()}</span>
            </div>

            {/* Price */}
            <div className={styles.priceBox}>
              <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
              {(product.discount || 0) > 0 && (
                <div className={styles.priceRow}>
                  <span className="price-original" style={{ fontSize: 15 }}>
                    {formatPrice(product.originalPrice || product.price)}
                  </span>
                  <span className="price-discount">-{product.discount}%</span>
                </div>
              )}
              {product.isFlashSale && (
                <div className={styles.flashLabel}>
                  <Zap size={14} /> Flash Sale
                </div>
              )}
            </div>

            {/* Spec Quick List */}
            <div className={styles.specQuick}>
              {specEntries.slice(0, 4).map(([key, val]) => (
                <div key={key} className={styles.specQuickItem}>
                  <Check size={13} className={styles.specCheck} />
                  <span className={styles.specKey}>{key}:</span>
                  <span className={styles.specVal}>{val}</span>
                </div>
              ))}
            </div>

            {/* Stock */}
            <div className={styles.stockRow}>
              <div className={`${styles.stockDot} ${stock > 5 ? styles.inStock : styles.lowStock}`} />
              <span className={styles.stockText}>
                {stock > 5 ? 'Còn hàng' : stock > 0 ? `Chỉ còn ${stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {/* Quantity */}
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
                className={`btn btn-primary btn-lg ${styles.btnFull} ${addedToCart ? styles.btnAdded : ''}`}
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                {addedToCart ? <><Check size={18} /> Đã thêm!</> : <><ShoppingCart size={18} /> Thêm vào giỏ</>}
              </button>
              <button
                className={`btn btn-lg ${styles.btnBuyNow}`}
                onClick={handleBuyNow}
                disabled={stock === 0}
              >
                <Zap size={18} /> Mua ngay
              </button>
              <button
                className={`btn btn-icon btn-secondary ${wished ? styles.wishedBtn : ''}`}
                onClick={() => toggle(product.id)}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Guarantees */}
            <div className={styles.guarantees}>
              {[
                { icon: <Shield size={15} />, text: 'Bảo hành 12-24 tháng chính hãng' },
                { icon: <Truck size={15} />, text: 'Giao hàng toàn quốc 1-3 ngày' },
                { icon: <RotateCcw size={15} />, text: 'Đổi trả trong 15 ngày' },
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
              { id: 'specs', label: 'Thông số kỹ thuật' },
              { id: 'desc', label: 'Mô tả sản phẩm' },
              { id: 'reviews', label: `Đánh giá (${product.reviews || 0})` },
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

            {activeTab === 'desc' && (
              <div className={styles.description}>
                <p>{product.description}</p>
                <p>
                  Laptop được kiểm tra kỹ lưỡng trước khi xuất xưởng. Đi kèm đầy đủ phụ kiện
                  trong hộp: Sạc chính hãng, túi đựng, hướng dẫn sử dụng. Hỗ trợ cài đặt
                  phần mềm văn phòng miễn phí khi mua tại TechLap.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviews}>
                <div className={styles.reviewSummary}>
                  <div className={styles.reviewScore}>{product.rating || 5}</div>
                  <div>
                    <StarRating rating={product.rating || 5} size={20} />
                    <p>{product.reviews || 0} đánh giá</p>
                  </div>
                </div>
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className={styles.reviewBar}>
                    <span>{star} ★</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <div className={styles.related}>
            <div className="section-header">
              <h2 className="section-title">Sản phẩm liên quan</h2>
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
