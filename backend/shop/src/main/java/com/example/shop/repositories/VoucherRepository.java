package com.example.shop.repositories;

import com.example.shop.models.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Voucher> findByIsActiveTrue();

    List<Voucher> findByIsActiveTrueAndExpiryDateAfter(LocalDateTime now);
}
