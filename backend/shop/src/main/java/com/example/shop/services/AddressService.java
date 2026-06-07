package com.example.shop.services;

import com.example.shop.payloads.dto.AddressDTO;
import com.example.shop.payloads.request.AddressRequest;

import java.util.List;

public interface AddressService {

    List<AddressDTO> getUserAddresses(Long userId);

    AddressDTO getAddressById(Long userId, Long addressId);

    AddressDTO createAddress(Long userId, AddressRequest request);

    AddressDTO updateAddress(Long userId, Long addressId, AddressRequest request);

    void deleteAddress(Long userId, Long addressId);

    AddressDTO setDefaultAddress(Long userId, Long addressId);
}
