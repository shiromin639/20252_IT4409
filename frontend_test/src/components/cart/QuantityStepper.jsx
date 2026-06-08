import { Minus, Plus } from 'lucide-react';

function QuantityStepper({ quantity, onChange, max }) {
  return (
    <div className="quantity-stepper">
      <button type="button" aria-label="Giảm số lượng" onClick={() => onChange(quantity - 1)}>
        <Minus size={14} />
      </button>
      <input value={quantity} onChange={(event) => onChange(Number(event.target.value) || 1)} />
      <button type="button" aria-label="Tăng số lượng" onClick={() => onChange(Math.min(max, quantity + 1))}>
        <Plus size={14} />
      </button>
    </div>
  );
}

export default QuantityStepper;
