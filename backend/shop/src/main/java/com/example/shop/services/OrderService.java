package com.example.shop.services;

import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.OrderRequest;

import java.util.List;

public interface OrderService {

    // === User endpoints ===

    /** Đặt hàng từ cart hiện tại của user */
    OrderDTO placeOrder(Long userId, OrderRequest orderRequest);

    /** Lấy danh sách đơn hàng của user */
    List<OrderDTO> getOrdersByUserId(Long userId);

    /** Lấy chi tiết 1 đơn hàng (user chỉ xem được đơn của mình) */
    OrderDTO getOrderById(Long userId, Long orderId);

    /** User hủy đơn (chỉ khi status = PENDING) */
    OrderDTO cancelOrder(Long userId, Long orderId);

    // === Admin endpoints ===

    /** Admin lấy tất cả đơn hàng */
    List<OrderDTO> getAllOrders();

    /** Admin cập nhật trạng thái đơn hàng */
    OrderDTO updateOrderStatus(Long orderId, String status);
}
