// ─── HTTP Status Codes ────────────────────────────────────────────────────────
// Named constants for every status code used in the framework
// Grouped by category for readability
// Source: automationexercise.com API responses

export const HTTP = {

  // ─── 2xx Success ───────────────────────────────────────────────────────────
  OK:         200,  // Standard success — GET, PUT, DELETE responses
  CREATED:    201,  // Resource created — POST /api/createAccount
  ACCEPTED:   202,  // Request accepted for processing
  NO_CONTENT: 204,  // Success with no response body

  // ─── 3xx Redirection ───────────────────────────────────────────────────────
  MOVED_PERMANENTLY: 301,
  FOUND:             302,
  NOT_MODIFIED:      304,

  // ─── 4xx Client Errors ─────────────────────────────────────────────────────
  BAD_REQUEST:   400,  // Missing required param — API 6, API 8
  UNAUTHORIZED:  401,  // Authentication required
  FORBIDDEN:     403,  // Authenticated but not authorized
  NOT_FOUND:     404,  // User not found — API 10 (invalid credentials)
  METHOD_NOT_ALLOWED: 405,  // Wrong HTTP method — API 2, 4, 9
  CONFLICT:      409,  // Resource already exists
  GONE:          410,  // Resource permanently deleted
  UNPROCESSABLE: 422,  // Validation error — invalid data format
  TOO_MANY_REQUESTS: 429,  // Rate limit exceeded

  // ─── 5xx Server Errors ─────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY:           502,
  SERVICE_UNAVAILABLE:   503,
  GATEWAY_TIMEOUT:       504,

} as const;

// ─── Status Code Groups ───────────────────────────────────────────────────────
// Useful for assertions like: isSuccess(response.status())
export const STATUS_GROUPS = {
  SUCCESS:      [HTTP.OK, HTTP.CREATED, HTTP.ACCEPTED, HTTP.NO_CONTENT],
  CLIENT_ERROR: [HTTP.BAD_REQUEST, HTTP.UNAUTHORIZED, HTTP.FORBIDDEN, HTTP.NOT_FOUND, HTTP.METHOD_NOT_ALLOWED, HTTP.CONFLICT, HTTP.UNPROCESSABLE],
  SERVER_ERROR: [HTTP.INTERNAL_SERVER_ERROR, HTTP.BAD_GATEWAY, HTTP.SERVICE_UNAVAILABLE, HTTP.GATEWAY_TIMEOUT],
} as const;

// ─── Status Code Helpers ──────────────────────────────────────────────────────
export const isSuccess      = (status: number): boolean => status >= 200 && status < 300;
export const isClientError  = (status: number): boolean => status >= 400 && status < 500;
export const isServerError  = (status: number): boolean => status >= 500 && status < 600;
export const isRetryable    = (status: number): boolean => [429, 502, 503, 504].includes(status);

// ─── Type export ──────────────────────────────────────────────────────────────
export type HttpStatusCode = typeof HTTP[keyof typeof HTTP];
