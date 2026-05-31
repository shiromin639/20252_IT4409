import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ShoppingCart, Star, Cpu, MemoryStick, HardDrive, Monitor } from 'lucide-react'
import { addToCartAsync } from '../../store/cartSlice'
import { formatPrice } from '../../utils'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addToCartAsync({ product }))
    toast.success(`Đã thêm ${product.name.slice(0, 30)}... vào giỏ hàng`)
  }

  const discountPercent = product.discount_percent || product.discount || 0
  const originalPrice = product.original_price || product.originalPrice || product.price

  return (
    <Link
      to={`/products/${product.id}`}
      className={styles.card}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className={styles.discountBadge}>
          -{discountPercent}%
        </div>
      )}

      {/* Image */}
      <div className={styles.imageWrap}>
        <img
          src={product.images?.[0] || product.image_url || product.image || product.specifications?.image_url || product.specs?.image_url || 'https://via.placeholder.com/400x300?text=Laptop'}
          alt={product.name || 'Product'}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay}>
          <button className={styles.quickAdd} onClick={handleAddToCart}>
            <ShoppingCart size={15} />
            MUA NGAY
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.brand}>{String(product.specifications?.brand || product.brand || 'Khác')}</div>
        <h3 className={styles.name}>{product.name || 'Sản phẩm'}</h3>

        {/* Specs Details */}
        <div className={styles.specList}>
          <div className={styles.specItem} title={product.specifications?.cpu || 'N/A'}>
            <Cpu size={12} />
            <span>{product.specifications?.cpu?.split(' ').slice(0, 4).join(' ') || 'N/A'}</span>
          </div>
          <div className={styles.specItem} title={product.specifications?.ram || 'N/A'}>
            <MemoryStick size={12} />
            <span>{product.specifications?.ram || 'N/A'}</span>
          </div>
          <div className={styles.specItem} title={product.specifications?.storage || 'N/A'}>
            <HardDrive size={12} />
            <span>{product.specifications?.storage || 'N/A'}</span>
          </div>
          <div className={styles.specItem} title={product.specifications?.gpu || 'N/A'}>
            <Monitor size={12} />
            <span>{product.specifications?.gpu || 'N/A'}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className={styles.pricing}>
          {discountPercent > 0 ? (
            <span className={styles.priceOriginal}>{formatPrice(originalPrice)}</span>
          ) : (
            <span className={styles.priceOriginal} style={{ opacity: 0 }}>0</span> // spacing placeholder
          )}
          <span className={styles.priceCurrent}>
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Meta */}
        <div className={styles.meta}>
          <div className={styles.rating}>
            <Star size={12} fill="currentColor" />
            <span>{product.rating ?? 5.0}</span>
          </div>
          <div className={styles.sold}>
            Đã bán {(product.total_sold || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  )
}
