package com.example.shop.security.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @Getter
    @Setter
    private String role = "ROLE_USER";

    @NotBlank
    @Size(min = 10, max = 10)
    private String phoneNumber;

    private String address;
}