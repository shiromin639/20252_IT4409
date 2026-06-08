# Integration Analysis

This document provides a comprehensive analysis of the existing ecommerce monorepo, detailing the current architecture, detecting mismatches, and providing a recommended integration strategy.

## 1. Architecture Overview
- **Frontend Framework**: React (built with Vite), utilizing React Router for navigation and Redux Toolkit for state management.
- **Backend API Gateway**: Go using `go-chi/chi`, serving as a reverse proxy on port 8080 and routing `/v1/*` requests to individual microservices.
- **Backend Microservices**: Python with FastAPI (user-fastapi, product-fastapi, order-fastapi, cart-fastapi, inventory-fastapi).
- **Database**: PostgreSQL
- **ORM**: SQLModel (Async SQLAlchemy)
- **Auth Mechanism**: JWT (JSON Web Tokens) with `OAuth2PasswordBearer`, and password hashing using `bcrypt` (via `passlib`).

---

## 2. Frontend Routes
The frontend currently implements the following React Router routes:
- `/` - Home Page
- `/products` - Products List Page
- `/products/:id` - Product Detail Page
- `/cart` - Shopping Cart Page
- `/login` / `/register` - Authentication Pages
- `/checkout` - Checkout Page (Protected)
- `/profile` - User Profile Page (Protected)
- `/admin/*` - Admin Dashboard (Protected, Admin Only)

## 3. Backend Routes
The API Gateway routes traffic via the `/v1` prefix to underlying FastAPI microservices:
- **Product Service** (Port 8001):
  - `POST /products/upload`
  - `POST /products`, `GET /products`, `GET /products/{id}`, `PUT /products/{id}`, `DELETE /products/{id}`
  - `GET /brands`
  - `GET /categories/{category_id}/products`
- **Inventory Service** (Port 8002):
  - `/inventory`
- **Cart Service** (Port 8003):
  - `/carts`
- **Order Service** (Port 8004):
  - `POST /orders`, `GET /orders`, `GET /orders/{id}`, `PUT /orders/{id}`, `DELETE /orders/{id}`
  - `GET /orders/user/{user_id}`
  - `GET /orders/{order_id}/items`
- **User/Auth Service** (Port 8005):
  - `POST /login/access-token`, `POST /login/refresh`
  - `GET /profile`
  - `POST /users`, `GET /users`, etc.

## 4. Auth Flow Analysis
**Current Frontend Implementation:**
- Hardcoded mock logic in `services/api.js`. 
- Returns `{ user: {...}, token: "mock-token-..." }` on valid credentials.
- Saves token and user info to `localStorage`.

**Actual Backend Implementation:**
- Expects an `OAuth2PasswordRequestForm` (Form data, not JSON) with `username` and `password`.
- Returns `{ "access_token": "...", "refresh_token": "...", "token_type": "bearer" }`.
- Requires sending `Authorization: Bearer <token>` for protected routes like `/profile`.

**Mismatch**: The frontend expects a JSON payload for login and expects the user object to be returned alongside the token, whereas the backend uses `application/x-www-form-urlencoded` and only returns tokens (requiring a subsequent `GET /profile` to fetch user details).

## 5. API Response Structures (Mismatches detected)
- **Products**: 
  - Frontend expects an array of laptops directly `[ { id, name, price, specs: {...} } ]`.
  - Backend returns a paginated model: `{"data": [...], "count": 100}`.
  - Backend schema uses `specifications` (JSONB) instead of `specs`.
- **Cart**:
  - Frontend state uses `localStorage` entirely, with no API calls being made to sync.
  - Backend has a Cart Service, but it's completely disconnected.
- **Orders**:
  - Frontend mocks order creation: `return { id: 'ORD-' + Date.now(), ...orderData, status: 'pending' }`.
  - Backend validates the price securely by doing internal HTTP requests to the Product Service and returns an `OrderPublic` model.

## 6. Incorrect Frontend Assumptions & Hardcoded Data
- **Base URL**: The frontend is trying to use `http://localhost:3001/api` via `VITE_API_URL`, but the actual Go API Gateway is listening on `http://localhost:8080/v1`.
- **Mock Data**: `services/api.js` completely overrides `axios` by returning hardcoded variables `laptops`, `usedLaptops`, and `mockOrders` from `data/laptops.js` combined with `delay(ms)` logic.
- **Filtering Logic**: Filtering, searching, and sorting are all implemented client-side in the mock `productService.getAll`. The backend is built to handle these via query parameters (`q`, `category_id`, `brand`, `min_price`, `max_price`, `sort_by`).

## 7. Database Schema Summary (Inferred from Models)
- **User**: `id`, `username`, `email`, `hashed_password`, `is_active`, `is_superuser`, `role`
- **Product**: `id`, `name`, `description`, `price`, `category_id`, `specifications` (JSONB), `created_at`
- **Category**: `id`, `name`
- **Order**: `id`, `user_id`, `shipping_address`, `total_amount`, `created_at`
- **OrderItem**: `id`, `order_id`, `product_id`, `quantity`, `unit_price`

## 8. Missing Endpoints & Duplicated Logic
- **Cart Syncing**: Missing frontend implementation to sync the Redux cart with the backend `/carts` endpoints.
- **Duplicated Logic**: The frontend is calculating sorting and filtering client-side, while the backend API already natively supports filtering via SQLAlchemy.

## 9. Recommended Integration Strategy
1. **Update API Base URL**: Change `VITE_API_URL` to `http://localhost:8080/v1` in the frontend `.env` file or `api.js`.
2. **Remove Mock Data**: Delete `frontend/src/data/laptops.js` and strip out the `delay()` mock logic in `services/api.js`. Use the actual `axios` instance for all service calls.
3. **Refactor Auth**: 
   - Modify the frontend `authService.login` to send `URLSearchParams` (form-data) with `username` instead of `email`.
   - After a successful login, use the `access_token` to make a follow-up request to `/profile` to retrieve and store the user data.
4. **Refactor Product Fetching**:
   - Update `productService.getAll` to map frontend filter states into Axios `params`.
   - Update the UI to extract `response.data` since the backend wraps items in `{ data: [], count: n }`.
5. **Connect Cart & Orders**:
   - Instead of purely local storage, connect `cartSlice.js` to dispatch async thunks to the `cart-fastapi` endpoints.
   - Update `orderService.create` to send a POST request to `/v1/orders`.
