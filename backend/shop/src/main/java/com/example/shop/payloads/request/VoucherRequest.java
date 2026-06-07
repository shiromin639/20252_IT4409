package com.example.shop.payloads.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VoucherRequest {
    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotBlank(message = "Discount type is required (PERCENTAGE or FIXED)")
    private String discountType;

    @NotNull(message = "Discount value is required")
    private Double discountValue;

    @NotNull(message = "Minimum order value is required")
    private Double minOrderValue;

    private Double maxDiscountAmount; // Optional cap for percentage

    private Integer usageLimit; // Optional usage limit

    @NotNull(message = "Expiry date is required")
    private LocalDateTime expiryDate;

    private Boolean isActive = true;

    private String description;
}
