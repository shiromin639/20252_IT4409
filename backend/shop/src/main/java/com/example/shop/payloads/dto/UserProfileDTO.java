package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String role;
}
