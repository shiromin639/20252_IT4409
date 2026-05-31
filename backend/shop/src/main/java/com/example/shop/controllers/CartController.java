package com.example.shop.controllers;



import com.example.shop.models.Cart;
import com.example.shop.payloads.dto.CartDTO;
import com.example.shop.payloads.dto.CartItemDTO;
import com.example.shop.payloads.request.CartItemRequest;
import com.example.shop.repositories.CartRepository;
import com.example.shop.services.CartService;
import com.example.shop.utils.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart() {
        Long userId = authUtil.loggedInUserId();
        CartDTO cartDTO = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cartDTO);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addProductToCart(@RequestBody CartItemRequest cartItemRequest) {
        Long userId = authUtil.loggedInUserId();
        CartDTO cartDTO = cartService.addProductToCart(userId, cartItemRequest.getProductId(), cartItemRequest.getQuantity());
        return new ResponseEntity<>(cartDTO, HttpStatus.CREATED);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDTO> updateCartProductQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        Long userId = authUtil.loggedInUserId();
        CartDTO cartDTO = cartService.updateProductQuantity(userId, productId, quantity);
        return ResponseEntity.ok(cartDTO);
    }
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> deleteCartItemFromCart(@PathVariable Long cartItemId) {
        Long userId = authUtil.loggedInUserId();
        cartService.deleteCartItemFromCart(userId, cartItemId);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content là chuẩn REST khi xóa thành công
    }
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        Long userId = authUtil.loggedInUserId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
