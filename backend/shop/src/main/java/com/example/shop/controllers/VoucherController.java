package com.example.shop.controllers;

import com.example.shop.payloads.dto.VoucherDTO;
import com.example.shop.payloads.request.VoucherRequest;
import com.example.shop.services.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@Tag(name = "8. Vouchers", description = "Discount voucher browsing (public) and management (admin)")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    // ==========================================
    // PUBLIC
    // ==========================================

    @Operation(summary = "Get available vouchers", description = "Public — Returns all currently valid vouchers (active, not expired, has remaining uses).")
    @GetMapping("/available")
    public ResponseEntity<List<VoucherDTO>> getAvailableVouchers() {
        return ResponseEntity.ok(voucherService.getAvailableVouchers());
    }

    // ==========================================
    // ADMIN
    // ==========================================

    @Operation(summary = "List all vouchers (admin)", description = "**Admin only.** Returns all vouchers including inactive and expired ones.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<VoucherDTO>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @Operation(summary = "Get voucher by ID (admin)", description = "**Admin only.** Get a specific voucher's details.")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{voucherId}")
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable Long voucherId) {
        return ResponseEntity.ok(voucherService.getVoucherById(voucherId));
    }

    @Operation(summary = "Create voucher", description = "**Admin only.** Create a new discount voucher with code, type (PERCENTAGE/FIXED), limits, and expiry date.")
    @ApiResponse(responseCode = "201", description = "Voucher created")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<VoucherDTO> createVoucher(@Valid @RequestBody VoucherRequest request) {
        VoucherDTO created = voucherService.createVoucher(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @Operation(summary = "Update voucher", description = "**Admin only.** Update voucher details.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{voucherId}")
    public ResponseEntity<VoucherDTO> updateVoucher(@PathVariable Long voucherId,
                                                     @Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(voucherId, request));
    }

    @Operation(summary = "Deactivate voucher", description = "**Admin only.** Deactivate a voucher. It will no longer be available for use.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{voucherId}/deactivate")
    public ResponseEntity<VoucherDTO> deactivateVoucher(@PathVariable Long voucherId) {
        return ResponseEntity.ok(voucherService.deactivateVoucher(voucherId));
    }
}
