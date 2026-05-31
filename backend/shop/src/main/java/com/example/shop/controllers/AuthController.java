package com.example.shop.controllers;

import com.example.shop.security.request.LoginRequest;
import com.example.shop.security.request.SignupRequest;
import com.example.shop.security.response.AuthenticationResult;
import com.example.shop.security.response.MessageResponse;
import com.example.shop.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/*
 * Controller quản lý các API liên quan đến xác thực và người dùng
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        AuthenticationResult result = authService.login(loginRequest);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,
                        result.getJwtCookie().toString())
                .body(result.getResponse());
    }


    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        return authService.register(signUpRequest);
    }


    @GetMapping("/username")
    public String currentUserName(Authentication authentication) {
        if (authentication != null)
            return authentication.getName();
        else
            return "";
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        return ResponseEntity.ok().body(authService.getCurrentUserDetails(authentication));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser() {
        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }
}