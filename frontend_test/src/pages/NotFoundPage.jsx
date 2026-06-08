function NotFoundPage({ navigate }) {
  return (
    <section className="empty-state standalone">
      <h1>Trang không tồn tại</h1>
      <button className="primary-button" type="button" onClick={() => navigate('/')}>
        Về trang chủ
      </button>
    </section>
  );
}

export default NotFoundPage;
