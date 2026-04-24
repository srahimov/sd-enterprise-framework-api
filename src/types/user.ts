import { AutomationExerciseResponse } from './common';

// ─── Title type ───────────────────────────────────────────────────────────────
export type UserTitle = 'Mr' | 'Mrs' | 'Miss' | 'Ms' | 'Dr';

// ─── User Detail ─────────────────────────────────────────────────────────────
// Shape of user object returned inside GET /api/getUserDetailByEmail response
export interface UserDetail {
  id:           number;
  name:         string;
  email:        string;
  title:        UserTitle;
  birth_day:    string;
  birth_month:  string;
  birth_year:   string;
  first_name:   string;
  last_name:    string;
  company:      string;
  address1:     string;
  address2:     string;
  country:      string;
  zipcode:      string;
  state:        string;
  city:         string;
  mobile_number: string;
}

// ─── Get User Response ────────────────────────────────────────────────────────
// GET /api/getUserDetailByEmail?email=x
// Returns: { responseCode: 200, user: { ...UserDetail } }
export interface GetUserResponse {
  responseCode: number;
  user:         UserDetail;
}

// ─── Create User Request ──────────────────────────────────────────────────────
// POST /api/createAccount
// All fields sent as form-encoded data
// API 11 — all fields are required
export interface CreateUserRequest {
  name:          string;
  email:         string;
  password:      string;
  title:         UserTitle;
  birth_date:    string;        // Day: "15"
  birth_month:   string;        // Month: "6"
  birth_year:    string;        // Year: "1990"
  firstname:     string;
  lastname:      string;
  company:       string;
  address1:      string;
  address2:      string;
  country:       string;
  zipcode:       string;
  state:         string;
  city:          string;
  mobile_number: string;
}

// ─── Update User Request ──────────────────────────────────────────────────────
// PUT /api/updateAccount
// Same fields as CreateUserRequest
// email + password identify the account to update
export interface UpdateUserRequest extends CreateUserRequest {}

// ─── Delete User Request ──────────────────────────────────────────────────────
// DELETE /api/deleteAccount
// Only email + password needed
export interface DeleteUserRequest {
  email:    string;
  password: string;
}

// ─── User API Responses ───────────────────────────────────────────────────────
// Shared response shape for create/update/delete operations
export interface UserMutationResponse extends AutomationExerciseResponse {
  responseCode: 200 | 201 | 400 | 404 | 405;
  message:
    | 'User created!'
    | 'User updated!'
    | 'Account deleted!'
    | 'Account not found!'
    | 'This request method is not supported.';
}
