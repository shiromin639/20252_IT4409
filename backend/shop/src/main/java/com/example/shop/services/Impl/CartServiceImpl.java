package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.Cart;
import com.example.shop.models.CartItem;
import com.example.shop.models.Product;
import com.example.shop.models.User;
import com.example.shop.payloads.dto.CartDTO;
import com.example.shop.payloads.dto.CartItemDTO;
import com.example.shop.payloads.dto.ProductDTO;
import com.example.shop.repositories.CartItemRepository;
import com.example.shop.repositories.CartRepository;
import com.example.shop.repositories.ProductRepository;
import com.example.shop.repositories.UserRepository;
import com.example.shop.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public CartDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartDTO(cart);
    }

    @Override
    public CartDTO addProductToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Product stock is insufficient!");
        }

        Optional<CartItem> existingCartItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();

        if (existingCartItem.isPresent()) {
            CartItem item = existingCartItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getQuantity() < newQuantity) {
                throw new IllegalArgumentException("Product stock is insufficient!");
            }
            item.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);

            double finalPrice = product.getSpecialPrice() > 0 ? product.getSpecialPrice() : product.getPrice();
            newItem.setProductPrice(finalPrice);
            newItem.setDiscount(product.getDiscount());

            cart.getCartItems().add(newItem);
        }

        recalculateCartTotal(cart);
        Cart updatedCart = cartRepository.save(cart);
        return mapToCartDTO(updatedCart);
    }

    @Override
    public CartDTO updateProductQuantity(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in your cart"));

        if (quantity <= 0) {
            // Dùng orphanRemoval: chỉ cần remove khỏi collection, KHÔNG gọi repository.delete()
            cart.getCartItems().remove(cartItem);
        } else {
            if (cartItem.getProduct().getQuantity() < quantity) {
                throw new IllegalArgumentException("Product stock is insufficient!");
            }
            cartItem.setQuantity(quantity);
        }

        recalculateCartTotal(cart);
        Cart updatedCart = cartRepository.save(cart);
        return mapToCartDTO(updatedCart);
    }

    @Override
    public void deleteCartItemFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // Kiểm tra cartItem có thuộc cart của user này không (tránh user A xóa item của user B)
        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new IllegalArgumentException("This cart item does not belong to your cart");
        }

        // Dùng orphanRemoval: remove khỏi collection, Hibernate tự xóa ở DB
        cart.getCartItems().remove(cartItem);

        recalculateCartTotal(cart);
        cartRepository.save(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        // Chỉ cần .clear() — orphanRemoval sẽ tự xóa tất cả ở DB
        // KHÔNG gọi cartItemRepository.deleteAll() vì sẽ conflict với orphanRemoval
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findCartByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalPrice(0.0);
                    return cartRepository.save(newCart);
                });
    }

    private void recalculateCartTotal(Cart cart) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal price = BigDecimal.valueOf(item.getProductPrice());
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            total = total.add(price.multiply(qty));
        }
        cart.setTotalPrice(total.doubleValue());
    }

    private CartDTO mapToCartDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setCartId(cart.getCartId());
        dto.setUserId(cart.getUser().getUserId());
        dto.setTotalPrice(BigDecimal.valueOf(cart.getTotalPrice()));

        List<CartItemDTO> itemDTOs = new ArrayList<>();
        for (CartItem item : cart.getCartItems()) {
            CartItemDTO itemDto = new CartItemDTO();
            itemDto.setCartItemId(item.getCartItemId());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setProductPrice(BigDecimal.valueOf(item.getProductPrice()));

            BigDecimal subTotal = BigDecimal.valueOf(item.getProductPrice())
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setSubTotal(subTotal);

            Product p = item.getProduct();
            ProductDTO pDto = new ProductDTO();
            pDto.setProductId(p.getProductId());
            pDto.setProductName(p.getProductName());
            pDto.setImage(p.getImage());

            itemDto.setProduct(pDto);
            itemDTOs.add(itemDto);
        }

        dto.setItems(itemDTOs);
        return dto;
    }
}