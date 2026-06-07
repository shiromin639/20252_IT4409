package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long userId;    private Long cartId;
    private List<CartItemDTO> items = new ArrayList<>();
    private BigDecimal totalPrice = BigDecimal.ZERO;
}
