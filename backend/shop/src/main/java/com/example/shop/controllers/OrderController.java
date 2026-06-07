package com.example.shop.controllers;

import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "6. Orders", description = "Order management — view, cancel (user), update status (admin)")
public class OrderController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private OrderService orderService;

    // ==========================================
    // USER — My orders
    // ==========================================

    @Operation(summary = "Get my orders", description = "Returns all orders for the currently logged-in user, sorted by newest first.")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getMyOrders() {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @Operation(summary = "Get order details", description = "Get full details of a specific order including items, voucher info, and rating eligibility.")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(orderService.getOrderById(userId, orderId));
    }

    @Operation(summary = "Cancel order", description = "Cancel a `PENDING` or `AWAITING_PAYMENT` order. Stock is restored and voucher usage is decremented.")
    @ApiResponse(responseCode = "200", description = "Order cancelled, stock restored")
    @ApiResponse(responseCode = "400", description = "Order cannot be cancelled (already confirmed/shipped/delivered)")
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long orderId) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(orderService.cancelOrder(userId, orderId));
    }

    // ==========================================
    // ADMIN — Order management
    // ==========================================

    @Operation(summary = "Get all orders (admin)", description = "**Admin only.** Returns all orders in the system sorted by newest first.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @Operation(summary = "Update order status (admin)",
            description = """
                    **Admin only.** Update order status with state machine validation.
                    
                    Valid transitions:
                    - `PENDING` → `CONFIRMED`, `CANCELLED`
                    - `AWAITING_PAYMENT` → `CONFIRMED`, `CANCELLED`
                    - `CONFIRMED` → `SHIPPING`, `CANCELLED`
                    - `SHIPPING` → `DELIVERED`
                    - `DELIVERED` / `CANCELLED` → (final, no changes allowed)
                    
                    When cancelling, stock is restored and voucher usage is decremented.""")
    @ApiResponse(responseCode = "200", description = "Status updated")
    @ApiResponse(responseCode = "400", description = "Invalid status transition")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @Parameter(description = "Target status", example = "CONFIRMED") @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}
