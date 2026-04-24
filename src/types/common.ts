// ─── common.ts ────────────────────────────────────────────────────────────────
// Shared generic types used across all domains
// Every client, service, and test imports from here

// ─── Core API Response Wrapper ────────────────────────────────────────────────
// Wraps every raw Playwright APIResponse with parsed body and metadata
export interface ApiResponse<T = unknown> {
  status:   number;
  headers:  Record<string, string>;
  body:     T;
  raw:      unknown;         // Raw Playwright APIResponse object
  duration: number;          // Request duration in ms
  url:      string;          // Full request URL
}

// ─── automationexercise.com specific response shape ──────────────────────────
// ALL write endpoints return this exact shape in the body:
// { "responseCode": 200, "message": "User exists!" }
// Both fields must be asserted in tests
export interface AutomationExerciseResponse {
  responseCode: number;
  message:      string;
}

// ─── List Response ────────────────────────────────────────────────────────────
// Shape returned by GET /api/productsList and GET /api/brandsList
export interface ListResponse<T> {
  responseCode: number;
  [key: string]: T[] | number;  // e.g. { responseCode: 200, products: [...] }
}

// ─── Paginated Response ───────────────────────────────────────────────────────
// For future pagination support
export interface PaginatedResponse<T> {
  data:        T[];
  total:       number;
  page:        number;
  perPage:     number;
  totalPages:  number;
}

// ─── Request Options ──────────────────────────────────────────────────────────
// Passed to every BaseApiClient method
// Controls headers, timeout, and body format per request
export interface RequestOptions {
  headers?:     Record<string, string>;
  timeout?:     number;
  params?:      Record<string, string | number | boolean>;
  formData?:    Record<string, string | number | boolean>;
  data?:        unknown;
  failOnError?: boolean;   // Override global throwOnFailure per request
}

// ─── API Error ────────────────────────────────────────────────────────────────
// Shape of error responses from the API
export interface ApiError {
  responseCode: number;
  message:      string;
  details?:     string[];
  timestamp?:   string;
}

// ─── Utility Types ────────────────────────────────────────────────────────────

// Makes specific keys required, rest optional
// Usage: RequireOnly<User, 'email' | 'password'>
export type RequireOnly<T, K extends keyof T> =
  Required<Pick<T, K>> & Partial<Omit<T, K>>;

// Makes specific keys optional, rest required
// Usage: Optional<CreateUserRequest, 'company' | 'address2'>
export type Optional<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;

// Deep partial — makes all nested properties optional
// Usage: DeepPartial<User> for partial update payloads
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Readonly deep — prevents mutation of response objects in tests
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Extract array item type
// Usage: ArrayItem<Product[]> → Product
export type ArrayItem<T extends unknown[]> = T extends (infer U)[] ? U : never;

// ─── HTTP Method type ─────────────────────────────────────────────────────────
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ─── Log Level type ───────────────────────────────────────────────────────────
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ─── Environment type ─────────────────────────────────────────────────────────
export type Environment = 'local' | 'qa' | 'staging';
