import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, ShoppingCart, Trash2, ChevronRight } from 'lucide-react'
import { selectWishlistItems, toggleWishlistAsync, fetchWishlist } from '../../store/wishlistSlice'
import { addToCartAsync } from '../../store/cartSlice'
import { formatPrice } from '../../utils'
import { LoadingPage, Image } from '../../components/common'
import styles from './WishlistPage.module.css'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const wishlistItems = useSelector(selectWishlistItems)
  const loading = useSelector(state => state.wishlist.loading)
  
  // Since Redux might only have the IDs if we toggled optimistically, we should fetch full list on mount
  useEffect(() => {
    dispatch(fetchWishlist())
  }, [dispatch])

  const handleRemove = (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
      dispatch(toggleWishlistAsync(productId))
    }
  }

  const handleAddToCart = (product) => {
    dispatch(addToCartAsync({ product }))
  }

  if (loading && wishlistItems.length === 0) {
    return <LoadingPage />
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <span>Sản phẩm yêu thích</span>
        </nav>

        <h1 className={styles.title}>Danh sách yêu thích</h1>

        {wishlistItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Heart size={48} />
            </div>
            <h2>Bạn chưa có sản phẩm yêu thích</h2>
            <p>Hãy khám phá các sản phẩm của chúng tôi và lưu lại những món đồ bạn ưng ý nhé.</p>
            <Link to="/products" className="btn btn-primary btn-lg">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {wishlistItems.map((product) => {
              // Handle placeholder objects created by optimistic UI
              if (!product.name) return null;
              
              const discountPercent = product.discount_percent || product.discount || 0;
              const originalPrice = product.original_price || product.originalPrice || product.price;
              const stock = product.stock ?? 10;
              
              return (
                <div key={product.id} className={styles.card}>
                  <Link to={`/products/${product.id}`} className={styles.imageWrap}>
                    <Image 
                      src={product.images?.[0] || product.image_url || product.image || product.specifications?.image_url || product.specs?.image_url} 
                      alt={product.name} 
                      category={product.category?.name || product.category_name || ''}
                      productName={product.name || ''}
                      brand={product.brand || product.specifications?.brand || ''}
                    />
                  </Link>
                  
                  <div className={styles.info}>
                    <div className={styles.brand}>{product.brand || product.specifications?.brand || 'TechLap'}</div>
                    <Link to={`/products/${product.id}`} className={styles.name}>{product.name}</Link>
                    
                    <div className={styles.pricing}>
                      <span className={styles.price}>{formatPrice(product.price)}</span>
                      {discountPercent > 0 && <del className={styles.originalPrice}>{formatPrice(originalPrice)}</del>}
                    </div>
                    
                    <div className={styles.meta}>
                      <span className={styles.rating}>★ {product.average_rating ?? 5.0}</span>
                      <span className={stock > 0 ? styles.inStock : styles.outOfStock}>
                        {stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.actions}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product)}
                      disabled={stock === 0}
                    >
                      <ShoppingCart size={16} /> Thêm vào giỏ
                    </button>
                    <button 
                      className="btn btn-secondary btn-icon"
                      onClick={() => handleRemove(product.id)}
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
