package com.example.shop.payloads.dto;

import com.example.shop.models.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long productId;
    private String productName;
    private String image;
    private String description;
    private Integer quantity;
    private double price;
    private double discount;
    private double specialPrice;
    private CategoryDTO category; // Sử dụng CategoryDTO đã có

    // 1. Chuyển đổi từ Entity sang DTO (Trả về Client)
    public static ProductDTO toDTO(Product product) {
        if (product == null) return null;
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setImage(product.getImage());
        dto.setDescription(product.getDescription());
        dto.setQuantity(product.getQuantity());
        dto.setPrice(product.getPrice());
        dto.setDiscount(product.getDiscount());
        dto.setSpecialPrice(product.getSpecialPrice());

        // Map kèm thông tin danh mục bằng hàm tĩnh của CategoryDTO
        if (product.getCategory() != null) {
            dto.setCategory(CategoryDTO.toDTO(product.getCategory()));
        }
        return dto;
    }

    // 2. Chuyển đổi từ DTO sang Entity (Đón Request)
    public static Product toEntity(ProductDTO dto) {
        if (dto == null) return null;
        Product product = new Product();
        product.setProductId(dto.getProductId());
        product.setProductName(dto.getProductName());
        product.setImage(dto.getImage());
        product.setDescription(dto.getDescription());
        product.setQuantity(dto.getQuantity());
        product.setPrice(dto.getPrice());
        product.setDiscount(dto.getDiscount());
        product.setSpecialPrice(dto.getSpecialPrice());

        if (dto.getCategory() != null) {
            product.setCategory(CategoryDTO.toEntity(dto.getCategory()));
        }
        return product;
    }
}