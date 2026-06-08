import { useState } from 'react';
import { BadgePercent, CheckCircle2 } from 'lucide-react';
import { vouchers } from '../../data/mockData';
import { evaluateVoucher } from '../../utils/voucher';

function VoucherBox({ subtotal, appliedVoucher, setAppliedVoucher }) {
  const [code, setCode] = useState(appliedVoucher?.code || '');
  const result = appliedVoucher ? evaluateVoucher(appliedVoucher.code, subtotal) : null;

  function applyVoucher(event) {
    event.preventDefault();
    const evaluation = evaluateVoucher(code, subtotal);

    if (!evaluation.error && evaluation.voucher) {
      setAppliedVoucher(evaluation.voucher);
    }
  }

  return (
    <div className="voucher-box">
      <div className="panel-title compact">
        <BadgePercent size={18} />
        <h3>Voucher</h3>
      </div>
      <form className="voucher-form" onSubmit={applyVoucher}>
        <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="SAVE10, LAPTOP500" />
        <button type="submit">Áp dụng</button>
      </form>
      {result?.error && <p className="form-error">{result.error}</p>}
      {result && !result.error && (
        <div className="voucher-applied">
          <CheckCircle2 size={16} />
          <span>{result.voucher.label}</span>
          <button type="button" onClick={() => setAppliedVoucher(null)}>
            Bỏ
          </button>
        </div>
      )}
      <div className="voucher-list">
        {vouchers.map((voucher) => (
          <button key={voucher.code} type="button" onClick={() => setCode(voucher.code)}>
            {voucher.code}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VoucherBox;
