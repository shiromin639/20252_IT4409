import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react'
import { addToCartAsync } from '../../store/cartSlice'
import { useWishlist } from '../../hooks'
import { formatPrice } from '../../utils'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const { toggle, isWished } = useWishlist()
  const wished = isWished(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addToCartAsync({ product }))
    toast.success(`Đã thêm ${product.name.slice(0, 30)}... vào giỏ hàng`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
    toast(wished ? 'Đã xóa khỏi yêu thích' : '❤️ Đã thêm vào yêu thích')
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Badges */}
      <div className={styles.badges}>
        {product.isNew && <span className={`badge badge-primary ${styles.badge}`}>Mới</span>}
        {product.isFlashSale && (
          <span className={`badge badge-danger ${styles.badge}`}>
            <Zap size={10} /> Sale
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        className={`${styles.wishBtn} ${wished ? styles.wished : ''}`}
        onClick={handleWishlist}
        aria-label="Wishlist"
      >
        <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <div className={styles.imageWrap}>
        <img
          src={product.image || 'https://via.placeholder.com/400x300?text=Laptop'}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay}>
          <button className={styles.quickAdd} onClick={handleAddToCart}>
            <ShoppingCart size={15} />
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.brand}>{(product.specifications?.brand || product.brand || 'Khác').toUpperCase()}</div>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Specs Pills */}
        <div className={styles.specPills}>
          <span className={styles.pill}>{product.specifications?.cpu?.split(' ').slice(0, 3).join(' ') || 'CPU'}</span>
          <span className={styles.pill}>{product.specifications?.ram || 'RAM'}</span>
          <span className={styles.pill}>{product.specifications?.storage || 'SSD'}</span>
        </div>

        {/* Rating */}
        <div className={styles.meta}>
          <div className={styles.rating}>
            <Star size={12} fill="currentColor" className={styles.starIcon} />
            <span>{product.rating || 5}</span>
            <span className={styles.reviews}>({product.reviews || 0})</span>
          </div>
          <span className={styles.sold}>Đã bán {(product.sold || 0).toLocaleString()}</span>
        </div>

        {/* Price */}
        <div className={styles.pricing}>
          <span className={`price-current ${styles.price}`}>
            {formatPrice(product.price)}
          </span>
          {(product.discount || 0) > 0 && (
            <div className={styles.discountRow}>
              <span className="price-original">{formatPrice(product.originalPrice || product.price)}</span>
              <span className="price-discount">-{product.discount}%</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
