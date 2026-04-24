import { AutomationExerciseResponse } from './common';

// ─── Login Request ────────────────────────────────────────────────────────────
// POST /api/verifyLogin
// Sent as form-encoded: email=x&password=y
export interface LoginRequest {
  email:    string;
  password: string;
}

// ─── Login Response ───────────────────────────────────────────────────────────
// automationexercise.com returns this exact shape
// { "responseCode": 200, "message": "User exists!" }
export interface LoginResponse extends AutomationExerciseResponse {
  responseCode: 200 | 404 | 400 | 405;
  message:
    | 'User exists!'
    | 'User not found!'
    | 'Bad request, email or password parameter is missing in POST request.'
    | 'This request method is not supported.';
}

// ─── Stored Credentials ───────────────────────────────────────────────────────
// Held by authFixture and injected into requests that require credentials
// Since this API uses credential-based auth (not token), we store email+password
export interface StoredCredentials {
  email:    string;
  password: string;
}

// ─── Auth State ───────────────────────────────────────────────────────────────
// Tracks the current authentication state in fixtures
export interface AuthState {
  isAuthenticated: boolean;
  credentials:     StoredCredentials | null;
  verifiedAt:      Date | null;
}

// ─── Auth Fixture Context ────────────────────────────────────────────────────
// What authFixture exposes to tests
export interface AuthFixtureContext {
  credentials:    StoredCredentials;
  authState:      AuthState;
  getFormData:    () => Record<string, string>;  // Returns credentials as form data
}
