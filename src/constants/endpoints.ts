import { ENV } from '@config/env';

// ─── Endpoint Paths ───────────────────────────────────────────────────────────
// All paths relative to BASE_URL
// Dynamic segments use functions: USERS.BY_EMAIL('test@test.com') → '/api/getUserDetailByEmail?email=test@test.com'

export const ENDPOINTS = {

  // ─── Auth ──────────────────────────────────────────────────────────────────
  // API 7, 8, 9, 10 — verifyLogin
  AUTH: {
    VERIFY_LOGIN: '/api/verifyLogin',
  },

  // ─── Users ─────────────────────────────────────────────────────────────────
  // API 11 — createAccount
  // API 12 — deleteAccount
  // API 13 — updateAccount
  // API 14 — getUserDetailByEmail
  USERS: {
    CREATE:   '/api/createAccount',
    DELETE:   '/api/deleteAccount',
    UPDATE:   '/api/updateAccount',
    BY_EMAIL: (email: string) => `/api/getUserDetailByEmail?email=${encodeURIComponent(email)}`,
  },

  // ─── Products ──────────────────────────────────────────────────────────────
  // API 1 — GET all products
  // API 2 — POST to products (405 — not supported)
  PRODUCTS: {
    LIST: '/api/productsList',
  },

  // ─── Brands ────────────────────────────────────────────────────────────────
  // API 3 — GET all brands
  // API 4 — PUT to brands (405 — not supported)
  BRANDS: {
    LIST: '/api/brandsList',
  },

  // ─── Search ────────────────────────────────────────────────────────────────
  // API 5 — POST search with parameter
  // API 6 — POST search without parameter (400)
  SEARCH: {
    PRODUCT: '/api/searchProduct',
  },

} as const;

// ─── URL Builder ──────────────────────────────────────────────────────────────
// Combines BASE_URL with an endpoint path
// Usage: buildUrl(ENDPOINTS.PRODUCTS.LIST) → 'https://automationexercise.com/api/productsList'
// Usage: buildUrl(ENDPOINTS.USERS.BY_EMAIL('test@test.com'))
export const buildUrl = (path: string): string => {
  return `${ENV.baseUrl}${path}`;
};

// ─── Type export ──────────────────────────────────────────────────────────────
export type EndpointPath = string;
