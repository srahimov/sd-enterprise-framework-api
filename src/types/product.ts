import { AutomationExerciseResponse } from './common';

// ─── User Type ────────────────────────────────────────────────────────────────
// Nested inside Category
export interface UserType {
  usertype: string;  // e.g. "Women", "Men", "Kids"
}

// ─── Category ─────────────────────────────────────────────────────────────────
// Nested inside Product
export interface Category {
  usertype: UserType;
  category: string;  // e.g. "Tops", "Tshirts", "Dress"
}

// ─── Product ──────────────────────────────────────────────────────────────────
// Shape of a single product in GET /api/productsList response
export interface Product {
  id:       number;
  name:     string;
  price:    string;   // Returned as string: "Rs. 500" — NOT a number
  brand:    string;
  category: Category;
}

// ─── Products List Response ───────────────────────────────────────────────────
// GET /api/productsList
// { "responseCode": 200, "products": [...] }
export interface ProductsListResponse {
  responseCode: number;
  products:     Product[];
}

// ─── Search Request ───────────────────────────────────────────────────────────
// POST /api/searchProduct
// Sent as form-encoded: search_product=tshirt
export interface SearchRequest {
  search_product: string;  // e.g. "top", "tshirt", "jean"
}

// ─── Search Response ──────────────────────────────────────────────────────────
// POST /api/searchProduct
// { "responseCode": 200, "products": [...] }
export interface SearchResponse {
  responseCode: number;
  products:     Product[];
}

// ─── Method Not Allowed Response ─────────────────────────────────────────────
// POST /api/productsList → 405
export interface MethodNotAllowedResponse extends AutomationExerciseResponse {
  responseCode: 405;
  message:      'This request method is not supported.';
}
