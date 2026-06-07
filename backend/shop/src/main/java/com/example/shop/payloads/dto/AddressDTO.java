package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long addressId;
    private String label;
    private String recipientName;
    private String phoneNumber;
    private String street;
    private String ward;
    private String district;
    private String city;
    private Boolean isDefault;
    private String fullAddress; // Computed: street, ward, district, city
}
