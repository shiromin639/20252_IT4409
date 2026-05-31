package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.Category;
import com.example.shop.models.Product;
import com.example.shop.payloads.dto.ProductDTO;
import com.example.shop.payloads.response.ProductResponse;
import com.example.shop.repositories.CategoryRepository;
import com.example.shop.repositories.ProductRepository;
import com.example.shop.services.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Value("${image.base.url}")
    private String imageBaseUrl;

    @Override
    public ProductDTO addProduct(Long categoryId, ProductDTO productDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        // Kiểm tra trùng tên sản phẩm bằng query DB trực tiếp (Nhanh và sạch hơn dùng vòng lặp for)
        boolean isProductPresent = productRepository.existsByProductNameAndCategory(productDTO.getProductName(), category);
        if (isProductPresent) {
            throw new RuntimeException("Product already exists in this category!!");
        }

        Product product = modelMapper.map(productDTO, Product.class);
        product.setImage("default.png");
        product.setCategory(category);
        product.setSpecialPrice(calculateSpecialPrice(product.getPrice(), product.getDiscount()));

        Product savedProduct = productRepository.save(product);
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, String keyword, String category) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Specification<Product> spec = (root, query, cb) -> cb.conjunction();
        if (keyword != null && !keyword.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("productName")), "%" + keyword.toLowerCase() + "%"));
        }
        if (category != null && !category.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(root.get("category").get("categoryName"), category));
        }

        Page<Product> pageProducts = productRepository.findAll(spec, pageDetails);
        return convertToProductResponse(pageProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getAllProductsForAdmin(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts = productRepository.findAll(pageDetails);
        return convertToProductResponse(pageProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse searchByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts = productRepository.findByCategoryOrderByPriceAsc(category, pageDetails);
        if (pageProducts.isEmpty()) {
            throw new RuntimeException(category.getCategoryName() + " category does not have any products");
        }

        return convertToProductResponse(pageProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse searchProductByKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts = productRepository.findByProductNameLikeIgnoreCase("%" + keyword + "%", pageDetails);
        if (pageProducts.isEmpty()) {
            throw new RuntimeException("Products not found with keyword: " + keyword);
        }

        return convertToProductResponse(pageProducts);
    }

    @Override
    public ProductDTO updateProduct(Long productId, ProductDTO productDTO) {
        Product productFromDb = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        productFromDb.setProductName(productDTO.getProductName());
        productFromDb.setDescription(productDTO.getDescription());
        productFromDb.setQuantity(productDTO.getQuantity());
        productFromDb.setPrice(productDTO.getPrice());
        productFromDb.setDiscount(productDTO.getDiscount());
        productFromDb.setSpecialPrice(calculateSpecialPrice(productDTO.getPrice(), productDTO.getDiscount()));

        Product savedProduct = productRepository.save(productFromDb);
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    public ProductDTO deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        // CHÚ Ý: Trong microservices, nếu xóa Product, bạn chỉ cần xóa ở bảng Product
        // Hoặc tốt nhất là Soft Delete (set trạng thái isActive = false) để không làm gãy dữ liệu lịch sử hóa đơn.
        productRepository.delete(product);
        return modelMapper.map(product, ProductDTO.class);
    }

    @Override
    public ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException {
        return null; // Giữ nguyên cấu trúc chờ làm phần file
    }

    // ==========================================
    // CÁC HÀM TRỢ GIÚP GIÚP CODE SẠCH (HELPER METHODS)
    // ==========================================

    private double calculateSpecialPrice(double price, double discount) {
        return price - ((discount * 0.01) * price);
    }

    private String constructImageUrl(String imageName) {
        if (imageName == null || imageName.isEmpty()) return imageBaseUrl + "/default.png";
        return imageBaseUrl.endsWith("/") ? imageBaseUrl + imageName : imageBaseUrl + "/" + imageName;
    }

    private ProductResponse convertToProductResponse(Page<Product> pageProducts) {
        List<ProductDTO> productDTOs = pageProducts.getContent().stream()
                .map(product -> {
                    ProductDTO dto = modelMapper.map(product, ProductDTO.class);
                    dto.setImage(constructImageUrl(product.getImage()));
                    return dto;
                })
                .toList();

        ProductResponse response = new ProductResponse();
        response.setContent(productDTOs);
        response.setPageNumber(pageProducts.getNumber());
        response.setPageSize(pageProducts.getSize());
        response.setTotalElements(pageProducts.getTotalElements());
        response.setTotalPages(pageProducts.getTotalPages());
        response.setLastPage(pageProducts.isLast());
        return response;
    }
}