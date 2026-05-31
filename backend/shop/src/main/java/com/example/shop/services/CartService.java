package com.example.shop.services;





import com.example.shop.payloads.dto.CartDTO;


public interface CartService {
    CartDTO getCartByUserId(Long userId);
    CartDTO addProductToCart(Long userId, Long productId, Integer quantity);
    CartDTO updateProductQuantity(Long userId, Long productId, Integer quantity);

    void deleteProductFromCart(Long userId, Long productId);
    void clearCart(Long userId);
}