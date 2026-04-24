import { ENV }          from '@config/env';
import { LoginRequest } from '@appTypes/auth';
import { CreateUserRequest } from '@appTypes/user';

// ─── Existing Test Account ────────────────────────────────────────────────────
// This account must exist on the target environment before tests run
// Credentials sourced from .env — change per environment automatically
export const EXISTING_USER: LoginRequest = {
  email:    ENV.testUserEmail,
  password: ENV.testUserPassword,
};

// ─── Invalid Credentials ──────────────────────────────────────────────────────
// Used for API 10 — verifyLogin with invalid credentials → 404
export const INVALID_USER: LoginRequest = {
  email:    'nonexistent.user.xyz123@invalid.com',
  password: 'WrongPassword999!',
};

// ─── Wrong Password — Valid Email Format ─────────────────────────────────────
// Valid email format but wrong password — also returns 404
export const WRONG_PASSWORD_USER: LoginRequest = {
  email:    ENV.testUserEmail,
  password: 'DefinitelyWrongPassword999!',
};

// ─── Missing Email ────────────────────────────────────────────────────────────
// Used for API 8 — verifyLogin missing email → 400
export const MISSING_EMAIL_USER = {
  password: ENV.testUserPassword,
};

// ─── Missing Password ─────────────────────────────────────────────────────────
// Used for negative test — verifyLogin missing password → 400
export const MISSING_PASSWORD_USER = {
  email: ENV.testUserEmail,
};

// ─── Invalid Email Format ─────────────────────────────────────────────────────
// Malformed email — tests API validation
export const INVALID_EMAIL_FORMAT_USER: LoginRequest = {
  email:    'notanemail',
  password: 'Password123!',
};

// ─── Empty Credentials ────────────────────────────────────────────────────────
// Both fields empty
export const EMPTY_CREDENTIALS_USER: LoginRequest = {
  email:    '',
  password: '',
};

// ─── Base New User Template ───────────────────────────────────────────────────
// Static base for create user tests — use generateUser() from random.ts
// for unique dynamic users. This is for tests needing predictable field values.
export const BASE_NEW_USER: Omit<CreateUserRequest, 'email'> = {
  name:          'John Doe Test',
  password:      'TestPass@123',
  title:         'Mr',
  birth_date:    '15',
  birth_month:   '6',
  birth_year:    '1990',
  firstname:     'John',
  lastname:      'Doe',
  company:       'Test Company Ltd',
  address1:      '123 Test Street',
  address2:      'Suite 456',
  country:       'United States',
  zipcode:       '10001',
  state:         'New York',
  city:          'New York',
  mobile_number: '1234567890',
};

// ─── Search Terms ─────────────────────────────────────────────────────────────
// Known search terms that return results on automationexercise.com
export const VALID_SEARCH_TERMS = [
  'top',
  'tshirt',
  'jean',
  'dress',
  'skirt',
] as const;

export type ValidSearchTerm = typeof VALID_SEARCH_TERMS[number];

// ─── Invalid Search Terms ─────────────────────────────────────────────────────
// Terms that return empty results — still valid requests
export const EMPTY_RESULT_SEARCH_TERMS = [
  'xyznonexistentproduct999',
  'aaabbbccc111',
] as const;
