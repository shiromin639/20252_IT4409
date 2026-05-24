// This file defines the TypeScript interfaces for the API schemas.
// Even though the project uses JSX, providing these types helps with IDE autocompletion (JSDoc) and future TS migration.

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  is_active: boolean;
  is_superuser: boolean;
  role?: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ProductSpecifications {
  brand?: string;
  ram?: string;
  storage?: string;
  cpu?: string;
  gpu?: string;
  screen?: string;
  [key: string]: any;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  specifications: ProductSpecifications;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: string | number;
  shipping_address: string;
  total_amount: number;
  created_at: string;
  status?: string;
}

export interface OrderCreate {
  user_id: string | number;
  shipping_address: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}
