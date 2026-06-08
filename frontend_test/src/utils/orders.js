export function buildShippingAddress(form) {
  return [form.address, form.ward, form.district, form.city]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

export function buildOrderItems(cartLines) {
  return cartLines.map((line) => ({
    product_id: line.product.id,
    quantity: line.quantity,
    unit_price: line.product.price,
  }));
}

export function createLocalOrder({
  createdOrder,
  items,
  paymentMethod,
  appliedVoucher,
  shippingAddress,
  summary,
  userId,
}) {
  const orderId = createdOrder?.id || Math.floor(Date.now() / 1000);

  return {
    id: orderId,
    user_id: userId,
    status: createdOrder?.status || 'pending',
    total_amount: Number(createdOrder?.total_amount || summary.total),
    shipping_address: createdOrder?.shipping_address || shippingAddress,
    created_at: createdOrder?.created_at || new Date().toISOString(),
    updated_at: createdOrder?.updated_at || new Date().toISOString(),
    items: items.map((item, index) => ({
      ...item,
      id: index + 1,
      order_id: orderId,
    })),
    payment_method: paymentMethod,
    voucher_code: appliedVoucher?.code || null,
  };
}
