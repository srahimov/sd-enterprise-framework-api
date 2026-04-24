import { APIResponse } from '@playwright/test';
import { expect }      from '@playwright/test';
import { HTTP }        from '@constants/statusCodes';
import { MESSAGES }    from '@constants/messages';
import { createLogger } from '@utils/logger';

const logger = createLogger('ResponseHelper');

// ─── Response Body Type ───────────────────────────────────────────────────────
// Uses a loose type so all domain response types are assignable
// Domain types (UserMutationResponse, ProductsListResponse etc.) all satisfy this
export interface ResponseBody {
  responseCode: number;
  message?:     string;
}

// ─── Extended body for list responses ────────────────────────────────────────
export interface ListResponseBody extends ResponseBody {
  products?: unknown[];
  brands?:   unknown[];
}

// ─── Parse Response Body ──────────────────────────────────────────────────────
export const parseBody = async <T = ResponseBody>(
  response: APIResponse
): Promise<T> => {
  try {
    const body = await response.json() as T;
    logger.debug('Response body parsed', { body });
    return body;
  } catch (err) {
    const text = await response.text();
    logger.error('Failed to parse response as JSON', { text, err });
    throw new Error(
      `Failed to parse response body as JSON.\n` +
      `Status: ${response.status()}\n` +
      `Body: ${text}`
    );
  }
};

// ─── Assert HTTP Status ───────────────────────────────────────────────────────
export const assertStatus = (
  response:       APIResponse,
  expectedStatus: number
): void => {
  logger.debug(`Asserting HTTP status: expected ${expectedStatus}, got ${response.status()}`);
  expect(
    response.status(),
    `Expected HTTP status ${expectedStatus} but got ${response.status()} for ${response.url()}`
  ).toBe(expectedStatus);
};

// ─── Assert Success Response ──────────────────────────────────────────────────
export const assertSuccess = (
  response: APIResponse,
  body:     ResponseBody
): void => {
  logger.debug('Asserting success response');
  expect(
    response.status(),
    `Expected HTTP 200 but got ${response.status()}`
  ).toBe(HTTP.OK);
  expect(
    body.responseCode,
    `Expected body.responseCode 200 but got ${body.responseCode}`
  ).toBe(HTTP.OK);
};

// ─── Assert Created Response ──────────────────────────────────────────────────
export const assertCreated = (
  response: APIResponse,
  body:     ResponseBody
): void => {
  logger.debug('Asserting created response');
  expect(
    response.status(),
    `Expected HTTP 201 but got ${response.status()}`
  ).toBe(HTTP.CREATED);
  expect(
    body.responseCode,
    `Expected body.responseCode 201 but got ${body.responseCode}`
  ).toBe(HTTP.CREATED);
  expect(
    body.message,
    `Expected message "${MESSAGES.USER.CREATED}" but got "${body.message}"`
  ).toBe(MESSAGES.USER.CREATED);
};

// ─── Assert Updated Response ──────────────────────────────────────────────────
export const assertUpdated = (
  response: APIResponse,
  body:     ResponseBody
): void => {
  logger.debug('Asserting updated response');
  expect(
    response.status(),
    `Expected HTTP 200 but got ${response.status()}`
  ).toBe(HTTP.OK);
  expect(
    body.responseCode,
    `Expected body.responseCode 200 but got ${body.responseCode}`
  ).toBe(HTTP.OK);
  expect(
    body.message,
    `Expected message "${MESSAGES.USER.UPDATED}" but got "${body.message}"`
  ).toBe(MESSAGES.USER.UPDATED);
};

// ─── Assert Deleted Response ──────────────────────────────────────────────────
export const assertDeleted = (
  response: APIResponse,
  body:     ResponseBody
): void => {
  logger.debug('Asserting deleted response');
  expect(
    response.status(),
    `Expected HTTP 200 but got ${response.status()}`
  ).toBe(HTTP.OK);
  expect(
    body.responseCode,
    `Expected body.responseCode 200 but got ${body.responseCode}`
  ).toBe(HTTP.OK);
  expect(
    body.message,
    `Expected message "${MESSAGES.USER.DELETED}" but got "${body.message}"`
  ).toBe(MESSAGES.USER.DELETED);
};

// ─── Assert Method Not Allowed ────────────────────────────────────────────────
export const assertMethodNotAllowed = (
  response: APIResponse,
  body:     ResponseBody
): void => {
  logger.debug('Asserting method not allowed response');
  expect(
    response.status(),
    `Expected HTTP 405 but got ${response.status()}`
  ).toBe(HTTP.METHOD_NOT_ALLOWED);
  expect(
    body.responseCode,
    `Expected body.responseCode 405 but got ${body.responseCode}`
  ).toBe(HTTP.METHOD_NOT_ALLOWED);
  expect(
    body.message,
    `Expected message "${MESSAGES.ERRORS.METHOD_NOT_SUPPORTED}"`
  ).toBe(MESSAGES.ERRORS.METHOD_NOT_SUPPORTED);
};

// ─── Assert Bad Request ───────────────────────────────────────────────────────
export const assertBadRequest = (
  response:         APIResponse,
  body:             ResponseBody,
  expectedMessage?: string
): void => {
  logger.debug('Asserting bad request response');
  expect(
    response.status(),
    `Expected HTTP 400 but got ${response.status()}`
  ).toBe(HTTP.BAD_REQUEST);
  expect(
    body.responseCode,
    `Expected body.responseCode 400 but got ${body.responseCode}`
  ).toBe(HTTP.BAD_REQUEST);
  if (expectedMessage) {
    expect(
      body.message,
      `Expected message "${expectedMessage}" but got "${body.message}"`
    ).toBe(expectedMessage);
  }
};

// ─── Assert Not Found ─────────────────────────────────────────────────────────
export const assertNotFound = (
  response:         APIResponse,
  body:             ResponseBody,
  expectedMessage?: string
): void => {
  logger.debug('Asserting not found response');
  expect(
    response.status(),
    `Expected HTTP 404 but got ${response.status()}`
  ).toBe(HTTP.NOT_FOUND);
  expect(
    body.responseCode,
    `Expected body.responseCode 404 but got ${body.responseCode}`
  ).toBe(HTTP.NOT_FOUND);
  if (expectedMessage) {
    expect(
      body.message,
      `Expected message "${expectedMessage}" but got "${body.message}"`
    ).toBe(expectedMessage);
  }
};

// ─── Assert User Exists ───────────────────────────────────────────────────────
export const assertUserExists = (
  response: APIResponse,
  body:     ResponseBody
): void => {
  logger.debug('Asserting user exists response');
  expect(
    response.status(),
    `Expected HTTP 200 but got ${response.status()}`
  ).toBe(HTTP.OK);
  expect(
    body.responseCode,
    `Expected body.responseCode 200 but got ${body.responseCode}`
  ).toBe(HTTP.OK);
  expect(
    body.message,
    `Expected message "${MESSAGES.AUTH.USER_EXISTS}" but got "${body.message}"`
  ).toBe(MESSAGES.AUTH.USER_EXISTS);
};

// ─── Assert Has Products ──────────────────────────────────────────────────────
export const assertHasProducts = (
  body: ListResponseBody
): void => {
  logger.debug('Asserting products list response');
  expect(body.responseCode).toBe(HTTP.OK);
  expect(body.products).toBeDefined();
  expect(Array.isArray(body.products)).toBe(true);
  expect(
    (body.products ?? []).length,
    'Expected products array to be non-empty'
  ).toBeGreaterThan(0);
};

// ─── Assert Has Brands ────────────────────────────────────────────────────────
export const assertHasBrands = (
  body: ListResponseBody
): void => {
  logger.debug('Asserting brands list response');
  expect(body.responseCode).toBe(HTTP.OK);
  expect(body.brands).toBeDefined();
  expect(Array.isArray(body.brands)).toBe(true);
  expect(
    (body.brands ?? []).length,
    'Expected brands array to be non-empty'
  ).toBeGreaterThan(0);
};

// ─── Assert Response Time ─────────────────────────────────────────────────────
export const assertResponseTime = (
  durationMs: number,
  maxMs:      number = 5000
): void => {
  logger.debug(`Asserting response time: ${durationMs}ms <= ${maxMs}ms`);
  expect(
    durationMs,
    `Response took ${durationMs}ms — exceeded ${maxMs}ms limit`
  ).toBeLessThanOrEqual(maxMs);
};

// ─── Assert Response Headers ──────────────────────────────────────────────────
export const assertHeaders = (
  response:        APIResponse,
  expectedHeaders: Record<string, string>
): void => {
  for (const [key, value] of Object.entries(expectedHeaders)) {
    const actual = response.headers()[key.toLowerCase()];
    expect(
      actual,
      `Expected header "${key}: ${value}" but got "${actual}"`
    ).toContain(value);
  }
};
