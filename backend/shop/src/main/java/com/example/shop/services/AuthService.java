package com.example.shop.services;

import com.example.shop.security.request.LoginRequest;
import com.example.shop.security.request.SignupRequest;
import com.example.shop.security.response.AuthenticationResult;
import com.example.shop.security.response.MessageResponse;
import com.example.shop.security.response.UserInfoResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    AuthenticationResult login(LoginRequest loginRequest);

    ResponseEntity<MessageResponse> register(SignupRequest signUpRequest);

    UserInfoResponse getCurrentUserDetails(Authentication authentication);

    ResponseCookie logoutUser();
}
