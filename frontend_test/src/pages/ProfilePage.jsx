import { LogOut, User } from 'lucide-react';
import { formatMoney } from '../utils/formatters';

function ProfilePage({ logout, navigate, orders, summary, user }) {
  if (!user) {
    return (
      <section className="empty-state standalone">
        <User size={38} />
        <h1>Bạn chưa đăng nhập</h1>
        <button className="primary-button" type="button" onClick={() => navigate('/login')}>
          Đăng nhập
        </button>
      </section>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-panel">
        <div className="section-heading">
          <div>
            <h1>{user.fullName}</h1>
            <p>@{user.username}</p>
          </div>
          <button className="ghost-button" type="button" onClick={logout}>
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>

        <div className="profile-grid">
          <div>
            <span>Email</span>
            <strong>{user.email || 'Chưa cập nhật'}</strong>
          </div>
          <div>
            <span>Số điện thoại</span>
            <strong>{user.phone || 'Chưa cập nhật'}</strong>
          </div>
          <div>
            <span>Tổng đơn</span>
            <strong>{orders.length}</strong>
          </div>
          <div>
            <span>Giỏ hiện tại</span>
            <strong>{formatMoney(summary.total)}</strong>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <h1>Đơn gần đây</h1>
            <p>Theo dõi trạng thái mua hàng</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => navigate('/orders')}>
            Xem tất cả
          </button>
        </div>
        <div className="profile-order-list">
          {orders.slice(0, 3).map((order) => (
            <button key={order.id} type="button" onClick={() => navigate(`/orders/${order.id}`)}>
              <span>#{order.id}</span>
              <strong>{formatMoney(order.total_amount)}</strong>
              <small>{order.status}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
