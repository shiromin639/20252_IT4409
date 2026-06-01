package com.example.shop.services;

import com.example.shop.payloads.dto.CheckoutPreviewDTO;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.CheckoutRequest;

import java.util.List;

public interface OrderService {

    // === Checkout ===

    /** Xem trước đơn hàng trên màn hình checkout (không lưu DB, không trừ stock) */
    CheckoutPreviewDTO previewCheckout(Long userId, String couponCode);

    /** Xác nhận checkout — tạo đơn hàng, trừ stock, xoá giỏ hàng */
    OrderDTO confirmCheckout(Long userId, CheckoutRequest request);

    // === User: Quản lý đơn hàng ===

    List<OrderDTO> getOrdersByUserId(Long userId);

    OrderDTO getOrderById(Long userId, Long orderId);

    OrderDTO cancelOrder(Long userId, Long orderId);

    // === Admin ===

    List<OrderDTO> getAllOrders();

    OrderDTO updateOrderStatus(Long orderId, String status);

    // === Payment callbacks ===

    /** Xử lý webhook thanh toán từ SePay */
    OrderDTO processSePayPayment(Long orderId, Double amount);

    /** Lấy đơn hàng theo ID (không check ownership, dùng cho payment) */
    OrderDTO getOrderByIdRaw(Long orderId);
}
