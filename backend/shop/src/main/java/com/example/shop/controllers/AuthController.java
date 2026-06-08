package com.example.shop.controllers;

import com.example.shop.security.request.LoginRequest;
import com.example.shop.security.request.SignupRequest;
import com.example.shop.security.response.AuthenticationResult;
import com.example.shop.security.response.MessageResponse;
import com.example.shop.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "1. Authentication", description = "Login, signup, logout, and current user info")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Login", description = "Authenticate with username/password. Returns user info and sets JWT cookie.")
    @ApiResponse(responseCode = "200", description = "Login successful, JWT cookie set")
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        AuthenticationResult result = authService.login(loginRequest);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,
                result.getJwtCookie().toString())
                .body(result.getResponse());
    }

    @Operation(summary = "Signup", description = "Register a new user account. Role is always assigned as `ROLE_USER`.")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Username already taken")
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        return authService.register(signUpRequest);
    }

    @Operation(summary = "Get current username", description = "Returns the username of the currently authenticated user.")
    @GetMapping("/username")
    public String currentUserName(Authentication authentication) {
        if (authentication != null)
            return authentication.getName();
        else
            return "";
    }

    @Operation(summary = "Get current user details", description = "Returns full details (id, username, roles, phone) of the authenticated user.")
    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(Authentication authentication) {
        return ResponseEntity.ok().body(authService.getCurrentUserDetails(authentication));
    }

    @Operation(summary = "Logout", description = "Clears the JWT cookie, effectively logging the user out.")
    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser() {
        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }
}
