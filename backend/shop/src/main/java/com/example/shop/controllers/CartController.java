package com.example.shop.controllers;

import com.example.shop.payloads.dto.CartDTO;
import com.example.shop.payloads.request.CartItemRequest;
import com.example.shop.services.CartService;
import com.example.shop.utils.AuthUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()")
@Tag(name = "4. Cart", description = "Shopping cart management — add, update, remove items")
public class CartController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private CartService cartService;

    @Operation(summary = "Get my cart", description = "Returns the current user's shopping cart with all items.")
    @GetMapping
    public ResponseEntity<CartDTO> getCart() {
        Long userId = authUtil.loggedInUserId();
        CartDTO cartDTO = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cartDTO);
    }

    @Operation(summary = "Add item to cart", description = "Add a product to the cart with specified quantity. If the product already exists, quantity is incremented.")
    @ApiResponse(responseCode = "201", description = "Item added to cart")
    @PostMapping("/items")
    public ResponseEntity<CartDTO> addProductToCart(@RequestBody CartItemRequest cartItemRequest) {
        Long userId = authUtil.loggedInUserId();
        CartDTO cartDTO = cartService.addProductToCart(userId, cartItemRequest.getProductId(),
                cartItemRequest.getQuantity());
        return new ResponseEntity<>(cartDTO, HttpStatus.CREATED);
    }

    @Operation(summary = "Update item quantity", description = "Update the quantity of a product in the cart.")
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDTO> updateCartProductQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        Long userId = authUtil.loggedInUserId();
        CartDTO cartDTO = cartService.updateProductQuantity(userId, productId, quantity);
        return ResponseEntity.ok(cartDTO);
    }

    @Operation(summary = "Remove item from cart", description = "Remove a specific item from the cart by cart item ID.")
    @ApiResponse(responseCode = "204", description = "Item removed")
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> deleteCartItemFromCart(@PathVariable Long cartItemId) {
        Long userId = authUtil.loggedInUserId();
        cartService.deleteCartItemFromCart(userId, cartItemId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Clear cart", description = "Remove all items from the cart.")
    @ApiResponse(responseCode = "204", description = "Cart cleared")
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        Long userId = authUtil.loggedInUserId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
