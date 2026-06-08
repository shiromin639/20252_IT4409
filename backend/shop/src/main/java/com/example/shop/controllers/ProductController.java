package com.example.shop.controllers;

import com.example.shop.configs.AppConstants;
import com.example.shop.payloads.dto.ProductDTO;
import com.example.shop.payloads.dto.ProductSuggestionDTO;
import com.example.shop.payloads.response.ProductResponse;
import com.example.shop.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "2. Products", description = "Product browsing (public) and product management (admin)")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ==========================================
    // PUBLIC — Guest accessible (no auth required)
    // ==========================================

    @Operation(summary = "List products", description = "Public product listing with optional keyword, category, and price range filters. Supports pagination and sorting.")
    @GetMapping("/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @Parameter(description = "Search keyword") @RequestParam(name = "keyword", required = false) String keyword,
            @Parameter(description = "Category name filter") @RequestParam(name = "category", required = false) String category,
            @Parameter(description = "Minimum price filter") @RequestParam(name = "minPrice", required = false) Double minPrice,
            @Parameter(description = "Maximum price filter") @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.getAllProducts(pageNumber, pageSize, sortBy, sortOrder,
                keyword, category, minPrice, maxPrice);
        return ResponseEntity.ok(productResponse);
    }

    @Operation(summary = "Search suggestions", description = "Live typeahead search — returns top N products matching the query for autocomplete.")
    @GetMapping("/products/search/suggestions")
    public ResponseEntity<List<ProductSuggestionDTO>> getSearchSuggestions(
            @Parameter(description = "Search query", required = true) @RequestParam(name = "q") String query,
            @Parameter(description = "Max results to return") @RequestParam(name = "limit", defaultValue = "8") int limit) {
        List<ProductSuggestionDTO> suggestions = productService.getSearchSuggestions(query, limit);
        return ResponseEntity.ok(suggestions);
    }

    @Operation(summary = "Products by category", description = "Get products belonging to a specific category. Supports pagination.")
    @GetMapping("/categories/{categoryId}/products")
    public ResponseEntity<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.searchByCategory(categoryId, pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(productResponse);
    }

    @Operation(summary = "Search products by keyword", description = "Search products by name keyword. Supports pagination.")
    @GetMapping("/products/keyword/{keyword}")
    public ResponseEntity<ProductResponse> getProductsByKeyword(
            @PathVariable String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.searchProductByKeyword(keyword, pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(productResponse);
    }

    // ==========================================
    // ADMIN — Product management
    // ==========================================

    @Operation(summary = "Create product", description = "**Admin only.** Create a new product under a category.")
    @ApiResponse(responseCode = "201", description = "Product created")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductDTO productDTO,
                                                 @PathVariable Long categoryId) {
        ProductDTO savedProductDTO = productService.addProduct(categoryId, productDTO);
        return new ResponseEntity<>(savedProductDTO, HttpStatus.CREATED);
    }

    @Operation(summary = "List all products (admin)", description = "**Admin only.** Get all products with full details for management.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/products/admin")
    public ResponseEntity<ProductResponse> getAllProductsForAdmin(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ProductResponse productResponse = productService.getAllProductsForAdmin(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(productResponse);
    }

    @Operation(summary = "Update product", description = "**Admin only.** Update product details.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@Valid @RequestBody ProductDTO productDTO,
                                                    @PathVariable Long productId) {
        ProductDTO updatedProductDTO = productService.updateProduct(productId, productDTO);
        return ResponseEntity.ok(updatedProductDTO);
    }

    @Operation(summary = "Delete product", description = "**Admin only.** Delete a product by ID.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Long productId) {
        ProductDTO deletedProduct = productService.deleteProduct(productId);
        return ResponseEntity.ok(deletedProduct);
    }

    @Operation(summary = "Upload product image", description = "**Admin only.** Upload an image file for a product. Supports JPEG, PNG, WebP (max 5MB).")
    @ApiResponse(responseCode = "200", description = "Image uploaded and product updated")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/products/{productId}/image")
    public ResponseEntity<ProductDTO> updateProductImage(@PathVariable Long productId,
                                                         @RequestParam("image") MultipartFile image) throws IOException {
        ProductDTO updatedProduct = productService.updateProductImage(productId, image);
        return ResponseEntity.ok(updatedProduct);
    }
}