# TechLap E-Commerce Microservices

A modern, highly scalable E-Commerce platform built with a Microservices architecture. This project leverages the power of React, FastAPI, Go, and Docker to deliver a robust shopping experience with centralized gateway routing, distributed databases, real-time caching, and seamless payment integration.

## Overview

TechLap is a comprehensive e-commerce solution designed for modern web environments. 
**Purpose**: To provide a fully functional, scalable, and secure online shopping platform that demonstrates advanced architectural patterns (Microservices, API Gateway, Containerization) while delivering a premium user experience.
**Target Users**: Everyday consumers looking to purchase tech products (laptops, accessories), as well as store administrators requiring a powerful dashboard for inventory, product, and order management.
**Main Functionalities**: End-to-end shopping workflow including user authentication, product browsing with advanced semantic search and filtering, cart management, checkout with VNPay, and a dedicated admin portal for business operations.

## Features

### Customer Features
* **Authentication**: Secure JWT-based login and registration.
* **Product Browsing**: Dynamic product catalog with detailed specifications, image galleries, and related items.
* **Product Search**: Advanced semantic Full-Text Search (FTS) optimized by PostgreSQL.
* **Product Filtering**: Multi-dimensional filtering by Brand, Price Range, RAM, Category.
* **Shopping Cart**: Real-time cart management synchronized across sessions.
* **Checkout**: Streamlined checkout process with shipping validation.
* **VNPay Payment**: Secure, sandbox-integrated VNPay payment gateway with IPN webhooks.
* **Order History**: Track past orders and their real-time payment/shipping status.
* **Wishlist**: Save favorite products for later.
* **User Profile**: Manage personal information and delivery addresses.

### Admin Features
* **Dashboard**: Real-time revenue statistics, sales trends, and low-stock alerts.
* **Product Management**: Full CRUD capabilities with Cloudinary image upload integration.
* **Category Management**: Organize products into logical categories.
* **Inventory Management**: Direct stock allocation and real-time synchronization.
* **Order Management**: Monitor order statuses and update shipping workflows.
* **Revenue Statistics**: Visual charts rendering historical sales and platform performance.

## System Architecture

The project employs a robust Microservices architecture interconnected via a centralized API Gateway and orchestrated by Docker.

`Frontend Client` → `API Gateway (Go)` → `Internal Microservices (FastAPI)`

### Service Responsibilities:
* **API Gateway (Go)**: Acts as the single entry point for all frontend requests. It handles reverse proxy routing, CORS, and redirects requests to the appropriate internal service without exposing the internal network topography.
* **User Service**: Manages user accounts, JWT authentication issuance, and role-based access control (RBAC).
* **Product Service**: The largest service, responsible for the product catalog, semantic search, brand/category filtering, and product reviews. Uses Redis for heavy caching.
* **Inventory Service**: Strictly manages stock levels. Implements pessimistic locking to prevent race conditions during concurrent checkouts.
* **Cart Service**: Maintains temporary shopping cart states before they are converted into orders.
* **Order Service**: Coordinates the checkout flow. Validates carts, calculates totals, communicates with the Inventory service to commit stock, and interfaces with VNPay to generate payment URLs and verify IPN callbacks.

## Technology Stack

**Frontend:**
* React 18
* Vite
* React Router DOM
* Redux Toolkit (State Management)
* Axios (HTTP Client with Interceptors)
* CSS Modules & Responsive Design

**Backend:**
* Go / Chi Router (API Gateway)
* Python / FastAPI (Microservices)
* SQLModel & SQLAlchemy
* Alembic (Database Migrations)

**Database & Cache:**
* PostgreSQL (Database-per-service pattern)
* Redis (In-memory caching for Product Service)

**DevOps & Deployment:**
* Docker & Docker Compose
* Nginx (Static serving & client-side routing)
* Cloudflare (DNS, CDN, HTTPS, DDoS Protection)

**Payment Integration:**
* VNPay Sandbox API

## Project Structure

```text
20252_IT4409/
├── frontend/                 # React SPA Client
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages (Home, Admin, Checkout, etc.)
│   │   ├── services/api/     # Axios API integrations
│   │   ├── store/            # Redux slices (Auth, Cart)
│   │   └── utils/            # Helper functions
│   ├── Dockerfile            # Multi-stage Docker build
│   └── nginx.conf            # Nginx routing configuration
├── backend/                  # Microservices Ecosystem
│   ├── api-gateway/          # Go-based Reverse Proxy
│   ├── user-fastapi/         # User & Auth Service
│   ├── product-fastapi/      # Product Catalog Service
│   ├── inventory-fastapi/    # Stock Management Service
│   ├── cart-fastapi/         # Cart State Service
│   ├── order-fastapi/        # Order & Payment Service
│   └── email-fastapi/        # Notification Service
├── docker-compose.yml        # Infrastructure orchestration
└── README.md
```

## Database Design

The application follows the **Database-per-service** microservices pattern to ensure loose coupling and high fault tolerance. 
* **Product Database**: Stores products, categories, reviews, and a `TSVECTOR` column for advanced PostgreSQL Full-Text Search.
* **User Database**: Stores user credentials, hashed passwords (Bcrypt), profiles, and roles.
* **Order Database**: Stores order records, order items, shipping details, and VNPay transaction statuses.
* **Inventory Database**: Stores available stock, reserved stock, and transaction logs.
* **Cart Database**: Stores active user shopping sessions and cart items.

## API Architecture

**Flow:** `Frontend` → `API Gateway (Port 8080)` → `Internal Service (Port 800X)`
**Benefits of the API Gateway:**
* **Security**: Hides internal microservice IP addresses and ports from the public internet.
* **Centralized Entry Point**: The frontend only needs to communicate with one domain URL instead of keeping track of 5 different service endpoints.
* **CORS & Routing**: Handles all Cross-Origin Resource Sharing logic centrally and transparently strips `/v1` prefixes before routing downstream.

## Authentication

Authentication is fully stateless, powered by **JSON Web Tokens (JWT)**.
1. The user submits credentials via the Frontend.
2. The request passes through the Gateway to the **User Service**.
3. The User Service verifies the Bcrypt password hash and signs a JWT.
4. The JWT is returned to the Frontend and stored locally.
5. The Frontend's **Axios Interceptor** automatically injects `Authorization: Bearer <token>` into the header of all subsequent API requests.

## Payment Flow

Integrated seamlessly with **VNPay**.
1. User clicks "Checkout" → Frontend calls POST `/orders`.
2. **Order Service** creates a `PENDING` order, calculates the total, hashes the payload with `VNPAY_HASH_SECRET`, and returns a secure VNPay URL.
3. The Frontend redirects the user to the VNPay Sandbox.
4. User pays. VNPay redirects back to the frontend with URL parameters.
5. In parallel, VNPay fires a server-to-server **IPN Webhook** to the Order Service.
6. The Order Service verifies the checksum hash. If valid, the order status is promoted to `PAID` and inventory is permanently committed.

## Deployment

The platform is containerized and production-ready.
* **Docker Containers**: Every microservice, including the frontend, runs in its own isolated Alpine-based container.
* **Docker Network**: Services communicate via a dedicated isolated Docker bridge network. Internal services (PostgreSQL, Redis, FastAPIs) are **not** exposed to the host machine's public ports, securing them from external probing.
* **Reverse Proxy**: Nginx serves the compiled static React files and routes API calls to the Gateway.
* **Domain & HTTPS**: Cloudflare manages the `techlap.id.vn` domain DNS, providing an Edge SSL/TLS certificate, DDoS protection, and global CDN caching.

## Installation

### Prerequisites
* Docker
* Docker Compose v2

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/shiromin639/20252_IT4409.git
   cd 20252_IT4409
   ```

2. Create a `.env` file in the root directory (Refer to the Environment Variables section below).

3. Build and spin up all containers in detached mode:
   ```bash
   docker compose up -d --build
   ```

4. The application will be available at:
   - Frontend: `http://localhost:80`
   - API Gateway: `http://localhost:8080`

## Environment Variables

Create a `.env` file in the root directory with the following keys. **Never commit your actual `.env` file to version control.**

```env
# Database Config
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=ecommerce

# Application Secrets
SECRET_KEY=your_jwt_secret_key

# Cloudinary Integration (Product Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# VNPay Integration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost/payment/vnpay/return

# Frontend Config
VITE_API_URL=http://localhost:8080/v1
```

## Running the Project

### Development Mode
You can run the frontend locally outside of Docker for Hot-Module Replacement (HMR) while keeping the backend services in Docker:
```bash
# Keep backends running
docker compose up -d postgres redis api-gateway user-service product-service inventory-service cart-service order-service

# Run frontend locally
cd frontend
npm install
npm run dev
```

### Production Mode
For production, the `docker-compose.yml` uses multi-stage builds to compile the React code into static assets served by Nginx. Simply run the standard Docker Compose up command.

## Screenshots

*(Placeholders for project screenshots)*

### Home Page
![Home Page](https://via.placeholder.com/800x450?text=Home+Page+Screenshot)

### Product Detail
![Product Detail](https://via.placeholder.com/800x450?text=Product+Detail+Screenshot)

### Cart
![Cart](https://via.placeholder.com/800x450?text=Shopping+Cart+Screenshot)

### Checkout & VNPay
![Checkout](https://via.placeholder.com/800x450?text=Checkout+Process+Screenshot)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x450?text=Admin+Dashboard+Screenshot)

## Future Improvements

* **Message Broker Integration**: Replace synchronous HTTP calls between microservices (e.g., Order to Inventory) with an asynchronous message queue (RabbitMQ or Kafka) to implement robust Saga patterns.
* **Elasticsearch**: Migrate product search from PostgreSQL Full-Text Search to Elasticsearch for typo-tolerance and complex faceted aggregations.
* **Server-Side Rendering (SSR)**: Migrate the React SPA to Next.js to significantly improve SEO and Time-to-First-Byte (TTFB) for the storefront.

## Contributors

* Do The Long - Full Stack & Architecture implementation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
