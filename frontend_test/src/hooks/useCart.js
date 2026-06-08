import { useMemo, useState } from 'react';
import { shopApi } from '../api/client';
import { initialCart } from '../data/mockData';
import { USER_ID } from '../constants/shop';
import { evaluateVoucher } from '../utils/voucher';

export function useCart(products) {
  const [cartItems, setCartItems] = useState(initialCart);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  const cartLines = useMemo(() => (
    cartItems
      .map((item) => {
        const product = products.find((candidate) => candidate.id === Number(item.productId));

        if (!product) {
          return null;
        }

        return {
          ...item,
          product,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean)
  ), [cartItems, products]);

  const summary = useMemo(() => {
    const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
    const voucherResult = appliedVoucher ? evaluateVoucher(appliedVoucher.code, subtotal) : null;
    const discount = voucherResult && !voucherResult.error ? voucherResult.discount : 0;
    const shipping = subtotal === 0 || subtotal >= 50000000 || voucherResult?.freeShipping ? 0 : 30000;

    return {
      subtotal,
      discount,
      shipping,
      total: Math.max(0, subtotal - discount + shipping),
    };
  }, [appliedVoucher, cartLines]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(productId, quantity = 1) {
    const product = products.find((item) => item.id === Number(productId));

    if (!product || product.stock <= 0) {
      return;
    }

    setCartItems((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (!existing) {
        return [...current, { productId: product.id, quantity }];
      }

      return current.map((item) => (
        item.productId === product.id
          ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
          : item
      ));
    });

    shopApi.addCartItem(USER_ID, { productId: product.id, quantity }).catch(() => {});
  }

  function removeCartItem(productId) {
    setCartItems((current) => current.filter((item) => item.productId !== productId));
    shopApi.removeCartItem(USER_ID, productId).catch(() => {});
  }

  function updateQuantity(productId, nextQuantity) {
    const product = products.find((item) => item.id === Number(productId));
    const clamped = Math.max(0, Math.min(product?.stock || 99, nextQuantity));

    if (clamped === 0) {
      removeCartItem(productId);
      return;
    }

    setCartItems((current) => current.map((item) => (
      item.productId === productId ? { ...item, quantity: clamped } : item
    )));

    shopApi.updateCartItem(USER_ID, productId, clamped).catch(() => {});
  }

  function clearCart() {
    setCartItems([]);
    setAppliedVoucher(null);
    shopApi.clearCart(USER_ID).catch(() => {});
  }

  return {
    addToCart,
    appliedVoucher,
    cartCount,
    cartLines,
    clearCart,
    removeCartItem,
    setAppliedVoucher,
    summary,
    updateQuantity,
  };
}
