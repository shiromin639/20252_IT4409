package com.example.shop.payloads.request;

import lombok.Data;

@Data
public class CheckoutRequest {
    // Option 1: Choose from saved addresses
    private Long addressId;

    // Option 2: Type address directly (used if addressId is null)
    private String shippingAddress;

    private String phoneNumber;

    private String paymentMethod; // COD, SEPAY

    private String voucherCode; // Voucher code to apply

    private String notes;
}
