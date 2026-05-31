package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.*;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.dto.OrderItemDTO;
import com.example.shop.payloads.request.OrderRequest;
import com.example.shop.repositories.CartRepository;
import com.example.shop.repositories.OrderRepository;
import com.example.shop.repositories.ProductRepository;
import com.example.shop.services.OrderService;
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

    // ==========================================
    // USER ENDPOINTS
    // ==========================================

    @Override
    public OrderDTO placeOrder(Long userId, OrderRequest orderRequest) {
        // 1. Lấy cart của user
        Cart cart = cartRepository.findCartByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cannot place order with an empty cart");
        }

        // 2. Tạo Order
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPhoneNumber(orderRequest.getPhoneNumber() != null
                ? orderRequest.getPhoneNumber()
                : cart.getUser().getPhoneNumber());
        order.setPaymentMethod(orderRequest.getPaymentMethod() != null
                ? orderRequest.getPaymentMethod()
                : "COD");
        order.setNotes(orderRequest.getNotes());
        order.setStatus(OrderStatus.PENDING);

        // 3. Chuyển CartItem → OrderItem (snapshot giá tại thời điểm đặt)
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            // Kiểm tra stock
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

            order.addItem(orderItem);  // Helper method — set cả 2 phía

            // Tính subtotal
            BigDecimal itemTotal = BigDecimal.valueOf(cartItem.getProductPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);

            // 4. Trừ stock sản phẩm
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setTotalPrice(totalPrice.doubleValue());

        // 5. Lưu order
        Order savedOrder = orderRepository.save(order);

        // 6. Clear cart (dùng orphanRemoval)
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);

        return mapToOrderDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findOrdersByUserId(userId);
        return orders.stream().map(this::mapToOrderDTO).toList();
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

        // Hoàn lại stock cho từng sản phẩm
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        Order savedOrder = orderRepository.save(order);
        return mapToOrderDTO(savedOrder);
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAllOrdersSorted();
        return orders.stream().map(this::mapToOrderDTO).toList();
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

        // Nếu chuyển sang CANCELLED → hoàn stock
        if (newStatus == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return mapToOrderDTO(savedOrder);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

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

            BigDecimal subTotal = BigDecimal.valueOf(item.getProductPrice())
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            itemDto.setSubTotal(subTotal);

            itemDTOs.add(itemDto);
        }

        dto.setItems(itemDTOs);
        return dto;
    }
}
