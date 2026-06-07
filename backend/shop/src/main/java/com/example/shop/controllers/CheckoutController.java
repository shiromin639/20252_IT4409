package com.example.shop.controllers;

import com.example.shop.payloads.dto.CheckoutPreviewDTO;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.CheckoutRequest;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@PreAuthorize("isAuthenticated()")
@Tag(name = "5. Checkout", description = "Order checkout flow — preview and confirm")
public class CheckoutController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private OrderService orderService;

    @Operation(summary = "Preview checkout",
            description = """
                    Preview the checkout with current cart contents. Calculates subtotal, applies voucher discount,
                    and returns saved addresses. **Does not create an order or modify stock.**
                    Can be called multiple times as user changes voucher code.""")
    @PostMapping("/preview")
    public ResponseEntity<CheckoutPreviewDTO> previewCheckout(
            @Parameter(description = "Optional voucher code to apply") @RequestParam(required = false) String voucherCode) {
        Long userId = authUtil.loggedInUserId();
        CheckoutPreviewDTO preview = orderService.previewCheckout(userId, voucherCode);
        return ResponseEntity.ok(preview);
    }

    @Operation(summary = "Confirm checkout",
            description = """
                    Confirm the order — creates the order, deducts stock, clears the cart.
                    - **COD**: Order starts as `PENDING` (admin confirms).
                    - **SEPAY**: Order starts as `AWAITING_PAYMENT` with a QR payment URL in the response.
                    
                    Provide either `addressId` (from saved addresses) or `shippingAddress` (typed directly).""")
    @ApiResponse(responseCode = "201", description = "Order created successfully")
    @ApiResponse(responseCode = "400", description = "Validation error (empty cart, insufficient stock, invalid voucher)")
    @PostMapping("/confirm")
    public ResponseEntity<OrderDTO> confirmCheckout(@Valid @RequestBody CheckoutRequest request) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO orderDTO = orderService.confirmCheckout(userId, request);
        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }
}
