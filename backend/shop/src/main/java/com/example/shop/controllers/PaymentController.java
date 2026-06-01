package com.example.shop.controllers;

import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.SePayWebhookRequest;
import com.example.shop.payloads.response.PaymentQrResponse;
import com.example.shop.payloads.response.SePayWebhookResponse;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import com.example.shop.utils.SePayUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private SePayUtil sePayUtil;

    @Autowired
    private AuthUtil authUtil;

    /**
     * Tạo QR thanh toán SePay cho đơn hàng PENDING.
     * Dùng khi user muốn lấy lại QR hoặc chuyển từ COD sang chuyển khoản.
     */
    @GetMapping("/qr")
    public ResponseEntity<PaymentQrResponse> getPaymentQr(@RequestParam Long orderId) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO order = orderService.getOrderById(userId, orderId);

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Order is not in PENDING state. Current: " + order.getStatus());
        }

        String qrUrl = sePayUtil.createPaymentUrl(orderId, order.getTotalPrice().doubleValue());
        String description = "DH" + orderId;

        PaymentQrResponse response = new PaymentQrResponse(
                qrUrl, orderId, order.getTotalPrice().toPlainString(), description);

        return ResponseEntity.ok(response);
    }

    /**
     * Webhook nhận thông báo giao dịch từ SePay.
     * PUBLIC endpoint, bảo mật bằng API Key trong Header.
     */
    @PostMapping("/sepay-webhook")
    public ResponseEntity<SePayWebhookResponse> sePayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SePayWebhookRequest request) {

        // 1. Xác thực API Key
        if (!sePayUtil.verifyApiKey(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new SePayWebhookResponse(false, "Unauthorized"));
        }

        // 2. Trích xuất Order ID từ mã giao dịch (VD: "DH12" → 12)
        String code = request.getCode();
        if (code == null || code.isBlank()) {
            code = request.getContent();
        }
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new SePayWebhookResponse(false, "Missing transaction code"));
        }

        String digits = code.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new SePayWebhookResponse(false, "Cannot extract Order ID from: " + code));
        }

        Long orderId = Long.parseLong(digits);

        // 3. Kiểm tra số tiền
        if (request.getTransferAmount() == null) {
            return ResponseEntity.badRequest()
                    .body(new SePayWebhookResponse(false, "Missing transfer amount"));
        }

        // 4. Xử lý thanh toán
        try {
            orderService.processSePayPayment(orderId, request.getTransferAmount().doubleValue());
            return ResponseEntity.ok(
                    new SePayWebhookResponse(true, "Payment confirmed for order #" + orderId));
        } catch (IllegalStateException e) {
            // Đã xử lý rồi — trả 200 để SePay không retry
            return ResponseEntity.ok(new SePayWebhookResponse(true, e.getMessage()));
        }
    }
}
