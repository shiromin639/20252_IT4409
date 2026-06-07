package com.example.shop.repositories;

import com.example.shop.models.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserUserIdOrderByIsDefaultDesc(Long userId);

    Optional<Address> findByAddressIdAndUserUserId(Long addressId, Long userId);

    Optional<Address> findByUserUserIdAndIsDefaultTrue(Long userId);

    long countByUserUserId(Long userId);
}
