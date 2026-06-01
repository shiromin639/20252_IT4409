package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.*;
import com.example.shop.payloads.dto.CheckoutPreviewDTO;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.dto.OrderItemDTO;
import com.example.shop.payloads.request.CheckoutRequest;
import com.example.shop.repositories.CartRepository;
import com.example.shop.repositories.OrderRepository;
import com.example.shop.repositories.ProductRepository;
import com.example.shop.services.OrderService;
import com.example.shop.utils.SePayUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SePayUtil sePayUtil;

    // ==========================================
    // CHECKOUT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public CheckoutPreviewDTO previewCheckout(Long userId, String couponCode) {
        Cart cart = cartRepository.findCartByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setProductId(product.getProductId());
            itemDto.setProductName(product.getProductName());
            itemDto.setProductImage(product.getImage());
            itemDto.setProductPrice(BigDecimal.valueOf(cartItem.getProductPrice()));
            itemDto.setQuantity(cartItem.getQuantity());
            itemDto.setDiscount(BigDecimal.valueOf(cartItem.getDiscount()));

            BigDecimal itemTotal = BigDecimal.valueOf(cartItem.getProductPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            itemDto.setSubTotal(itemTotal);
            subTotal = subTotal.add(itemTotal);

            itemDTOs.add(itemDto);
        }

        // Tính coupon
        CouponResult coupon = applyCoupon(couponCode, subTotal);
        BigDecimal totalPrice = subTotal.subtract(coupon.discount).max(BigDecimal.ZERO);

        CheckoutPreviewDTO preview = new CheckoutPreviewDTO();
        preview.setItems(itemDTOs);
        preview.setSubTotal(subTotal);
        preview.setCouponDiscount(coupon.discount);
        preview.setTotalPrice(totalPrice);
        preview.setCouponCode(couponCode != null ? couponCode.toUpperCase().trim() : null);
        preview.setCouponValid(coupon.valid);
        preview.setCouponMessage(coupon.message);

        return preview;
    }

    @Override
    public OrderDTO confirmCheckout(Long userId, CheckoutRequest request) {
        // 1. Lấy cart
        Cart cart = cartRepository.findCartByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout with an empty cart");
        }

        // 2. Tính subtotal
        BigDecimal subTotal = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            BigDecimal itemTotal = BigDecimal.valueOf(cartItem.getProductPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subTotal = subTotal.add(itemTotal);
        }

        // 3. Validate coupon TRƯỚC khi trừ stock (fail-fast)
        BigDecimal couponDiscount = BigDecimal.ZERO;
        String validatedCouponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            CouponResult coupon = applyCoupon(request.getCouponCode(), subTotal);
            if (!coupon.valid) {
                throw new IllegalArgumentException(coupon.message);
            }
            couponDiscount = coupon.discount;
            validatedCouponCode = request.getCouponCode().toUpperCase().trim();
        }

        BigDecimal totalPrice = subTotal.subtract(couponDiscount).max(BigDecimal.ZERO);

        // 4. Tạo Order
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber() != null
                ? request.getPhoneNumber()
                : cart.getUser().getPhoneNumber());
        order.setPaymentMethod(request.getPaymentMethod() != null
                ? request.getPaymentMethod()
                : "COD");
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.PENDING);
        order.setCouponCode(validatedCouponCode);
        order.setCouponDiscount(couponDiscount.doubleValue());
        order.setTotalPrice(totalPrice.doubleValue());

        // 5. Chuyển CartItem → OrderItem, kiểm tra + trừ stock
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getProductName()
                                + " (available: " + product.getQuantity()
                                + ", requested: " + cartItem.getQuantity() + ")");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getProductName());
            orderItem.setProductImage(product.getImage());
            orderItem.setProductPrice(cartItem.getProductPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            order.addItem(orderItem);

            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // 6. Lưu order
        Order savedOrder = orderRepository.save(order);

        // 7. Xoá giỏ hàng
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);

        // 8. Build response
        OrderDTO orderDTO = mapToOrderDTO(savedOrder);

        if ("SEPAY".equalsIgnoreCase(savedOrder.getPaymentMethod())) {
            String qrUrl = sePayUtil.createPaymentUrl(savedOrder.getOrderId(), savedOrder.getTotalPrice());
            orderDTO.setPaymentUrl(qrUrl);
        }

        return orderDTO;
    }

    // ==========================================
    // USER: QUẢN LÝ ĐƠN HÀNG
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findOrdersByUserId(userId)
                .stream().map(this::mapToOrderDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findOrderByUserIdAndOrderId(userId, orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderDTO(order);
    }

    @Override
    public OrderDTO cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findOrderByUserIdAndOrderId(userId, orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot cancel order with status: " + order.getStatus()
                            + ". Only PENDING orders can be cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        restoreStock(order);

        return mapToOrderDTO(orderRepository.save(order));
    }

    // ==========================================
    // ADMIN
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllOrdersSorted()
                .stream().map(this::mapToOrderDTO).toList();
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid order status: " + status
                            + ". Valid values: PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED");
        }

        if (newStatus == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        order.setStatus(newStatus);
        return mapToOrderDTO(orderRepository.save(order));
    }

    // ==========================================
    // PAYMENT CALLBACKS
    // ==========================================

    @Override
    public OrderDTO processSePayPayment(Long orderId, Double amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Order already processed");
        }

        if (Math.abs(order.getTotalPrice() - amount) > 0.01) {
            throw new IllegalArgumentException(
                    "Payment amount mismatch. Expected: " + order.getTotalPrice() + ", received: " + amount);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        return mapToOrderDTO(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderByIdRaw(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToOrderDTO(order);
    }

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }

    private OrderDTO mapToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setUserId(order.getUser().getUserId());
        dto.setUsername(order.getUser().getUsername());
        dto.setTotalPrice(BigDecimal.valueOf(order.getTotalPrice()));
        dto.setStatus(order.getStatus().name());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPhoneNumber(order.getPhoneNumber());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setNotes(order.getNotes());
        dto.setCouponCode(order.getCouponCode());
        dto.setCouponDiscount(order.getCouponDiscount() != null
                ? BigDecimal.valueOf(order.getCouponDiscount())
                : BigDecimal.ZERO);
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setOrderItemId(item.getOrderItemId());
            itemDto.setProductId(item.getProduct().getProductId());
            itemDto.setProductName(item.getProductName());
            itemDto.setProductImage(item.getProductImage());
            itemDto.setProductPrice(BigDecimal.valueOf(item.getProductPrice()));
            itemDto.setQuantity(item.getQuantity());
            itemDto.setDiscount(item.getDiscount() != null
                    ? BigDecimal.valueOf(item.getDiscount())
                    : BigDecimal.ZERO);
            itemDto.setSubTotal(BigDecimal.valueOf(item.getProductPrice())
                    .multiply(BigDecimal.valueOf(item.getQuantity())));
            itemDTOs.add(itemDto);
        }
        dto.setItems(itemDTOs);

        return dto;
    }

    /**
     * Tính coupon discount.
     * Demo hardcode — production nên query từ Coupon table trong DB.
     */
    private CouponResult applyCoupon(String couponCode, BigDecimal subTotal) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return new CouponResult(false, BigDecimal.ZERO, "No coupon applied");
        }

        return switch (couponCode.toUpperCase().trim()) {
            case "DISCOUNT10" -> new CouponResult(true,
                    subTotal.multiply(BigDecimal.valueOf(0.1)),
                    "Applied 10% discount");
            case "FREE50" -> new CouponResult(true,
                    BigDecimal.valueOf(50000).min(subTotal),
                    "Applied 50,000 VND discount");
            case "WELCOME" -> new CouponResult(true,
                    BigDecimal.valueOf(20000).min(subTotal),
                    "Applied 20,000 VND discount");
            default -> new CouponResult(false, BigDecimal.ZERO, "Invalid or expired coupon code");
        };
    }

    /** Kết quả áp dụng coupon */
    private record CouponResult(boolean valid, BigDecimal discount, String message) {}
}
