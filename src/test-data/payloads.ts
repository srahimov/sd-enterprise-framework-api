import { CreateUserRequest, UpdateUserRequest, DeleteUserRequest } from '@appTypes/user';
import { LoginRequest }  from '@appTypes/auth';
import { SearchRequest } from '@appTypes/product';
import {
  generateUser,
  randomEmail,
  randomPassword,
  randomSearchTerm,
} from '@utils/random';
import { BASE_NEW_USER } from './users';

// ─── Auth Payloads ────────────────────────────────────────────────────────────

// Valid login payload — uses generated credentials
// Override with specific values for targeted tests
export const validLoginPayload = (
  overrides?: Partial<LoginRequest>
): LoginRequest => ({
  email:    randomEmail(),
  password: randomPassword(),
  ...overrides,
});

// ─── User Create Payloads ─────────────────────────────────────────────────────

// Complete valid create user payload — unique email every call
// Usage: createUserPayload()                          → full random user
//        createUserPayload({ title: 'Mrs' })          → random user, forced title
//        createUserPayload({ email: 'x@test.com' })   → specific email
export const createUserPayload = (
  overrides?: Partial<CreateUserRequest>
): CreateUserRequest => ({
  ...BASE_NEW_USER,
  email: randomEmail(),   // Always unique — prevents 409 conflicts
  ...overrides,
});

// Full random user — every field randomized
export const createRandomUserPayload = (
  overrides?: Partial<CreateUserRequest>
): CreateUserRequest => generateUser(overrides);

// ─── User Update Payloads ─────────────────────────────────────────────────────

// Valid update payload — must include email + password of existing account
export const updateUserPayload = (
  email:    string,
  password: string,
  overrides?: Partial<UpdateUserRequest>
): UpdateUserRequest => ({
  ...BASE_NEW_USER,
  email,
  password,
  name:      'Updated Test User',
  firstname: 'Updated',
  lastname:  'User',
  company:   'Updated Company Ltd',
  address1:  '456 Updated Street',
  city:      'Los Angeles',
  state:     'California',
  zipcode:   '90001',
  ...overrides,
});

// ─── User Delete Payloads ─────────────────────────────────────────────────────

export const deleteUserPayload = (
  email:    string,
  password: string
): DeleteUserRequest => ({ email, password });

// ─── Search Payloads ──────────────────────────────────────────────────────────

// Valid search payload with known term
export const searchPayload = (
  term?: string
): SearchRequest => ({
  search_product: term ?? randomSearchTerm(),
});

// Specific search terms
export const searchTopPayload:    SearchRequest = { search_product: 'top'    };
export const searchTshirtPayload: SearchRequest = { search_product: 'tshirt' };
export const searchJeanPayload:   SearchRequest = { search_product: 'jean'   };
export const searchDressPayload:  SearchRequest = { search_product: 'dress'  };

// ─── Invalid Payloads ─────────────────────────────────────────────────────────
// Used exclusively in negative tests
// Typed as Record<string, unknown> — intentionally violates type contract

// Missing required fields
export const missingEmailPayload: Record<string, unknown> = {
  password: randomPassword(),
};

export const missingPasswordPayload: Record<string, unknown> = {
  email: randomEmail(),
};

export const emptyLoginPayload: Record<string, unknown> = {
  email:    '',
  password: '',
};

// Missing search_product param — triggers API 6 (400)
export const missingSearchParamPayload: Record<string, unknown> = {};

// Incomplete create user — missing required fields
export const incompleteCreateUserPayload: Record<string, unknown> = {
  name:  'Incomplete User',
  email: randomEmail(),
  // Missing: password, title, birth_date, firstname, lastname etc.
};

// ─── Boundary Value Payloads ──────────────────────────────────────────────────
// Edge cases for field length and format validation

// Max length fields
export const maxLengthNamePayload = (): CreateUserRequest => createUserPayload({
  name:      'A'.repeat(255),
  firstname: 'B'.repeat(255),
  lastname:  'C'.repeat(255),
});

// Special characters in name
export const specialCharNamePayload = (): CreateUserRequest => createUserPayload({
  name:      "O'Brien-Smith Jr.",
  firstname: "O'Brien",
  lastname:  'Smith-Jones',
});

// International characters
export const internationalNamePayload = (): CreateUserRequest => createUserPayload({
  name:      'André García',
  firstname: 'André',
  lastname:  'García',
  country:   'India',
});

// ─── Payload Variations for Contract Tests ────────────────────────────────────

// Minimal valid payload — only truly required fields with minimal values
export const minimalCreateUserPayload = (): CreateUserRequest => createUserPayload({
  company:  '',
  address2: '',
});
