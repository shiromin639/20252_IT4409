package com.example.shop.models;

public enum OrderStatus {
    PENDING,        // Vừa đặt, chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    SHIPPING,       // Đang giao hàng
    DELIVERED,      // Đã giao thành công
    CANCELLED       // Đã hủy
}
