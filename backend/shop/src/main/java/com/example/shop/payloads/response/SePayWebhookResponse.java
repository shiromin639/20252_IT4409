package com.example.shop.payloads.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về cho SePay sau khi xử lý webhook.
 * SePay yêu cầu trả HTTP 200 + {"success": true} để xác nhận đã nhận.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SePayWebhookResponse {
    private boolean success;
    private String message;
}
