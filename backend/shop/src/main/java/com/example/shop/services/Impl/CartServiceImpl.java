package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException; // Giả định bạn có class này
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
@Transactional // Đảm bảo tính nhất quán dữ liệu khi ghi/xóa DB
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
    public CartDTO getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartDTO(cart);
    }

    @Override
    public CartDTO addProductToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // Kiểm tra hàng tồn kho
        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Product stock is insufficient!");
        }

        // Tìm xem sản phẩm này đã có trong giỏ hàng chưa
        Optional<CartItem> existingCartItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();

        if (existingCartItem.isPresent()) {
            // Nếu đã có, tăng số lượng lên
            CartItem item = existingCartItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getQuantity() < newQuantity) {
                throw new IllegalArgumentException("Product stock is insufficient!");
            }
            item.setQuantity(newQuantity);
        } else {
            // Nếu chưa có, tạo mới một CartItem
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            // Lấy giá ưu đãi nếu có, nếu không lấy giá gốc
            double finalPrice = product.getSpecialPrice() > 0 ? product.getSpecialPrice() : product.getPrice();
            newItem.setProductPrice(finalPrice);
            newItem.setDiscount(product.getDiscount());

            cart.getCartItems().add(newItem);
        }

        // Tính toán lại tổng tiền tổng thể
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

        // Nếu số lượng set về 0 hoặc nhỏ hơn, tiến hành xóa món hàng đó luôn
        if (quantity <= 0) {
            cart.getCartItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            // Kiểm tra kho trước khi cập nhật số lượng mới
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
    public void deleteProductFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in your cart"));

        cart.getCartItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        recalculateCartTotal(cart);
        cartRepository.save(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);

        // Xóa tất cả các bản ghi item trong DB liên quan đến cart này
        cartItemRepository.deleteAll(cart.getCartItems());

        // Làm rỗng list trong memory và reset tiền về 0
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);

        cartRepository.save(cart);
    }

    // ==========================================
    // CÁC HÀM TRỢ GIÚP (HELPER METHODS)
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

            // Tính subTotal của từng item
            BigDecimal subTotal = BigDecimal.valueOf(item.getProductPrice())
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setSubTotal(subTotal);

            // Map thông tin Product sang ProductDTO rút gọn cho Client hiển thị
            Product p = item.getProduct();
            ProductDTO pDto = new ProductDTO();
            pDto.setProductId(p.getProductId());
            pDto.setProductName(p.getProductName());
            pDto.setImage(p.getImage());
            // Bạn có thể map thêm giá gốc/mô tả nếu cần thiết

            itemDto.setProduct(pDto);
            itemDTOs.add(itemDto);
        }

        dto.setItems(itemDTOs);
        return dto;
    }
}