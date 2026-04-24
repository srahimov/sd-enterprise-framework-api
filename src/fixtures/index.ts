import { expect } from '@playwright/test';
import { apiFixture } from './apiFixture';

// ─── Primary Test Object ──────────────────────────────────────────────────────
// Import { test, expect } from '@fixtures' in ALL spec files
// This is the fully extended test with all fixtures attached:
//   - auth           → AuthFixtureContext (credentials + state + helpers)
//   - credentials    → StoredCredentials
//   - authService    → AuthService instance
//   - userService    → UserService instance
//   - productService → ProductService instance
//   - apiRequest     → raw APIRequestContext
export const test = apiFixture;

// ─── Expect ───────────────────────────────────────────────────────────────────
// Re-export Playwright expect — tests use this instead of importing from @playwright/test
export { expect };

// ─── Response Helpers ─────────────────────────────────────────────────────────
// Re-export all assertion helpers — one import covers everything
export {
  parseBody,
  assertStatus,
  assertSuccess,
  assertCreated,
  assertUpdated,
  assertDeleted,
  assertMethodNotAllowed,
  assertBadRequest,
  assertNotFound,
  assertUserExists,
  assertHasProducts,
  assertHasBrands,
  assertResponseTime,
  assertHeaders,
} from '@helpers/responseHelper';

// ─── Schema Validator ─────────────────────────────────────────────────────────
export {
  validateSchema,
  assertSchema,
  isValidSchema,
} from '@utils/schemaValidator';

// ─── Test Data ────────────────────────────────────────────────────────────────
export {
  EXISTING_USER,
  INVALID_USER,
  WRONG_PASSWORD_USER,
  MISSING_EMAIL_USER,
  MISSING_PASSWORD_USER,
  VALID_SEARCH_TERMS,
  EMPTY_RESULT_SEARCH_TERMS,
} from '@test-data/users';

export {
  createUserPayload,
  createRandomUserPayload,
  updateUserPayload,
  deleteUserPayload,
  searchPayload,
  searchTopPayload,
  searchTshirtPayload,
  missingEmailPayload,
  missingPasswordPayload,
  missingSearchParamPayload,
} from '@test-data/payloads';

export {
  EXPECTED_RESPONSES,
  EXPECTED_STATUS_CODES,
  EXPECTED_USER_FIELDS,
  EXPECTED_PRODUCT_FIELDS,
  EXPECTED_BRAND_FIELDS,
} from '@test-data/responses';

// ─── Schemas ──────────────────────────────────────────────────────────────────
export {
  GetUserResponseSchema,
  UserMutationResponseSchema,
  CreateUserRequestSchema,
} from '@schemas/user.schema';

export {
  ProductsListResponseSchema,
  SearchResponseSchema,
  ProductSchema,
} from '@schemas/product.schema';

export {
  BrandsListResponseSchema,
  BrandSchema,
} from '@schemas/brand.schema';

export {
  MethodNotAllowedSchema,
  MissingSearchParamSchema,
  MissingEmailOrPasswordSchema,
  UserNotFoundSchema,
  BaseErrorSchema,
} from '@schemas/error.schema';

// ─── Constants ────────────────────────────────────────────────────────────────
export { HTTP }      from '@constants/statusCodes';
export { MESSAGES }  from '@constants/messages';
export { ENDPOINTS } from '@constants/endpoints';
