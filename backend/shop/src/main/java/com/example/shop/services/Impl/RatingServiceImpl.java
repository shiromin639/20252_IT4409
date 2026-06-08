package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.*;
import com.example.shop.payloads.dto.ProductRatingSummaryDTO;
import com.example.shop.payloads.dto.RatingDTO;
import com.example.shop.payloads.request.RatingRequest;
import com.example.shop.repositories.OrderRepository;
import com.example.shop.repositories.ProductRepository;
import com.example.shop.repositories.RatingRepository;
import com.example.shop.repositories.UserRepository;
import com.example.shop.services.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RatingServiceImpl implements RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public RatingDTO submitRating(Long userId, RatingRequest request) {
        // 1. Verify order exists and belongs to user
        Order order = orderRepository.findOrderByUserIdAndOrderId(userId, request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", request.getOrderId()));

        // 2. Only allow rating if order is DELIVERED
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalArgumentException(
                    "You can only rate products from delivered orders. Current status: " + order.getStatus());
        }

        // 3. Verify product exists in this order
        boolean productInOrder = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getProductId().equals(request.getProductId()));
        if (!productInOrder) {
            throw new IllegalArgumentException("Product is not part of this order");
        }

        // 4. Check for duplicate rating
        if (ratingRepository.existsByUserUserIdAndProductProductIdAndOrderOrderId(
                userId, request.getProductId(), request.getOrderId())) {
            throw new IllegalArgumentException("You have already rated this product for this order");
        }

        // 5. Create rating
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", request.getProductId()));

        Rating rating = new Rating();
        rating.setUser(user);
        rating.setProduct(product);
        rating.setOrder(order);
        rating.setStars(request.getStars());
        rating.setComment(request.getComment());

        return mapToDTO(ratingRepository.save(rating));
    }

    @Override
    public RatingDTO updateRating(Long userId, Long ratingId, RatingRequest request) {
        Rating rating = ratingRepository.findByRatingIdAndUserUserId(ratingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating", "ratingId", ratingId));

        rating.setStars(request.getStars());
        rating.setComment(request.getComment());

        return mapToDTO(ratingRepository.save(rating));
    }

    @Override
    public void deleteRating(Long userId, Long ratingId) {
        Rating rating = ratingRepository.findByRatingIdAndUserUserId(ratingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating", "ratingId", ratingId));
        ratingRepository.delete(rating);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RatingDTO> getProductRatings(Long productId, int page, int size) {
        return ratingRepository.findByProductProductIdOrderByCreatedAtDesc(productId, PageRequest.of(page, size))
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductRatingSummaryDTO getProductRatingSummary(Long productId) {
        Double avg = ratingRepository.findAverageRatingByProductId(productId);
        Long count = ratingRepository.countByProductId(productId);
        return new ProductRatingSummaryDTO(
                avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                count != null ? count : 0L
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingDTO> getUserRatings(Long userId) {
        return ratingRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDTO).toList();
    }

    // ==========================================
    // MAPPER
    // ==========================================

    private RatingDTO mapToDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setRatingId(rating.getRatingId());
        dto.setUserId(rating.getUser().getUserId());
        dto.setUsername(rating.getUser().getUsername());
        dto.setProductId(rating.getProduct().getProductId());
        dto.setProductName(rating.getProduct().getProductName());
        dto.setOrderId(rating.getOrder().getOrderId());
        dto.setStars(rating.getStars());
        dto.setComment(rating.getComment());
        dto.setCreatedAt(rating.getCreatedAt());
        return dto;
    }
}
