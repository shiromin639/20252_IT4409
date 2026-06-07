package com.example.shop.services;

import com.example.shop.payloads.dto.ProductRatingSummaryDTO;
import com.example.shop.payloads.dto.RatingDTO;
import com.example.shop.payloads.request.RatingRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface RatingService {

    /** User submits a rating — only allowed if order is DELIVERED */
    RatingDTO submitRating(Long userId, RatingRequest request);

    /** User updates their own rating */
    RatingDTO updateRating(Long userId, Long ratingId, RatingRequest request);

    /** User deletes their own rating */
    void deleteRating(Long userId, Long ratingId);

    /** Get all ratings for a product (public) */
    Page<RatingDTO> getProductRatings(Long productId, int page, int size);

    /** Get rating summary for a product (public) */
    ProductRatingSummaryDTO getProductRatingSummary(Long productId);

    /** Get all ratings by user */
    List<RatingDTO> getUserRatings(Long userId);
}
