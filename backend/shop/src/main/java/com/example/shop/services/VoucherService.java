package com.example.shop.services;

import com.example.shop.payloads.dto.VoucherDTO;
import com.example.shop.payloads.request.VoucherRequest;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {

    // === Admin CRUD ===

    VoucherDTO createVoucher(VoucherRequest request);

    VoucherDTO updateVoucher(Long voucherId, VoucherRequest request);

    VoucherDTO deactivateVoucher(Long voucherId);

    List<VoucherDTO> getAllVouchers();

    VoucherDTO getVoucherById(Long voucherId);

    // === Public/User ===

    /** Get all currently valid vouchers (active + not expired + has remaining uses) */
    List<VoucherDTO> getAvailableVouchers();

    // === Internal use by OrderService ===

    /** Validate voucher and return discount info */
    VoucherValidationResult validateVoucher(String voucherCode, BigDecimal subTotal);

    /** Increment usage count after successful checkout */
    void incrementUsage(String voucherCode);

    /** Decrement usage count when order is cancelled (rollback) */
    void decrementUsage(String voucherCode);

    record VoucherValidationResult(
            boolean valid,
            BigDecimal discount,
            String message,
            Long voucherId
    ) {}
}
