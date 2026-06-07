package com.example.shop.controllers;

import com.example.shop.payloads.dto.UserProfileDTO;
import com.example.shop.payloads.request.ChangePasswordRequest;
import com.example.shop.payloads.request.UpdateProfileRequest;
import com.example.shop.security.response.MessageResponse;
import com.example.shop.services.UserProfileService;
import com.example.shop.utils.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
@Tag(name = "10. User Profile", description = "User profile management — view, update info, change password")
public class UserProfileController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private UserProfileService userProfileService;

    @Operation(summary = "Get my profile", description = "Returns the current user's profile information.")
    @GetMapping
    public ResponseEntity<UserProfileDTO> getMyProfile() {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(userProfileService.getProfile(userId));
    }

    @Operation(summary = "Update my profile", description = "Update profile fields (fullName, email, phoneNumber, address). Only provided fields are updated.")
    @PutMapping
    public ResponseEntity<UserProfileDTO> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(userProfileService.updateProfile(userId, request));
    }

    @Operation(summary = "Change password", description = "Change the current user's password. Requires current password verification.")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "400", description = "Current password incorrect or new password validation failed")
    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = authUtil.loggedInUserId();
        userProfileService.changePassword(userId, request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }
}
