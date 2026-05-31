package com.example.shop.payloads.dto;

import com.example.shop.models.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long categoryId;
    private String categoryName;
    private String description;

    // 1. Chuyển đổi từ Entity sang DTO (Dùng khi trả dữ liệu về Client)
    public static CategoryDTO toDTO(Category category) {
        if (category == null) return null;
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        return dto;
    }

    // 2. Chuyển đổi từ DTO sang Entity (Dùng khi đón dữ liệu từ Client gửi lên)
    public static Category toEntity(CategoryDTO dto) {
        if (dto == null) return null;
        Category category = new Category();
        category.setCategoryId(dto.getCategoryId());
        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
        return category;
    }
}
