package com.example.shop.controllers;

import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private OrderService orderService;

    // ==========================================
    // USER — /api/orders
    // ==========================================

    /** Lấy danh sách đơn hàng của user đang đăng nhập */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders() {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    /** Lấy chi tiết 1 đơn hàng */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(orderService.getOrderById(userId, orderId));
    }

    /** User hủy đơn (chỉ khi PENDING) */
    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long orderId) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(orderService.cancelOrder(userId, orderId));
    }

    // ==========================================
    // ADMIN — /api/admin/orders
    // ==========================================

    /** Admin: lấy tất cả đơn hàng */
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /** Admin: cập nhật trạng thái đơn hàng */
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}
