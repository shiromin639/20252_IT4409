package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.*;
import com.example.shop.payloads.dto.AddressDTO;
import com.example.shop.payloads.dto.CheckoutPreviewDTO;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.dto.OrderItemDTO;
import com.example.shop.payloads.request.CheckoutRequest;
import com.example.shop.repositories.*;
import com.example.shop.services.AddressService;
import com.example.shop.services.OrderService;
import com.example.shop.services.VoucherService;
import com.example.shop.utils.SePayUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    private VoucherRepository voucherRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private SePayUtil sePayUtil;

    /**
     * Valid state transitions for the order lifecycle.
     * Key = current status, Value = allowed next statuses.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.AWAITING_PAYMENT, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, Set.of(OrderStatus.SHIPPING, OrderStatus.CANCELLED),
            OrderStatus.SHIPPING, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(),
            OrderStatus.CANCELLED, Set.of()
    );

    // ==========================================
    // CHECKOUT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public CheckoutPreviewDTO previewCheckout(Long userId, String voucherCode) {
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

        // Validate voucher via VoucherService (replaces hardcoded applyCoupon)
        VoucherService.VoucherValidationResult voucherResult = voucherService.validateVoucher(voucherCode, subTotal);
        BigDecimal totalPrice = subTotal.subtract(voucherResult.discount()).max(BigDecimal.ZERO);

        CheckoutPreviewDTO preview = new CheckoutPreviewDTO();
        preview.setItems(itemDTOs);
        preview.setSubTotal(subTotal);
        preview.setVoucherDiscount(voucherResult.discount());
        preview.setTotalPrice(totalPrice);
        preview.setVoucherCode(voucherCode != null ? voucherCode.toUpperCase().trim() : null);
        preview.setVoucherValid(voucherResult.valid());
        preview.setVoucherMessage(voucherResult.message());

        // Include user's saved addresses
        List<AddressDTO> savedAddresses = addressService.getUserAddresses(userId);
        preview.setSavedAddresses(savedAddresses);

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

        // 2. Resolve shipping address (from saved address OR direct input)
        String shippingAddress;
        String phoneNumber;
        if (request.getAddressId() != null) {
            Address address = addressRepository.findByAddressIdAndUserUserId(request.getAddressId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", request.getAddressId()));
            shippingAddress = address.toFullAddress();
            phoneNumber = address.getPhoneNumber();
        } else if (request.getShippingAddress() != null && !request.getShippingAddress().trim().isEmpty()) {
            shippingAddress = request.getShippingAddress();
            phoneNumber = request.getPhoneNumber() != null
                    ? request.getPhoneNumber()
                    : cart.getUser().getPhoneNumber();
        } else {
            throw new IllegalArgumentException("Either addressId or shippingAddress must be provided");
        }

        // 3. Tính subtotal
        BigDecimal subTotal = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            BigDecimal itemTotal = BigDecimal.valueOf(cartItem.getProductPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subTotal = subTotal.add(itemTotal);
        }

        // 4. Validate voucher (fail-fast)
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        Voucher appliedVoucher = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            VoucherService.VoucherValidationResult voucherResult =
                    voucherService.validateVoucher(request.getVoucherCode(), subTotal);
            if (!voucherResult.valid()) {
                throw new IllegalArgumentException(voucherResult.message());
            }
            voucherDiscount = voucherResult.discount();
            appliedVoucher = voucherRepository.findById(voucherResult.voucherId())
                    .orElse(null);
        }

        BigDecimal totalPrice = subTotal.subtract(voucherDiscount).max(BigDecimal.ZERO);

        // 5. Determine payment method and initial status
        String paymentMethod = request.getPaymentMethod() != null
                ? request.getPaymentMethod().toUpperCase().trim()
                : "COD";

        OrderStatus initialStatus;
        if ("SEPAY".equals(paymentMethod)) {
            // SePay: đơn hàng chờ thanh toán, chưa xác nhận
            initialStatus = OrderStatus.AWAITING_PAYMENT;
        } else {
            // COD: đơn vào PENDING, admin sẽ duyệt
            initialStatus = OrderStatus.PENDING;
        }

        // 6. Tạo Order
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setShippingAddress(shippingAddress);
        order.setPhoneNumber(phoneNumber);
        order.setPaymentMethod(paymentMethod);
        order.setNotes(request.getNotes());
        order.setStatus(initialStatus);
        order.setAppliedVoucher(appliedVoucher);
        order.setVoucherDiscount(voucherDiscount.doubleValue());
        order.setTotalPrice(totalPrice.doubleValue());

        // 7. Chuyển CartItem → OrderItem, kiểm tra + trừ stock
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

        // 8. Lưu order
        Order savedOrder = orderRepository.save(order);

        // 9. Increment voucher usage
        if (appliedVoucher != null) {
            voucherService.incrementUsage(appliedVoucher.getCode());
        }

        // 10. Xoá giỏ hàng
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cartRepository.save(cart);

        // 11. Build response
        OrderDTO orderDTO = mapToOrderDTO(savedOrder);

        // Nếu SEPAY, tạo QR payment URL để user thanh toán ngay
        if ("SEPAY".equals(paymentMethod)) {
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

        // User can cancel PENDING or AWAITING_PAYMENT orders
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException(
                    "Cannot cancel order with status: " + order.getStatus()
                            + ". Only PENDING or AWAITING_PAYMENT orders can be cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        restoreStock(order);
        restoreVoucher(order);

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
                            + ". Valid values: PENDING, AWAITING_PAYMENT, CONFIRMED, SHIPPING, DELIVERED, CANCELLED");
        }

        // Validate state transition
        OrderStatus currentStatus = order.getStatus();
        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new IllegalArgumentException(
                    "Invalid status transition: " + currentStatus + " → " + newStatus
                            + ". Allowed transitions: " + allowed);
        }

        // If cancelling, restore stock and voucher
        if (newStatus == OrderStatus.CANCELLED) {
            restoreStock(order);
            restoreVoucher(order);
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

        // Only process orders that are awaiting payment
        if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new IllegalStateException("Order already processed. Current status: " + order.getStatus());
        }

        if (Math.abs(order.getTotalPrice() - amount) > 0.01) {
            throw new IllegalArgumentException(
                    "Payment amount mismatch. Expected: " + order.getTotalPrice() + ", received: " + amount);
        }

        // Payment confirmed → move to CONFIRMED
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

    /**
     * Rollback voucher usage when an order is cancelled.
     */
    private void restoreVoucher(Order order) {
        if (order.getAppliedVoucher() != null) {
            voucherService.decrementUsage(order.getAppliedVoucher().getCode());
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

        // Voucher info
        if (order.getAppliedVoucher() != null) {
            dto.setVoucherCode(order.getAppliedVoucher().getCode());
        }
        dto.setVoucherDiscount(order.getVoucherDiscount() != null
                ? BigDecimal.valueOf(order.getVoucherDiscount())
                : BigDecimal.ZERO);

        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // Rating eligibility
        dto.setCanRate(order.getStatus() == OrderStatus.DELIVERED);

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
}
