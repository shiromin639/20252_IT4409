package com.example.shop.payloads.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * Payload gửi từ SePay khi có giao dịch mới vào tài khoản.
 * Xem docs: https://my.sepay.vn/docs/webhook
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SePayWebhookRequest {
    private Long id;                // SePay transaction ID (dùng cho deduplication)
    private String gateway;         // Tên ngân hàng (MBBank, VCB, ...)
    private String transactionDate; // Thời gian giao dịch
    private String accountNumber;   // Số tài khoản nhận
    private String code;            // Mã thanh toán được SePay tự parse từ nội dung
    private String content;         // Nội dung chuyển khoản gốc
    private String transferType;    // "in" = tiền vào, "out" = tiền ra
    private String description;     // Mô tả giao dịch
    private Long transferAmount;    // Số tiền chuyển
    private Long accumulated;       // Số dư sau giao dịch
    private String referenceCode;   // Mã tham chiếu từ ngân hàng
}
