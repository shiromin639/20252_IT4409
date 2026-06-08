import { ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import ProductMedia from '../catalog/ProductMedia';
import OrderSummary from '../checkout/OrderSummary';
import QuantityStepper from './QuantityStepper';
import { formatMoney } from '../../utils/formatters';

function CartView({
  cartLines,
  summary,
  updateQuantity,
  removeCartItem,
  clearCart,
  onCheckout,
  onContinueShopping,
  appliedVoucher,
  setAppliedVoucher,
}) {
  if (!cartLines.length) {
    return (
      <section className="empty-state standalone">
        <ShoppingCart size={38} />
        <h1>Giỏ hàng trống</h1>
        <button className="primary-button" type="button" onClick={onContinueShopping}>
          <ShoppingBag size={18} />
          Xem sản phẩm
        </button>
      </section>
    );
  }

  return (
    <div className="cart-view">
      <section className="cart-list">
        <div className="section-heading">
          <div>
            <h1>Giỏ hàng</h1>
            <p>{cartLines.length} sản phẩm đang chọn</p>
          </div>
          <button className="ghost-button" type="button" onClick={clearCart}>
            <Trash2 size={16} />
            Xóa giỏ
          </button>
        </div>

        {cartLines.map(({ product, quantity, lineTotal }) => (
          <article className="cart-item" key={product.id}>
            <div className="cart-thumb">
              <ProductMedia product={product} />
            </div>
            <div className="cart-info">
              <span>{product.brand}</span>
              <h2>{product.name}</h2>
              <p>{formatMoney(product.price)}</p>
            </div>
            <QuantityStepper quantity={quantity} max={product.stock} onChange={(next) => updateQuantity(product.id, next)} />
            <strong className="line-total">{formatMoney(lineTotal)}</strong>
            <button className="icon-button danger" type="button" aria-label="Xóa sản phẩm" onClick={() => removeCartItem(product.id)}>
              <Trash2 size={17} />
            </button>
          </article>
        ))}
      </section>

      <OrderSummary
        summary={summary}
        appliedVoucher={appliedVoucher}
        setAppliedVoucher={setAppliedVoucher}
        actionLabel="Sang thanh toán"
        onAction={onCheckout}
      />
    </div>
  );
}

export default CartView;
