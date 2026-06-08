package com.example.shop.services.Impl;

import com.example.shop.models.Order;
import com.example.shop.models.OrderItem;
import com.example.shop.models.OrderStatus;
import com.example.shop.payloads.dto.AdminDashboardDTO;
import com.example.shop.payloads.dto.OrderDTO;
import com.example.shop.payloads.dto.OrderItemDTO;
import com.example.shop.repositories.OrderRepository;
import com.example.shop.repositories.ProductRepository;
import com.example.shop.repositories.UserRepository;
import com.example.shop.services.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public AdminDashboardDTO getDashboardData() {
        List<Order> allOrders = orderRepository.findAllOrdersSorted();

        AdminDashboardDTO dto = new AdminDashboardDTO();

        // === Summary Cards ===
        // Revenue = sum of totalPrice for non-cancelled orders
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(o -> BigDecimal.valueOf(o.getTotalPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.size();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        dto.setTotalRevenue(totalRevenue);
        dto.setTotalOrders(totalOrders);
        dto.setTotalProducts(totalProducts);
        dto.setTotalUsers(totalUsers);
        dto.setAverageOrderValue(averageOrderValue);

        // === Orders by Status ===
        Map<OrderStatus, Long> statusCounts = allOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        dto.setPendingOrders(statusCounts.getOrDefault(OrderStatus.PENDING, 0L));
        dto.setConfirmedOrders(statusCounts.getOrDefault(OrderStatus.CONFIRMED, 0L)
                + statusCounts.getOrDefault(OrderStatus.AWAITING_PAYMENT, 0L));
        dto.setShippingOrders(statusCounts.getOrDefault(OrderStatus.SHIPPING, 0L));
        dto.setDeliveredOrders(statusCounts.getOrDefault(OrderStatus.DELIVERED, 0L));
        dto.setCancelledOrders(statusCounts.getOrDefault(OrderStatus.CANCELLED, 0L));

        // === Revenue by Month (last 6 months) ===
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        Map<String, List<Order>> ordersByMonth = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(sixMonthsAgo))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().format(monthFormatter),
                        TreeMap::new,
                        Collectors.toList()
                ));

        List<AdminDashboardDTO.MonthlyRevenue> revenueByMonth = new ArrayList<>();
        for (Map.Entry<String, List<Order>> entry : ordersByMonth.entrySet()) {
            BigDecimal monthRevenue = entry.getValue().stream()
                    .map(o -> BigDecimal.valueOf(o.getTotalPrice()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueByMonth.add(new AdminDashboardDTO.MonthlyRevenue(
                    entry.getKey(), monthRevenue, (long) entry.getValue().size()
            ));
        }
        dto.setRevenueByMonth(revenueByMonth);

        // === Top Selling Products (by quantity sold) ===
        Map<Long, AdminDashboardDTO.TopProduct> productSalesMap = new HashMap<>();
        for (Order order : allOrders) {
            if (order.getStatus() == OrderStatus.CANCELLED) continue;
            for (OrderItem item : order.getOrderItems()) {
                Long productId = item.getProduct().getProductId();
                AdminDashboardDTO.TopProduct tp = productSalesMap.computeIfAbsent(productId,
                        id -> new AdminDashboardDTO.TopProduct(
                                id,
                                item.getProductName(),
                                item.getProductImage(),
                                0L,
                                BigDecimal.ZERO
                        ));
                tp.setTotalSold(tp.getTotalSold() + item.getQuantity());
                tp.setTotalRevenue(tp.getTotalRevenue().add(
                        BigDecimal.valueOf(item.getProductPrice() * item.getQuantity())));
            }
        }

        List<AdminDashboardDTO.TopProduct> topProducts = productSalesMap.values().stream()
                .sorted(Comparator.comparingLong(AdminDashboardDTO.TopProduct::getTotalSold).reversed())
                .limit(5)
                .toList();
        dto.setTopProducts(topProducts);

        // === Recent Orders (last 5) ===
        List<OrderDTO> recentOrders = allOrders.stream()
                .limit(5)
                .map(this::mapToOrderDTO)
                .toList();
        dto.setRecentOrders(recentOrders);

        return dto;
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
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getAppliedVoucher() != null) {
            dto.setVoucherCode(order.getAppliedVoucher().getCode());
        }
        dto.setVoucherDiscount(order.getVoucherDiscount() != null
                ? BigDecimal.valueOf(order.getVoucherDiscount()) : BigDecimal.ZERO);

        List<OrderItemDTO> items = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setOrderItemId(item.getOrderItemId());
            itemDto.setProductId(item.getProduct().getProductId());
            itemDto.setProductName(item.getProductName());
            itemDto.setProductImage(item.getProductImage());
            itemDto.setProductPrice(BigDecimal.valueOf(item.getProductPrice()));
            itemDto.setQuantity(item.getQuantity());
            itemDto.setSubTotal(BigDecimal.valueOf(item.getProductPrice() * item.getQuantity()));
            items.add(itemDto);
        }
        dto.setItems(items);
        return dto;
    }
}
