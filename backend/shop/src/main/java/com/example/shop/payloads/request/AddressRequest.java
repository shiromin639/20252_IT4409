package com.example.shop.payloads.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Label is required (e.g., Home, Office)")
    private String label;

    @NotBlank(message = "Recipient name is required")
    private String recipientName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    private String street;

    private String ward;

    private String district;

    @NotBlank(message = "City is required")
    private String city;

    private Boolean isDefault = false;
}
