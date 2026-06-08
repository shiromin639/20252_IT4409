import { CreditCard } from 'lucide-react';
import VoucherBox from './VoucherBox';
import { formatMoney } from '../../utils/formatters';

function OrderSummary({ summary, appliedVoucher, setAppliedVoucher, actionLabel, onAction, disabled }) {
  return (
    <aside className="summary-panel">
      <h2>Tổng đơn</h2>
      <div className="summary-lines">
        <div>
          <span>Tạm tính</span>
          <strong>{formatMoney(summary.subtotal)}</strong>
        </div>
        <div>
          <span>Giảm giá</span>
          <strong>-{formatMoney(summary.discount)}</strong>
        </div>
        <div>
          <span>Vận chuyển</span>
          <strong>{summary.shipping === 0 ? 'Miễn phí' : formatMoney(summary.shipping)}</strong>
        </div>
      </div>
      <VoucherBox subtotal={summary.subtotal} appliedVoucher={appliedVoucher} setAppliedVoucher={setAppliedVoucher} />
      <div className="summary-total">
        <span>Thanh toán</span>
        <strong>{formatMoney(summary.total)}</strong>
      </div>
      {onAction && (
        <button className="primary-button full" type="button" onClick={onAction} disabled={disabled}>
          <CreditCard size={18} />
          {actionLabel}
        </button>
      )}
    </aside>
  );
}

export default OrderSummary;
