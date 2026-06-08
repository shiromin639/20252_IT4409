import { ArrowLeft, PackageCheck } from 'lucide-react';
import ProductMedia from '../components/catalog/ProductMedia';
import RatingEditor from '../components/orders/RatingEditor';
import { statusLabels } from '../constants/shop';
import { formatMoney } from '../utils/formatters';

function OrderDetailPage({
  navigate,
  orderId,
  orders,
  products,
  ratingDrafts,
  ratings,
  setRatingDrafts,
  submitRating,
}) {
  const order = orders.find((item) => item.id === Number(orderId));

  if (!order) {
    return (
      <section className="empty-state standalone">
        <PackageCheck size={38} />
        <h1>Không tìm thấy đơn hàng</h1>
        <button className="primary-button" type="button" onClick={() => navigate('/orders')}>
          Quay lại đơn hàng
        </button>
      </section>
    );
  }

  return (
    <div className="order-detail-page">
      <button className="ghost-button" type="button" onClick={() => navigate('/orders')}>
        <ArrowLeft size={17} />
        Đơn hàng
      </button>

      <section className="order-detail-panel">
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
          {order.voucher_code && <span>Voucher: {order.voucher_code}</span>}
          {order.payment_method && <span>Thanh toán: {order.payment_method.toUpperCase()}</span>}
        </div>

        <div className="order-line-list">
          {(order.items || []).map((item) => {
            const product = products.find((candidate) => candidate.id === Number(item.product_id));

            if (!product) {
              return null;
            }

            return (
              <article className="order-line" key={`${order.id}-${item.product_id}`}>
                <div className="order-thumb">
                  <ProductMedia product={product} />
                </div>
                <div>
                  <strong>{product.name}</strong>
                  <span>{item.quantity} x {formatMoney(item.unit_price)}</span>
                </div>
                <b>{formatMoney(item.quantity * item.unit_price)}</b>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <h1>Đánh giá</h1>
            <p>Chỉ mở với đơn đã giao</p>
          </div>
        </div>
        <div className="order-card">
          {(order.items || []).map((item) => {
            const product = products.find((candidate) => candidate.id === Number(item.product_id));

            if (!product) {
              return null;
            }

            return (
              <RatingEditor
                key={`${order.id}-${product.id}`}
                order={order}
                product={product}
                ratingDrafts={ratingDrafts}
                ratings={ratings}
                setRatingDrafts={setRatingDrafts}
                submitRating={submitRating}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default OrderDetailPage;
