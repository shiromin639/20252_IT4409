import { Clock3, Star } from 'lucide-react';
import ProductMedia from '../catalog/ProductMedia';

function RatingEditor({ product, order, ratings, ratingDrafts, setRatingDrafts, submitRating }) {
  const key = `${order.id}-${product.id}`;
  const existing = ratings[product.id];
  const draft = ratingDrafts[key] || {
    stars: existing?.stars || 5,
    comment: existing?.comment || '',
  };
  const canRate = order.status === 'delivered';

  function updateDraft(patch) {
    setRatingDrafts((current) => ({
      ...current,
      [key]: { ...draft, ...patch },
    }));
  }

  return (
    <div className="rating-editor">
      <div className="rating-product">
        <div className="order-thumb">
          <ProductMedia product={product} />
        </div>
        <div>
          <strong>{product.name}</strong>
          <span>{product.brand}</span>
        </div>
      </div>

      {canRate ? (
        <div className="rating-form">
          <div className="star-buttons">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={draft.stars >= star ? 'star-button active' : 'star-button'}
                onClick={() => updateDraft({ stars: star })}
                aria-label={`${star} sao`}
              >
                <Star size={18} fill="currentColor" />
              </button>
            ))}
          </div>
          <textarea
            value={draft.comment}
            onChange={(event) => updateDraft({ comment: event.target.value })}
            placeholder="Nhận xét sau khi nhận hàng"
            rows="3"
          />
          <button className="ghost-button" type="button" onClick={() => submitRating(product.id, order.id, draft)}>
            <Star size={16} />
            {existing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </button>
        </div>
      ) : (
        <div className="rating-locked">
          <Clock3 size={16} />
          <span>Đánh giá mở khi đơn đã giao.</span>
        </div>
      )}
    </div>
  );
}

export default RatingEditor;
