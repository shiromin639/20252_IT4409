package com.example.shop.configs;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TechShop API")
                        .version("1.0.0")
                        .description("""
                                ## TechShop E-Commerce Backend API

                                RESTful API for a full-featured e-commerce platform with:
                                - **Authentication** — JWT cookie-based login/signup
                                - **Product Catalog** — Browse, search, filter products by category/keyword/price
                                - **Shopping Cart** — Add, update, remove items
                                - **Checkout & Orders** — Preview, confirm, cancel orders with stock management
                                - **Payments** — SePay QR bank transfer integration with webhook confirmation
                                - **Vouchers** — Discount code system with validation
                                - **Ratings** — Product reviews and rating summaries
                                - **User Profile** — Manage profile, addresses, change password
                                - **Admin Dashboard** — Analytics, order management, product/category/voucher CRUD

                                ### Roles
                                | Role | Description |
                                |------|-------------|
                                | `ROLE_USER` | Registered customer |
                                | `ROLE_ADMIN` | Shop admin (full access) |

                                ### Authentication
                                Use the **Login** endpoint to get a JWT cookie. The cookie is automatically sent with subsequent requests.
                                For Swagger UI testing, use the 🔒 **Authorize** button and paste the JWT token value (without `Bearer` prefix).
                                """)
                        .contact(new Contact()
                                .name("TechShop Team")
                                .email("support@techshop.vn")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development")))
                .addSecurityItem(new SecurityRequirement().addList("JWT Cookie"))
                .components(new Components()
                        .addSecuritySchemes("JWT Cookie", new SecurityScheme()
                                .name("jwtCookie")
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .description("JWT token stored in cookie named `jwtCookie`. Login via `/api/auth/login` to obtain it."))
                        .addSecuritySchemes("Bearer Token", new SecurityScheme()
                                .name("Bearer Token")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Alternatively, paste JWT directly as Bearer token for Swagger UI testing.")));
    }
}
