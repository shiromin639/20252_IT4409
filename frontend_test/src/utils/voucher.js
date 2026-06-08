import { vouchers } from '../data/mockData';
import { formatMoney } from './formatters';

export function evaluateVoucher(code, subtotal) {
  const normalizedCode = code.trim().toUpperCase();
  const voucher = vouchers.find((item) => item.code === normalizedCode);

  if (!voucher) {
    return {
      voucher: null,
      discount: 0,
      freeShipping: false,
      error: 'Mã voucher không hợp lệ.',
    };
  }

  if (subtotal < voucher.minSubtotal) {
    return {
      voucher,
      discount: 0,
      freeShipping: false,
      error: `Đơn tối thiểu ${formatMoney(voucher.minSubtotal)}.`,
    };
  }

  if (voucher.type === 'percent') {
    const discount = Math.min((subtotal * voucher.value) / 100, voucher.maxDiscount);

    return { voucher, discount, freeShipping: false, error: '' };
  }

  if (voucher.type === 'fixed') {
    return { voucher, discount: voucher.value, freeShipping: false, error: '' };
  }

  return { voucher, discount: 0, freeShipping: true, error: '' };
}
