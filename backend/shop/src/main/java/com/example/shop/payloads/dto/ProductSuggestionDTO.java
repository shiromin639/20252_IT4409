package com.example.shop.payloads.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSuggestionDTO {
    private Long productId;
    private String productName;
    private String image;
    private double specialPrice;
    private String categoryName;
}
