package com.example.shop.repositories;

import com.example.shop.models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId")
    Optional<Cart> findCartByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId AND c.cartId = :cartId")
    Optional<Cart> findCartByUserIdAndCartId(@Param("userId") Long userId, @Param("cartId") Long cartId);

    @Query("SELECT c FROM Cart c JOIN FETCH c.cartItems ci JOIN FETCH ci.product p WHERE p.productId = :productId")
    List<Cart> findCartsByProductId(@Param("productId") Long productId);

}