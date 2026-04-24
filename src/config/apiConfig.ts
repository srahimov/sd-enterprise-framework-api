import { ENV } from './env';

// ─── Default Headers ──────────────────────────────────────────────────────────
// automationexercise.com uses form-encoded for most write operations
// JSON headers used for read operations and contract validation
export const DEFAULT_HEADERS = {
  json: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  formData: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept':       'application/json',
  },
} as const;

// ─── Timeout Configuration ────────────────────────────────────────────────────
export const TIMEOUTS = {
  // Global request timeout — sourced from .env per environment
  request:      ENV.apiTimeout,

  // How long to wait for expect() assertions
  assertion:    5000,

  // How long to wait between retries (ms)
  retryDelay:   1000,

  // Extended timeout for slow endpoints (e.g. account creation)
  extended:     ENV.apiTimeout * 2,
} as const;

// ─── Retry Configuration ──────────────────────────────────────────────────────
export const RETRY_CONFIG = {
  // Max number of retry attempts — sourced from .env
  maxRetries: ENV.retryCount,

  // HTTP status codes that are safe to retry
  // 429 = Too Many Requests, 503 = Service Unavailable, 502 = Bad Gateway
  retryableStatusCodes: [429, 502, 503, 504],

  // Delay between retries in ms
  retryDelay: 1000,
} as const;

// ─── API Behavior Config ──────────────────────────────────────────────────────
export const API_CONFIG = {
  baseUrl:        ENV.baseUrl,
  defaultHeaders: DEFAULT_HEADERS,
  timeouts:       TIMEOUTS,
  retry:          RETRY_CONFIG,

  // Whether to log full request/response bodies
  // Always true locally, false in staging to avoid logging PII
  logRequestBody:  ENV.isLocal || ENV.isQA,
  logResponseBody: ENV.isLocal || ENV.isQA,

  // Whether to throw on non-2xx responses or return them for manual handling
  // Set to false so tests can assert on error responses (400, 404, 405 etc.)
  throwOnFailure: false,
} as const;

// ─── Type export ──────────────────────────────────────────────────────────────
export type ApiConfig = typeof API_CONFIG;
