package com.example.shop.repositories;

import com.example.shop.models.Order;
import com.example.shop.models.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findOrdersByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId AND o.orderId = :orderId")
    Optional<Order> findOrderByUserIdAndOrderId(@Param("userId") Long userId, @Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findOrdersByStatus(@Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllOrdersSorted();
}
