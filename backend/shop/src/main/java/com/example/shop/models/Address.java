package com.example.shop.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "addresses")
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String label; // e.g., "Home", "Office", "Mom's House"

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String street; // Địa chỉ chi tiết: số nhà, tên đường

    private String ward; // Phường/Xã

    private String district; // Quận/Huyện

    @Column(nullable = false)
    private String city; // Tỉnh/Thành phố

    private Boolean isDefault = false;

    /**
     * Build a full address string for display/order.
     */
    public String toFullAddress() {
        StringBuilder sb = new StringBuilder(street);
        if (ward != null && !ward.isEmpty()) sb.append(", ").append(ward);
        if (district != null && !district.isEmpty()) sb.append(", ").append(district);
        sb.append(", ").append(city);
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return addressId != null && addressId.equals(address.addressId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
