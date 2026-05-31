package com.example.shop.utils;

import com.example.shop.models.User;
import com.example.shop.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    @Autowired
    private UserRepository userRepository; // Nên để private bạn nhé

    // Hàm dùng chung cho nội bộ class để tránh lặp code
    public User loggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UsernameNotFoundException("No authenticated user found in security context");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + authentication.getName()));
    }

    // Tối ưu: Tận dụng hàm loggedInUser(), tránh lặp logic truy vấn
    public String loggedInEmail() {
        return loggedInUser().getEmail();
    }

    // Tối ưu: Tận dụng hàm loggedInUser()
    public Long loggedInUserId() {
        return loggedInUser().getUserId();
    }
}