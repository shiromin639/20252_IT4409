import { CreditCard, MapPin, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import OrderSummary from './OrderSummary';

function CheckoutView({
  cartLines,
  summary,
  form,
  setForm,
  paymentMethod,
  setPaymentMethod,
  placeOrder,
  placingOrder,
  checkoutError,
  appliedVoucher,
  setAppliedVoucher,
  onContinueShopping,
}) {
  if (!cartLines.length) {
    return (
      <section className="empty-state standalone">
        <CreditCard size={38} />
        <h1>Chưa có sản phẩm để thanh toán</h1>
        <button className="primary-button" type="button" onClick={onContinueShopping}>
          <ShoppingBag size={18} />
          Xem sản phẩm
        </button>
      </section>
    );
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="checkout-view" onSubmit={placeOrder}>
      <section className="checkout-form">
        <div className="section-heading">
          <div>
            <h1>Thanh toán</h1>
            <p>Thông tin nhận hàng</p>
          </div>
          <MapPin size={24} />
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Họ tên</span>
            <input value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
          </label>
          <label className="field wide">
            <span>Địa chỉ</span>
            <input value={form.address} onChange={(event) => updateField('address', event.target.value)} />
          </label>
          <label className="field">
            <span>Phường/Xã</span>
            <input value={form.ward} onChange={(event) => updateField('ward', event.target.value)} />
          </label>
          <label className="field">
            <span>Quận/Huyện</span>
            <input value={form.district} onChange={(event) => updateField('district', event.target.value)} />
          </label>
          <label className="field">
            <span>Tỉnh/Thành</span>
            <input value={form.city} onChange={(event) => updateField('city', event.target.value)} />
          </label>
          <label className="field wide">
            <span>Ghi chú</span>
            <textarea value={form.note} onChange={(event) => updateField('note', event.target.value)} rows="4" />
          </label>
        </div>

        <div className="payment-methods">
          <button
            type="button"
            className={paymentMethod === 'cod' ? 'payment active' : 'payment'}
            onClick={() => setPaymentMethod('cod')}
          >
            <Truck size={18} />
            COD
          </button>
          <button
            type="button"
            className={paymentMethod === 'bank' ? 'payment active' : 'payment'}
            onClick={() => setPaymentMethod('bank')}
          >
            <CreditCard size={18} />
            Chuyển khoản
          </button>
        </div>

        {checkoutError && <p className="form-error">{checkoutError}</p>}

        <button className="primary-button submit-order" type="submit" disabled={placingOrder}>
          <PackageCheck size={18} />
          {placingOrder ? 'Đang đặt hàng...' : 'Đặt hàng'}
        </button>
      </section>

      <OrderSummary summary={summary} appliedVoucher={appliedVoucher} setAppliedVoucher={setAppliedVoucher} />
    </form>
  );
}

export default CheckoutView;
