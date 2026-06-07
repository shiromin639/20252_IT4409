package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    // Summary cards
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalUsers;
    private BigDecimal averageOrderValue;

    // Orders by status breakdown
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long shippingOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;

    // Revenue by month (last 6 months)
    private List<MonthlyRevenue> revenueByMonth;

    // Top selling products
    private List<TopProduct> topProducts;

    // Recent orders (last 5)
    private List<OrderDTO> recentOrders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month; // "2026-01"
        private BigDecimal revenue;
        private Long orderCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private Long productId;
        private String productName;
        private String image;
        private Long totalSold;
        private BigDecimal totalRevenue;
    }
}
