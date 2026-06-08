package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.Voucher;
import com.example.shop.payloads.dto.VoucherDTO;
import com.example.shop.payloads.request.VoucherRequest;
import com.example.shop.repositories.VoucherRepository;
import com.example.shop.services.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    // ==========================================
    // ADMIN CRUD
    // ==========================================

    @Override
    public VoucherDTO createVoucher(VoucherRequest request) {
        if (voucherRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalArgumentException("Voucher code already exists: " + request.getCode());
        }

        Voucher voucher = new Voucher();
        voucher.setCode(request.getCode().toUpperCase().trim());
        voucher.setDiscountType(Voucher.DiscountType.valueOf(request.getDiscountType().toUpperCase()));
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setUsedCount(0);
        voucher.setExpiryDate(request.getExpiryDate());
        voucher.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        voucher.setDescription(request.getDescription());

        return mapToDTO(voucherRepository.save(voucher));
    }

    @Override
    public VoucherDTO updateVoucher(Long voucherId, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "voucherId", voucherId));

        voucher.setCode(request.getCode().toUpperCase().trim());
        voucher.setDiscountType(Voucher.DiscountType.valueOf(request.getDiscountType().toUpperCase()));
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setExpiryDate(request.getExpiryDate());
        voucher.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        voucher.setDescription(request.getDescription());

        return mapToDTO(voucherRepository.save(voucher));
    }

    @Override
    public VoucherDTO deactivateVoucher(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "voucherId", voucherId));
        voucher.setIsActive(false);
        return mapToDTO(voucherRepository.save(voucher));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherDTO> getAllVouchers() {
        return voucherRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherDTO getVoucherById(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "voucherId", voucherId));
        return mapToDTO(voucher);
    }

    // ==========================================
    // PUBLIC
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<VoucherDTO> getAvailableVouchers() {
        return voucherRepository.findByIsActiveTrueAndExpiryDateAfter(LocalDateTime.now())
                .stream()
                .filter(v -> v.getUsageLimit() == null || v.getUsedCount() < v.getUsageLimit())
                .map(this::mapToDTO)
                .toList();
    }

    // ==========================================
    // INTERNAL — used by OrderService
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public VoucherValidationResult validateVoucher(String voucherCode, BigDecimal subTotal) {
        if (voucherCode == null || voucherCode.trim().isEmpty()) {
            return new VoucherValidationResult(false, BigDecimal.ZERO, "No voucher applied", null);
        }

        var optionalVoucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim());
        if (optionalVoucher.isEmpty()) {
            return new VoucherValidationResult(false, BigDecimal.ZERO, "Voucher not found: " + voucherCode, null);
        }

        Voucher voucher = optionalVoucher.get();

        if (!voucher.getIsActive()) {
            return new VoucherValidationResult(false, BigDecimal.ZERO, "Voucher is inactive", null);
        }
        if (LocalDateTime.now().isAfter(voucher.getExpiryDate())) {
            return new VoucherValidationResult(false, BigDecimal.ZERO, "Voucher has expired", null);
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return new VoucherValidationResult(false, BigDecimal.ZERO, "Voucher usage limit reached", null);
        }
        if (subTotal.doubleValue() < voucher.getMinOrderValue()) {
            return new VoucherValidationResult(false, BigDecimal.ZERO,
                    "Minimum order value not met. Required: " + voucher.getMinOrderValue(), null);
        }

        Double discountAmount = voucher.calculateDiscount(subTotal.doubleValue());
        String message = voucher.getDiscountType() == Voucher.DiscountType.PERCENTAGE
                ? "Applied " + voucher.getDiscountValue().intValue() + "% discount"
                : "Applied " + String.format("%,.0f", voucher.getDiscountValue()) + " VND discount";

        return new VoucherValidationResult(true, BigDecimal.valueOf(discountAmount), message, voucher.getVoucherId());
    }

    @Override
    public void incrementUsage(String voucherCode) {
        voucherRepository.findByCodeIgnoreCase(voucherCode.trim()).ifPresent(voucher -> {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);
        });
    }

    @Override
    public void decrementUsage(String voucherCode) {
        voucherRepository.findByCodeIgnoreCase(voucherCode.trim()).ifPresent(voucher -> {
            if (voucher.getUsedCount() > 0) {
                voucher.setUsedCount(voucher.getUsedCount() - 1);
                voucherRepository.save(voucher);
            }
        });
    }

    // ==========================================
    // MAPPER
    // ==========================================

    private VoucherDTO mapToDTO(Voucher voucher) {
        VoucherDTO dto = new VoucherDTO();
        dto.setVoucherId(voucher.getVoucherId());
        dto.setCode(voucher.getCode());
        dto.setDiscountType(voucher.getDiscountType().name());
        dto.setDiscountValue(voucher.getDiscountValue());
        dto.setMinOrderValue(voucher.getMinOrderValue());
        dto.setMaxDiscountAmount(voucher.getMaxDiscountAmount());
        dto.setUsageLimit(voucher.getUsageLimit());
        dto.setUsedCount(voucher.getUsedCount());
        dto.setExpiryDate(voucher.getExpiryDate());
        dto.setIsActive(voucher.getIsActive());
        dto.setDescription(voucher.getDescription());
        return dto;
    }
}
