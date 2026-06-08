package com.example.shop.controllers;

import com.example.shop.payloads.dto.AdminDashboardDTO;
import com.example.shop.services.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "12. Admin Dashboard", description = "Admin analytics — revenue, orders, top products, user stats")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Operation(summary = "Get dashboard data",
            description = """
                    **Admin only.** Returns comprehensive analytics including:
                    - Total revenue, orders, products, users
                    - Average order value
                    - Orders grouped by status (pending, confirmed, shipping, delivered, cancelled)
                    - Revenue by month (last 6 months)
                    - Top 5 selling products
                    - 5 most recent orders with details""")
    @GetMapping
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminDashboardService.getDashboardData());
    }
}
