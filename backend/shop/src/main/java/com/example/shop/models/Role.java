package com.example.shop.models;

import jakarta.persistence.*;
import lombok.*;

/*
 * Model Role được sử dụng để lưu trữ thông tin về vai trò của người dùng trong hệ thống.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roleId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, name = "role_name", nullable = false, unique = true)
    private AppRole roleName;


}