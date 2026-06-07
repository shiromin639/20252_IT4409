package com.example.shop.repositories;

import com.example.shop.models.Category;
import com.example.shop.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findByCategoryOrderByPriceAsc(Category category, Pageable pageDetails);

    Page<Product> findByProductNameLikeIgnoreCase(String keyword, Pageable pageDetails);

    boolean existsByProductNameAndCategory(String productName, Category category);

    /** Typeahead search — returns product names/ids matching prefix for live search suggestions */
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.productName ASC")
    List<Product> findSuggestions(@Param("keyword") String keyword, Pageable pageable);

    /** Price range filter */
    @Query("SELECT p FROM Product p WHERE p.specialPrice BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") double minPrice,
                                    @Param("maxPrice") double maxPrice,
                                    Pageable pageable);
}
