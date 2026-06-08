# Complete API Contract (Frontend ↔ Backend)

This document defines the contract for communication between the React frontend and the Go/FastAPI backend.
**Base URL:** `http://localhost:8080/v1`

## General Rules
1. **Authentication:** All protected routes require an `Authorization` header containing a valid JWT access token: `Bearer <token>`.
2. **Pagination:** Endpoints returning lists are paginated and return the following schema unless specified otherwise:
   ```json
   {
     "data": [ { ... item 1 ... }, { ... item 2 ... } ],
     "count": 100
   }
   ```
3. **Error Format:** Unsuccessful requests return a 4xx or 5xx status code with a JSON payload:
   ```json
   {
     "detail": "Error message description"
   }
   ```

---

## 1. Authentication APIs

### 1.1 Login
- **Endpoint**: `/login/access-token`
- **Method**: `POST`
- **Auth**: Public
- **Content-Type**: `application/x-www-form-urlencoded`
- **Request Body**:
  - `username` (string): The user's username/email
  - `password` (string): The user's password
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhb...",
    "refresh_token": "eyJhb...",
    "token_type": "bearer"
  }
  ```

### 1.2 Register
- **Endpoint**: `/register`
- **Method**: `POST`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword",
    "full_name": "John Doe"
  }
  ```
- **Response** (200 OK): `UserPublic`

---

## 2. User APIs

### 2.1 Get Current User Profile
- **Endpoint**: `/profile`
- **Method**: `GET`
- **Auth**: Required
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "is_active": true,
    "is_superuser": false,
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  }
  ```

---

## 3. Product APIs

### 3.1 Get All Products
- **Endpoint**: `/products`
- **Method**: `GET`
- **Auth**: Public
- **Query Params**:
  - `skip` (int) - Default: 0
  - `limit` (int) - Default: 100
  - `q` (string) - Search query
  - `category_id` (int) - Filter by category
  - `brand` (string) - Filter by brand
  - `min_price` (float) - Filter by min price
  - `max_price` (float) - Filter by max price
  - `sort_by` (string) - "price_asc", "price_desc", "newest"
- **Response** (200 OK): Paginated `ProductPublic`

### 3.2 Get Product by ID
- **Endpoint**: `/products/{product_id}`
- **Method**: `GET`
- **Auth**: Public
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "name": "MacBook Pro M3",
    "description": "Latest Apple laptop",
    "price": 1999.99,
    "category_id": 1,
    "specifications": {
      "brand": "Apple",
      "ram": "16GB",
      "storage": "512GB SSD"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
  ```

### 3.3 Get Brands
- **Endpoint**: `/brands`
- **Method**: `GET`
- **Auth**: Public
- **Response** (200 OK):
  ```json
  ["Apple", "Dell", "HP", "Lenovo"]
  ```

---

## 4. Category APIs

### 4.1 Get Products by Category
- **Endpoint**: `/categories/{category_id}/products`
- **Method**: `GET`
- **Auth**: Public
- **Query Params**: `skip`, `limit`
- **Response** (200 OK): Paginated `ProductPublic`

---

## 5. Cart APIs

### 5.1 Get User Cart
- **Endpoint**: `/carts/{user_id}`
- **Method**: `GET`
- **Auth**: Required
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "user_id": "1",
    "created_at": "2024-01-01T00:00:00Z"
  }
  ```

### 5.2 Get Cart Items
- **Endpoint**: `/carts/{user_id}/items`
- **Method**: `GET`
- **Auth**: Required
- **Response** (200 OK): Array of `CartItemPublic`
  ```json
  [
    {
      "id": 1,
      "cart_id": 1,
      "product_id": 5,
      "quantity": 2
    }
  ]
  ```

### 5.3 Add Item to Cart
- **Endpoint**: `/carts/{user_id}/items`
- **Method**: `POST`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "product_id": 5,
    "quantity": 1
  }
  ```
- **Response** (200 OK): `CartItemPublic`

### 5.4 Update Cart Item Quantity
- **Endpoint**: `/carts/{user_id}/items/{product_id}`
- **Method**: `PUT`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response** (200 OK): `CartItemPublic`

### 5.5 Remove Item from Cart
- **Endpoint**: `/carts/{user_id}/items/{product_id}`
- **Method**: `DELETE`
- **Auth**: Required
- **Response** (200 OK): `{"message": "Item removed from cart"}`

### 5.6 Clear Cart
- **Endpoint**: `/carts/{user_id}`
- **Method**: `DELETE`
- **Auth**: Required
- **Response** (200 OK): `{"message": "Cart cleared"}`

---

## 6. Order APIs

### 6.1 Create Order
- **Endpoint**: `/orders`
- **Method**: `POST`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "user_id": "1",
    "shipping_address": "123 Main St, City, Country",
    "items": [
      {
        "product_id": 5,
        "quantity": 2
      }
    ]
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1001,
    "user_id": "1",
    "shipping_address": "123 Main St, City, Country",
    "total_amount": 3999.98,
    "created_at": "2024-01-01T00:00:00Z"
  }
  ```

### 6.2 Get User Orders
- **Endpoint**: `/orders/user/{user_id}`
- **Method**: `GET`
- **Auth**: Required
- **Query Params**: `skip`, `limit`
- **Response** (200 OK): Paginated `OrderPublic`

### 6.3 Get Order Items
- **Endpoint**: `/orders/{order_id}/items`
- **Method**: `GET`
- **Auth**: Required
- **Response** (200 OK): Array of `OrderItemPublic`
  ```json
  [
    {
      "id": 1,
      "order_id": 1001,
      "product_id": 5,
      "quantity": 2,
      "unit_price": 1999.99
    }
  ]
  ```

---

## 7. Review APIs
*(Currently Not Implemented in Backend)*
- Needs an endpoint to submit a review (`POST /reviews`).
- Needs an endpoint to fetch reviews for a product (`GET /products/{id}/reviews`).

---

## 8. Admin APIs

### 8.1 Get All Users (Admin)
- **Endpoint**: `/users/` (Note: routed via `/v1/users`)
- **Method**: `GET`
- **Auth**: Required (Superuser only)
- **Response** (200 OK): Paginated `UserPublic`

### 8.2 Change User Role (Admin)
- **Endpoint**: `/users/{user_id}/role`
- **Method**: `PUT`
- **Auth**: Required (Superuser only)
- **Query Params**: `is_superuser` (bool)
- **Response** (200 OK): `UserPublic`

### 8.3 Manage Products (Admin)
- **Create Product**: `POST /products`
- **Update Product**: `PUT /products/{product_id}`
- **Delete Product**: `DELETE /products/{product_id}`
- **Upload Image**: `POST /products/upload` (Returns `{"url": "..."}`)

### 8.4 Manage Orders (Admin)
- **Get All Orders**: `GET /orders`
- **Update Order**: `PUT /orders/{order_id}`
- **Delete Order**: `DELETE /orders/{order_id}`
