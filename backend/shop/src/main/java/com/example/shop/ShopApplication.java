package com.example.shop;

import com.example.shop.models.AppRole;
import com.example.shop.models.Role;
import com.example.shop.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ShopApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopApplication.class, args);
	}

	// Đoạn code này sẽ tự động kiểm tra và chèn Role nếu database chưa có
	@Bean
	CommandLineRunner initRoles(RoleRepository roleRepository) {
		return args -> {
			if (roleRepository.findByRoleName(AppRole.ROLE_USER).isEmpty()) {
				Role userRole = new Role();
				userRole.setRoleName(AppRole.ROLE_USER);
				roleRepository.save(userRole);
			}
			if (roleRepository.findByRoleName(AppRole.ROLE_ADMIN).isEmpty()) {
				Role adminRole = new Role();
				adminRole.setRoleName(AppRole.ROLE_ADMIN);
				roleRepository.save(adminRole);
			}
		};
	}
}