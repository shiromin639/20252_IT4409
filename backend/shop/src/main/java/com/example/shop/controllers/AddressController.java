package com.example.shop.controllers;

import com.example.shop.payloads.dto.AddressDTO;
import com.example.shop.payloads.request.AddressRequest;
import com.example.shop.services.AddressService;
import com.example.shop.utils.AuthUtil;
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
@RequestMapping("/api/addresses")
@PreAuthorize("isAuthenticated()")
@Tag(name = "11. Addresses", description = "Saved shipping address management")
public class AddressController {

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private AddressService addressService;

    @Operation(summary = "Get my addresses", description = "Returns all saved addresses for the current user, ordered by default first.")
    @GetMapping
    public ResponseEntity<List<AddressDTO>> getMyAddresses() {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @Operation(summary = "Get address by ID", description = "Get a specific address.")
    @GetMapping("/{addressId}")
    public ResponseEntity<AddressDTO> getAddress(@PathVariable Long addressId) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(addressService.getAddressById(userId, addressId));
    }

    @Operation(summary = "Create address", description = "Create a new shipping address. If it's the first address or marked as default, it becomes the default.")
    @ApiResponse(responseCode = "201", description = "Address created")
    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressRequest request) {
        Long userId = authUtil.loggedInUserId();
        AddressDTO created = addressService.createAddress(userId, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @Operation(summary = "Update address", description = "Update an existing address's details.")
    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(@PathVariable Long addressId,
                                                     @Valid @RequestBody AddressRequest request) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(addressService.updateAddress(userId, addressId, request));
    }

    @Operation(summary = "Delete address", description = "Delete a saved address.")
    @ApiResponse(responseCode = "204", description = "Address deleted")
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        Long userId = authUtil.loggedInUserId();
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Set default address", description = "Set an address as the default shipping address. The previous default is unset.")
    @PutMapping("/{addressId}/default")
    public ResponseEntity<AddressDTO> setDefault(@PathVariable Long addressId) {
        Long userId = authUtil.loggedInUserId();
        return ResponseEntity.ok(addressService.setDefaultAddress(userId, addressId));
    }
}
