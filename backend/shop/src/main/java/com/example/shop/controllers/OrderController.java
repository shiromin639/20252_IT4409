package com.example.shop.controllers;

import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.OrderRequest;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    // USER ENDPOINTS — /api/orders
    // ==========================================

    /** Đặt hàng từ cart hiện tại */
    @PostMapping("/orders")
    public ResponseEntity<OrderDTO> placeOrder(@Valid @RequestBody OrderRequest orderRequest) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO orderDTO = orderService.placeOrder(userId, orderRequest);
        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }

    /** Lấy danh sách đơn hàng của user đang đăng nhập */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders() {
        Long userId = authUtil.loggedInUserId();
        List<OrderDTO> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    /** Lấy chi tiết 1 đơn hàng */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO orderDTO = orderService.getOrderById(userId, orderId);
        return ResponseEntity.ok(orderDTO);
    }

    /** User hủy đơn (chỉ khi PENDING) */
    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long orderId) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO orderDTO = orderService.cancelOrder(userId, orderId);
        return ResponseEntity.ok(orderDTO);
    }

    // ==========================================
    // ADMIN ENDPOINTS — /api/admin/orders
    // ==========================================

    /** Admin: lấy tất cả đơn hàng */
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /** Admin: cập nhật trạng thái đơn hàng */
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        OrderDTO orderDTO = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(orderDTO);
    }
}
