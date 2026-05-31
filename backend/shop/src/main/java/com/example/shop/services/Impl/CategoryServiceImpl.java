package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.Category;
import com.example.shop.payloads.dto.CategoryDTO;
import com.example.shop.payloads.response.CategoryResponse;
import com.example.shop.repositories.CategoryRepository;
import com.example.shop.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public CategoryResponse getAllCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Category> categoryPage = categoryRepository.findAll(pageDetails);

        List<Category> categories = categoryPage.getContent();
        if (categories.isEmpty())
            throw new RuntimeException("No category created till now.");

        // Dùng Method Reference gọi hàm mapping cực gọn
        List<CategoryDTO> categoryDTOS = categories.stream()
                .map(CategoryDTO::toDTO)
                .toList();

        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setContent(categoryDTOS);
        categoryResponse.setPageNumber(categoryPage.getNumber());
        categoryResponse.setPageSize(categoryPage.getSize());
        categoryResponse.setTotalElements(categoryPage.getTotalElements());
        categoryResponse.setTotalPages(categoryPage.getTotalPages());
        categoryResponse.setLastPage(categoryPage.isLast());
        return categoryResponse;
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        // Sử dụng hàm gán từ DTO sang Entity
        Category category = CategoryDTO.toEntity(categoryDTO);

        Category categoryFromDb = categoryRepository.findByCategoryName(category.getCategoryName());
        if (categoryFromDb != null)
            throw new RuntimeException("Category with the name " + category.getCategoryName() + " already exists !!!");

        Category savedCategory = categoryRepository.save(category);

        // Trả về DTO kết quả
        return CategoryDTO.toDTO(savedCategory);
    }

    @Override
    public CategoryDTO deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category","categoryId",categoryId));

        categoryRepository.delete(category);

        return CategoryDTO.toDTO(category);
    }

    @Override
    public CategoryDTO updateCategory(CategoryDTO categoryDTO, Long categoryId) {
        Category savedCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category","categoryId",categoryId));


        if (categoryDTO.getCategoryName() != null && !categoryDTO.getCategoryName().trim().isEmpty()) {
            savedCategory.setCategoryName(categoryDTO.getCategoryName());
        }


        if (categoryDTO.getDescription() != null) {
            savedCategory.setDescription(categoryDTO.getDescription());
        }
        Category updatedCategory = categoryRepository.save(savedCategory);

        return CategoryDTO.toDTO(updatedCategory);
    }
}