package com.example.shop.payloads.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String phoneNumber;

    private String paymentMethod; // COD, SEPAY

    private String couponCode;

    private String notes;
}
