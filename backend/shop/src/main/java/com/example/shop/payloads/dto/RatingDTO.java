package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {
    private Long ratingId;
    private Long userId;
    private String username;
    private Long productId;
    private String productName;
    private Long orderId;
    private Integer stars;
    private String comment;
    private LocalDateTime createdAt;
}
