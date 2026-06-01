package com.example.shop.payloads.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response chứa thông tin QR thanh toán SePay.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentQrResponse {
    private String qrUrl;
    private Long orderId;
    private String amount;
    private String description;
}
