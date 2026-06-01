package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Dữ liệu hiển thị trên màn hình checkout.
 * Không lưu DB, chỉ dùng để preview cho user trước khi xác nhận đặt hàng.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutPreviewDTO {
    private List<OrderItemDTO> items = new ArrayList<>();
    private BigDecimal subTotal;
    private BigDecimal couponDiscount;
    private BigDecimal totalPrice;
    private String couponCode;
    private boolean couponValid;
    private String couponMessage;
}
