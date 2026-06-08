import { ShieldCheck, ShoppingBag, ShoppingCart, Star } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';
import ProductMedia from './ProductMedia';

function ProductDetail({ product, categoryName, ratings, onAddToCart }) {
  if (!product) {
    return (
      <section className="detail-panel empty-state">
        <ShoppingBag size={32} />
        <p>Chọn một sản phẩm để xem chi tiết.</p>
      </section>
    );
  }

  const rating = ratings[product.id];

  return (
    <section className="detail-panel">
      <div className="detail-media">
        <ProductMedia product={product} />
      </div>

      <div className="detail-copy">
        <span className="eyebrow">{categoryName}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="detail-price">
          <strong>{formatMoney(product.price)}</strong>
          {product.original_price && <del>{formatMoney(product.original_price)}</del>}
        </div>
        <div className="stock-row">
          <ShieldCheck size={17} />
          <span>{product.stock} sản phẩm sẵn sàng</span>
        </div>
        <button className="primary-button" type="button" onClick={() => onAddToCart(product.id, 1)}>
          <ShoppingCart size={18} />
          Thêm vào giỏ
        </button>
      </div>

      <div className="spec-grid">
        {Object.entries(product.specifications || {}).map(([key, value]) => (
          <div key={key}>
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {rating && (
        <div className="review-snippet">
          <div className="stars">
            {Array.from({ length: rating.stars }).map((_, index) => (
              <Star key={index} size={14} fill="currentColor" />
            ))}
          </div>
          <p>{rating.comment}</p>
        </div>
      )}
    </section>
  );
}

export default ProductDetail;
