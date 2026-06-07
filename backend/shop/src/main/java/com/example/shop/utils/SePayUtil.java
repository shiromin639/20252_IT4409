package com.example.shop.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class SePayUtil {

    @Value("${sepay.merchant.bank}")
    private String bank;

    @Value("${sepay.merchant.account}")
    private String account;

    @Value("${sepay.webhook.apikey}")
    private String apiKey;

    /**
     * Tạo URL ảnh VietQR thanh toán qua SePay.
     * Người dùng có thể hiển thị trực tiếp ảnh này cho khách quét.
     */
    public String createPaymentUrl(Long orderId, Double amount) {
        String description = "DH" + orderId;
        try {
            return String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s",
                    account,
                    bank,
                    amount.longValue(),
                    URLEncoder.encode(description, StandardCharsets.UTF_8.toString())
            );
        } catch (Exception e) {
            return String.format("https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%d&des=%s",
                    account, bank, amount.longValue(), description);
        }
    }

    /**
     * Xác thực API Key được gửi từ SePay Webhook qua Header Authorization.
     */
    public boolean verifyApiKey(String authHeader) {
        if (authHeader == null) {
            return false;
        }
        String token = authHeader.replace("Bearer ", "").trim();
        return apiKey.equals(token);
    }
}
