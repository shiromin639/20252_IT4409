package com.example.shop.services.Impl;

import com.example.shop.exceptions.ResourceNotFoundException;
import com.example.shop.models.Address;
import com.example.shop.models.User;
import com.example.shop.payloads.dto.AddressDTO;
import com.example.shop.payloads.request.AddressRequest;
import com.example.shop.repositories.AddressRepository;
import com.example.shop.repositories.UserRepository;
import com.example.shop.services.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressDTO> getUserAddresses(Long userId) {
        return addressRepository.findByUserUserIdOrderByIsDefaultDesc(userId)
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressDTO getAddressById(Long userId, Long addressId) {
        Address address = addressRepository.findByAddressIdAndUserUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));
        return mapToDTO(address);
    }

    @Override
    public AddressDTO createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        Address address = new Address();
        address.setUser(user);
        applyRequest(address, request);

        // If this is the first address or marked as default, handle it
        if (request.getIsDefault() || addressRepository.countByUserUserId(userId) == 0) {
            clearDefaultAddresses(userId);
            address.setIsDefault(true);
        }

        return mapToDTO(addressRepository.save(address));
    }

    @Override
    public AddressDTO updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByAddressIdAndUserUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        applyRequest(address, request);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddresses(userId);
            address.setIsDefault(true);
        }

        return mapToDTO(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByAddressIdAndUserUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));
        addressRepository.delete(address);
    }

    @Override
    public AddressDTO setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByAddressIdAndUserUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        clearDefaultAddresses(userId);
        address.setIsDefault(true);
        return mapToDTO(addressRepository.save(address));
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private void clearDefaultAddresses(Long userId) {
        addressRepository.findByUserUserIdOrderByIsDefaultDesc(userId)
                .forEach(a -> {
                    if (Boolean.TRUE.equals(a.getIsDefault())) {
                        a.setIsDefault(false);
                        addressRepository.save(a);
                    }
                });
    }

    private void applyRequest(Address address, AddressRequest request) {
        address.setLabel(request.getLabel());
        address.setRecipientName(request.getRecipientName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreet(request.getStreet());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setCity(request.getCity());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
    }

    private AddressDTO mapToDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setAddressId(address.getAddressId());
        dto.setLabel(address.getLabel());
        dto.setRecipientName(address.getRecipientName());
        dto.setPhoneNumber(address.getPhoneNumber());
        dto.setStreet(address.getStreet());
        dto.setWard(address.getWard());
        dto.setDistrict(address.getDistrict());
        dto.setCity(address.getCity());
        dto.setIsDefault(address.getIsDefault());
        dto.setFullAddress(address.toFullAddress());
        return dto;
    }
}
