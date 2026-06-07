package com.example.shop.repositories;

import com.example.shop.models.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Page<Rating> findByProductProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    List<Rating> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserUserIdAndProductProductIdAndOrderOrderId(Long userId, Long productId, Long orderId);

    Optional<Rating> findByRatingIdAndUserUserId(Long ratingId, Long userId);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.product.productId = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product.productId = :productId")
    Long countByProductId(@Param("productId") Long productId);
}
