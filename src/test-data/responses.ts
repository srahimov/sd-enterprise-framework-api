import { HTTP }     from '@constants/statusCodes';
import { MESSAGES } from '@constants/messages';

// ─── Expected Response Bodies ─────────────────────────────────────────────────
// Exact response shapes returned by automationexercise.com
// Used in contract tests and response helper assertions

export const EXPECTED_RESPONSES = {

  // ─── Auth Responses ──────────────────────────────────────────────────────
  AUTH: {
    // API 7 — valid login
    VERIFY_LOGIN_SUCCESS: {
      responseCode: HTTP.OK,
      message:      MESSAGES.AUTH.USER_EXISTS,
    },

    // API 10 — invalid credentials
    VERIFY_LOGIN_NOT_FOUND: {
      responseCode: HTTP.NOT_FOUND,
      message:      MESSAGES.AUTH.USER_NOT_FOUND,
    },

    // API 8 — missing email or password
    VERIFY_LOGIN_BAD_REQUEST: {
      responseCode: HTTP.BAD_REQUEST,
      message:      MESSAGES.ERRORS.MISSING_EMAIL_OR_PASSWORD,
    },

    // API 9 — DELETE method not allowed
    VERIFY_LOGIN_METHOD_NOT_ALLOWED: {
      responseCode: HTTP.METHOD_NOT_ALLOWED,
      message:      MESSAGES.ERRORS.METHOD_NOT_SUPPORTED,
    },
  },

  // ─── User Responses ───────────────────────────────────────────────────────
  USER: {
    // API 11 — create account
    CREATE_SUCCESS: {
      responseCode: HTTP.CREATED,
      message:      MESSAGES.USER.CREATED,
    },

    // API 13 — update account
    UPDATE_SUCCESS: {
      responseCode: HTTP.OK,
      message:      MESSAGES.USER.UPDATED,
    },

    // API 12 — delete account
    DELETE_SUCCESS: {
      responseCode: HTTP.OK,
      message:      MESSAGES.USER.DELETED,
    },
  },

  // ─── Product Responses ────────────────────────────────────────────────────
  PRODUCTS: {
    // API 2 — POST to products list
    METHOD_NOT_ALLOWED: {
      responseCode: HTTP.METHOD_NOT_ALLOWED,
      message:      MESSAGES.ERRORS.METHOD_NOT_SUPPORTED,
    },
  },

  // ─── Brand Responses ──────────────────────────────────────────────────────
  BRANDS: {
    // API 4 — PUT to brands list
    METHOD_NOT_ALLOWED: {
      responseCode: HTTP.METHOD_NOT_ALLOWED,
      message:      MESSAGES.ERRORS.METHOD_NOT_SUPPORTED,
    },
  },

  // ─── Search Responses ─────────────────────────────────────────────────────
  SEARCH: {
    // API 6 — missing search_product param
    MISSING_PARAM: {
      responseCode: HTTP.BAD_REQUEST,
      message:      MESSAGES.ERRORS.MISSING_SEARCH_PARAM,
    },
  },
} as const;

// ─── Expected HTTP Status Codes per Endpoint ──────────────────────────────────
// Quick reference map — endpoint + method → expected HTTP status
export const EXPECTED_STATUS_CODES = {
  'GET  /api/productsList':              HTTP.OK,
  'POST /api/productsList':              HTTP.METHOD_NOT_ALLOWED,
  'GET  /api/brandsList':                HTTP.OK,
  'PUT  /api/brandsList':                HTTP.METHOD_NOT_ALLOWED,
  'POST /api/searchProduct':             HTTP.OK,
  'POST /api/searchProduct (no param)':  HTTP.BAD_REQUEST,
  'POST /api/verifyLogin (valid)':       HTTP.OK,
  'POST /api/verifyLogin (invalid)':     HTTP.NOT_FOUND,
  'POST /api/verifyLogin (missing)':     HTTP.BAD_REQUEST,
  'DELETE /api/verifyLogin':             HTTP.METHOD_NOT_ALLOWED,
  'POST /api/createAccount':             HTTP.CREATED,
  'DELETE /api/deleteAccount':           HTTP.OK,
  'PUT /api/updateAccount':              HTTP.OK,
  'GET  /api/getUserDetailByEmail':      HTTP.OK,
} as const;

// ─── Minimum Expected Field Counts ────────────────────────────────────────────
// Used in contract tests to verify list responses have data
export const EXPECTED_MINIMUMS = {
  PRODUCTS_COUNT: 1,    // At least 1 product must exist
  BRANDS_COUNT:   1,    // At least 1 brand must exist
  SEARCH_RESULTS: 0,    // Search can return 0 results — still valid
} as const;

// ─── Expected User Detail Fields ──────────────────────────────────────────────
// All fields that must be present in a GET user response
export const EXPECTED_USER_FIELDS = [
  'id',
  'name',
  'email',
  'title',
  'birth_day',
  'birth_month',
  'birth_year',
  'first_name',
  'last_name',
  'company',
  'address1',
  'address2',
  'country',
  'zipcode',
  'state',
  'city',
  'mobile_number',
] as const;

// ─── Expected Product Fields ──────────────────────────────────────────────────
export const EXPECTED_PRODUCT_FIELDS = [
  'id',
  'name',
  'price',
  'brand',
  'category',
] as const;

// ─── Expected Brand Fields ────────────────────────────────────────────────────
export const EXPECTED_BRAND_FIELDS = [
  'id',
  'brand',
] as const;
