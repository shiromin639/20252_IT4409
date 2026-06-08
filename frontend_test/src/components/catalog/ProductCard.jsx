import { ShoppingCart, Star } from 'lucide-react';
import { compactNumber, formatMoney } from '../../utils/formatters';
import ProductMedia from './ProductMedia';

function ProductCard({ product, selected, onSelect, onAdd }) {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <article className={selected ? 'product-card selected' : 'product-card'}>
      <button className="product-main" type="button" onClick={onSelect}>
        <div className="product-media">
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
          <ProductMedia product={product} />
        </div>
        <div className="product-copy">
          <span className="sku">{product.sku}</span>
          <h3>{product.name}</h3>
          <div className="rating-line">
            <Star size={15} fill="currentColor" />
            <span>{product.rating}</span>
            <small>Đã bán {compactNumber(product.sold)}</small>
          </div>
          <div className="price-row">
            <strong>{formatMoney(product.price)}</strong>
            {product.original_price && <del>{formatMoney(product.original_price)}</del>}
          </div>
        </div>
      </button>
      <button className="add-button" type="button" onClick={onAdd}>
        <ShoppingCart size={17} />
        Thêm
      </button>
    </article>
  );
}

export default ProductCard;
