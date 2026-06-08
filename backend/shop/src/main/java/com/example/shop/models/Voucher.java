package com.example.shop.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "vouchers")
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long voucherId;

    @Column(unique = true, nullable = false)
    private String code; // e.g., "TECH10", "SUMMER50"

    @Enumerated(EnumType.STRING)
    private DiscountType discountType; // PERCENTAGE or FIXED

    private Double discountValue; // e.g., 10.0 for 10%, or 15000 for 15,000 VND

    private Double minOrderValue; // Minimum cart total required to use this voucher

    private Double maxDiscountAmount; // Cap for percentage discounts (null = no cap)

    private Integer usageLimit; // Max total uses allowed (null = unlimited)

    private Integer usedCount = 0; // Current number of times used

    private LocalDateTime expiryDate;

    private Boolean isActive = true;

    private String description; // Human-readable description for users

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum DiscountType {
        PERCENTAGE, FIXED
    }

    /**
     * Validate if this voucher can be used for the given cart total.
     */
    public boolean isValid(Double currentCartTotal) {
        return isActive
                && LocalDateTime.now().isBefore(expiryDate)
                && currentCartTotal >= minOrderValue
                && (usageLimit == null || usedCount < usageLimit);
    }

    /**
     * Calculate the discount amount for a given subtotal.
     */
    public Double calculateDiscount(Double subTotal) {
        if (discountType == DiscountType.PERCENTAGE) {
            double discount = subTotal * (discountValue / 100.0);
            if (maxDiscountAmount != null) {
                discount = Math.min(discount, maxDiscountAmount);
            }
            return Math.min(discount, subTotal);
        } else {
            return Math.min(discountValue, subTotal);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Voucher voucher = (Voucher) o;
        return voucherId != null && voucherId.equals(voucher.voucherId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
