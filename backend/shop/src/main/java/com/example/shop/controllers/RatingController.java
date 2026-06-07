package com.example.shop.controllers;

import com.example.shop.payloads.dto.ProductRatingSummaryDTO;
import com.example.shop.payloads.dto.RatingDTO;
import com.example.shop.payloads.request.RatingRequest;
import com.example.shop.services.RatingService;
import com.example.shop.utils.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "9. Ratings", description = "Product ratings and reviews — browse (public) and submit (user)")
public class RatingController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private RatingService ratingService;

    // ==========================================
    // PUBLIC
    // ==========================================

    @Operation(summary = "Get product ratings", description = "Public — Get paginated ratings/reviews for a specific product.")
    @GetMapping("/products/{productId}/ratings")
    public ResponseEntity<Page<RatingDTO>> getProductRatings(
            @PathVariable Long productId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ratingService.getProductRatings(productId, page, size));
    }

    @Operation(summary = "Get rating summary", description = "Public — Get the average rating and total count for a product.")
    @GetMapping("/products/{productId}/ratings/summary")
    public ResponseEntity<ProductRatingSummaryDTO> getProductRatingSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(ratingService.getProductRatingSummary(productId));
    }

    // ==========================================
    // USER
    // ==========================================

    @Operation(summary = "Submit rating", description = "Submit a rating for a product. User must have a `DELIVERED` order containing the product.")
    @ApiResponse(responseCode = "201", description = "Rating submitted")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/ratings")
    public ResponseEntity<RatingDTO> submitRating(@Valid @RequestBody RatingRequest request) {
        Long userId = authUtil.loggedInUserId();
        RatingDTO rating = ratingService.submitRating(userId, request);
        return new ResponseEntity<>(rating, HttpStatus.CREATED);
    }

    @Operation(summary = "Update my rating", description = "Update an existing rating. Only the original author can update.")
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/ratings/{ratingId}")
    public ResponseEntity<RatingDTO> updateRating(@PathVariable Long ratingId,
                                                   @Valid @RequestBody RatingRequest request) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(ratingService.updateRating(userId, ratingId, request));
    }

    @Operation(summary = "Delete my rating", description = "Delete an existing rating. Only the original author can delete.")
    @ApiResponse(responseCode = "204", description = "Rating deleted")
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<Void> deleteRating(@PathVariable Long ratingId) {
        Long userId = authUtil.loggedInUserId();
        ratingService.deleteRating(userId, ratingId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get my ratings", description = "Get all ratings submitted by the current user.")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/ratings/mine")
    public ResponseEntity<List<RatingDTO>> getMyRatings() {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(ratingService.getUserRatings(userId));
    }
}
