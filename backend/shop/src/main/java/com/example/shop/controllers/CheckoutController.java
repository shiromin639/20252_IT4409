package com.example.shop.controllers;

import com.example.shop.payloads.dto.CheckoutPreviewDTO;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.CheckoutRequest;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private OrderService orderService;

    /**
     * Preview checkout — hiển thị danh sách sản phẩm, giá, và kết quả áp coupon.
     * Có thể gọi nhiều lần khi user thử nhập/thay đổi coupon.
     * Không tạo đơn hàng, không trừ stock.
     */
    @PostMapping("/preview")
    public ResponseEntity<CheckoutPreviewDTO> previewCheckout(
            @RequestParam(required = false) String couponCode) {
        Long userId = authUtil.loggedInUserId();
        CheckoutPreviewDTO preview = orderService.previewCheckout(userId, couponCode);
        return ResponseEntity.ok(preview);
    }

    /**
     * Xác nhận checkout — tạo đơn hàng, trừ stock, xoá giỏ hàng.
     * Nếu paymentMethod = "SEPAY", response sẽ chứa paymentUrl (link QR thanh toán).
     */
    @PostMapping("/confirm")
    public ResponseEntity<OrderDTO> confirmCheckout(@Valid @RequestBody CheckoutRequest request) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO orderDTO = orderService.confirmCheckout(userId, request);
        return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
    }
}
