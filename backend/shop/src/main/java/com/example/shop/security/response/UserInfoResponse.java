package com.example.shop.security.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse {
    private Long userId;
    private String jwtToken;
    private String username;
    private List<String> roles;

    private String phoneNumber;

    public UserInfoResponse(Long id, String username, String name, List<String> roles) {
        this.userId = id;
        this.username = username;
        this.roles = roles;
    }

    public UserInfoResponse(Long id, String username, List<String> roles, String phoneNumber) {
        this.userId = id;
        this.username = username;
        this.roles = roles;
        this.phoneNumber = phoneNumber;
    }
}