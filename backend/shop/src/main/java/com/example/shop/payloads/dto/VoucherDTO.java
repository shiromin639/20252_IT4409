package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDTO {
    private Long voucherId;
    private String code;
    private String discountType; // PERCENTAGE or FIXED
    private Double discountValue;
    private Double minOrderValue;
    private Double maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime expiryDate;
    private Boolean isActive;
    private String description;
}
