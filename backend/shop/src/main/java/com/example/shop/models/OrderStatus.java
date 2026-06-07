package com.example.shop.models;

public enum OrderStatus {
    PENDING,            // COD: Vừa đặt, chờ admin xác nhận
    AWAITING_PAYMENT,   // SEPAY: Đã tạo đơn, chờ thanh toán chuyển khoản
    CONFIRMED,          // Đã xác nhận (COD: admin duyệt, SEPAY: đã nhận tiền)
    SHIPPING,           // Đang giao hàng
    DELIVERED,          // Đã giao thành công
    CANCELLED           // Đã hủy
}
