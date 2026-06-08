import { PackageCheck } from 'lucide-react';
import { statusLabels } from '../../constants/shop';
import { formatMoney } from '../../utils/formatters';
import RatingEditor from './RatingEditor';

function OrdersView({ navigate, orders, products, ratings, ratingDrafts, setRatingDrafts, submitRating }) {
  return (
    <section className="orders-view">
      <div className="section-heading">
        <div>
          <h1>Đơn hàng</h1>
          <p>Theo dõi trạng thái và đánh giá sản phẩm đã nhận</p>
        </div>
        <PackageCheck size={25} />
      </div>

      <div className="order-list">
        {orders.map((order) => {
          const orderItems = order.items || [];

          return (
            <article className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <span>Mã đơn #{order.id}</span>
                  <h2>{formatMoney(order.total_amount)}</h2>
                </div>
                <span className={`order-status ${order.status}`}>{statusLabels[order.status] || order.status}</span>
              </div>

              <div className="order-meta">
                <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                <span>{order.shipping_address}</span>
                <button type="button" onClick={() => navigate(`/orders/${order.id}`)}>
                  Xem chi tiết
                </button>
              </div>

              <div className="order-items">
                {orderItems.map((item) => {
                  const product = products.find((candidate) => candidate.id === Number(item.product_id));

                  if (!product) {
                    return null;
                  }

                  return (
                    <RatingEditor
                      key={`${order.id}-${product.id}`}
                      product={product}
                      order={order}
                      ratings={ratings}
                      ratingDrafts={ratingDrafts}
                      setRatingDrafts={setRatingDrafts}
                      submitRating={submitRating}
                    />
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default OrdersView;
