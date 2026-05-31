package com.example.shop.repositories;

import com.example.shop.models.AppRole;
import com.example.shop.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    Boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.role r WHERE r.roleName = :role")
    Page<User> findByRoleName(@Param("role") AppRole role, Pageable pageable);
}