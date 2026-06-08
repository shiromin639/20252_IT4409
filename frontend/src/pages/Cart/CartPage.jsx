import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag } from 'lucide-react'
import { selectCartItems, selectCartTotal, removeFromCartAsync, updateQuantityAsync } from '../../store/cartSlice'
import { Image } from '../../components/common'
import { formatPrice } from '../../utils'
import toast from 'react-hot-toast'
import styles from './Cart.module.css'

export default function CartPage() {
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const dispatch = useDispatch()

  const handleRemove = (id, name) => {
    dispatch(removeFromCartAsync(id))
    toast.success(`Đã xóa ${name.slice(0, 25)}...`)
  }

  const shipping = total >= 5000000 ? 0 : 150000
  const finalTotal = total + shipping

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingCart size={36} />
          </div>
          <h3>Giỏ hàng trống</h3>
          <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Tiếp tục mua sắm <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.pageTitle}>Giỏ hàng ({items.length} sản phẩm)</h1>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.items}>
            {items.map(item => (
              <div key={item.id} className={styles.item}>
                <Link to={`/products/${item.id}`} className={styles.itemImage}>
                  <Image 
                    src={item.image_url || item.image || item.specifications?.image_url || item.specs?.image_url} 
                    alt={item.name || 'Product'} 
                    category={item.category?.name || item.category_name || ''}
                    productName={item.name || ''}
                    brand={item.brand || item.specifications?.brand || ''}
                  />
                </Link>

                <div className={styles.itemInfo}>
                  <Link to={`/products/${item.id}`} className={styles.itemBrand}>
                    {(item.specifications?.brand || item.brand || 'Khác').toUpperCase()}
                  </Link>
                  <Link to={`/products/${item.id}`} className={styles.itemName}>
                    {item.name}
                  </Link>
                  <div className={styles.itemSpecs}>
                    {item.specifications?.cpu?.split(' ').slice(0, 3).join(' ') || 'CPU'} · {item.specifications?.ram || 'RAM'} · {item.specifications?.storage || 'SSD'}
                  </div>
                </div>

                <div className={styles.itemControls}>
                  <div className={styles.qtyControl}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => dispatch(updateQuantityAsync({ id: item.id, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyVal}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => dispatch(updateQuantityAsync({ id: item.id, quantity: item.quantity + 1 }))}
                      disabled={item.quantity >= (item.stock || 10)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className={styles.itemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(item.id, item.name)}
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>

            <div className={styles.promoRow}>
              <Tag size={15} />
              <input type="text" placeholder="Mã giảm giá" className={styles.promoInput} />
              <button className="btn btn-secondary btn-sm">Áp dụng</button>
            </div>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? styles.freeShip : ''}>
                  {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && (
                <div className={styles.freeShipNote}>
                  🎉 Bạn được miễn phí vận chuyển!
                </div>
              )}
              {shipping > 0 && (
                <div className={styles.shippingNote}>
                  Mua thêm {formatPrice(5000000 - total)} để được miễn phí vận chuyển
                </div>
              )}
            </div>

            <div className={styles.totalRow}>
              <span>Tổng cộng</span>
              <span className={styles.totalPrice}>{formatPrice(finalTotal)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Tiến hành thanh toán <ArrowRight size={16} />
            </Link>

            <Link to="/products" className={styles.continueShopping}>
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
