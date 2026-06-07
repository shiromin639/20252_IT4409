package com.example.shop.controllers;

import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.request.SePayWebhookRequest;
import com.example.shop.payloads.response.PaymentQrResponse;
import com.example.shop.payloads.response.SePayWebhookResponse;
import com.example.shop.services.OrderService;
import com.example.shop.utils.AuthUtil;
import com.example.shop.utils.SePayUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "7. Payments", description = "SePay QR payment generation and webhook processing")
public class PaymentController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private SePayUtil sePayUtil;

    @Autowired
    private AuthUtil authUtil;

    @Operation(summary = "Get payment QR",
            description = "Generate or retrieve the SePay QR payment URL for an `AWAITING_PAYMENT` order. User can use this to get the QR code again if they didn't pay immediately.")
    @ApiResponse(responseCode = "200", description = "QR URL returned")
    @ApiResponse(responseCode = "400", description = "Order is not in AWAITING_PAYMENT status")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/qr")
    public ResponseEntity<PaymentQrResponse> getPaymentQr(@RequestParam Long orderId) {
        Long userId = authUtil.loggedInUserId();
        OrderDTO order = orderService.getOrderById(userId, orderId);

        if (!"AWAITING_PAYMENT".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Order is not awaiting payment. Current status: " + order.getStatus());
        }

        String qrUrl = sePayUtil.createPaymentUrl(orderId, order.getTotalPrice().doubleValue());
        String description = "DH" + orderId;

        PaymentQrResponse response = new PaymentQrResponse(
                qrUrl, orderId, order.getTotalPrice().toPlainString(), description);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "SePay webhook",
            description = """
                    **Public endpoint** — called by SePay when a bank transfer is received.
                    Secured via API Key in the `Authorization` header (not JWT).
                    
                    Flow: SePay detects payment → calls this webhook → order moves from `AWAITING_PAYMENT` to `CONFIRMED`.
                    
                    The order ID is extracted from the transfer content (e.g., "DH12" → order 12).""")
    @ApiResponse(responseCode = "200", description = "Payment processed or already handled")
    @ApiResponse(responseCode = "401", description = "Invalid API key")
    @ApiResponse(responseCode = "400", description = "Missing transaction code or amount")
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
