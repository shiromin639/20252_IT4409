package com.example.shop.services;

import com.example.shop.payloads.dto.UserProfileDTO;
import com.example.shop.payloads.request.ChangePasswordRequest;
import com.example.shop.payloads.request.UpdateProfileRequest;

public interface UserProfileService {

    UserProfileDTO getProfile(Long userId);

    UserProfileDTO updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);
}
