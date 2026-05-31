package com.example.shop.payloads.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String phoneNumber;

    private String paymentMethod; // COD, BANK_TRANSFER, etc. — mặc định COD

    private String notes;
}
