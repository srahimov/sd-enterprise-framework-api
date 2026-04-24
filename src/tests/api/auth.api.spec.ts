import {
  test,
  expect,
  assertUserExists,
  assertNotFound,
  assertBadRequest,
  assertMethodNotAllowed,
  parseBody,
  EXISTING_USER,
  INVALID_USER,
  WRONG_PASSWORD_USER,
  EXPECTED_RESPONSES,
  HTTP,
  MESSAGES,
} from '@fixtures';

test.describe('Auth API — @auth', () => {

  // ─── API 7: POST /api/verifyLogin — Valid Credentials ─────────────────────
  test.describe('POST /api/verifyLogin — valid credentials', () => {

    test('should return 200 and "User exists!" with valid credentials @smoke @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid(EXISTING_USER);
      const body     = await parseBody(response);

      assertUserExists(response, body);
      expect(body.message).toBe(MESSAGES.AUTH.USER_EXISTS);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.AUTH.VERIFY_LOGIN_SUCCESS.responseCode);
    });

    test('should verify login using test credentials from environment @smoke', async ({ authService }) => {
      const authState = await authService.verifyAndStoreDefault();

      expect(authState.isAuthenticated).toBe(true);
      expect(authState.credentials).not.toBeNull();
      expect(authState.credentials?.email).toBe(EXISTING_USER.email);
      expect(authState.verifiedAt).not.toBeNull();
    });

  });

  // ─── API 10: POST /api/verifyLogin — Invalid Credentials ──────────────────
  test.describe('POST /api/verifyLogin — invalid credentials', () => {

    test('should return 404 and "User not found!" with invalid credentials @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid(INVALID_USER);
      const body     = await parseBody(response);

      assertNotFound(response, body, MESSAGES.AUTH.USER_NOT_FOUND);
      expect(body.responseCode).toBe(HTTP.NOT_FOUND);
      expect(body.message).toBe(EXPECTED_RESPONSES.AUTH.VERIFY_LOGIN_NOT_FOUND.message);
    });

    test('should return 404 with valid email format but wrong password @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid(WRONG_PASSWORD_USER);
      const body     = await parseBody(response);

      assertNotFound(response, body, MESSAGES.AUTH.USER_NOT_FOUND);
    });

    test('should return 404 with non-existent email @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid({
        email:    'completely.nonexistent.xyz999@nowhere.com',
        password: 'AnyPassword123!',
      });
      const body = await parseBody(response);

      expect(response.status()).toBe(HTTP.NOT_FOUND);
      expect(body.responseCode).toBe(HTTP.NOT_FOUND);
    });

  });

  // ─── API 8: POST /api/verifyLogin — Missing Parameters ────────────────────
  test.describe('POST /api/verifyLogin — missing parameters', () => {

    test('should return 400 when email parameter is missing @regression', async ({ authService }) => {
      const response = await authService.verifyLoginMissingEmail('SomePassword123!');
      const body     = await parseBody(response);

      assertBadRequest(response, body, MESSAGES.ERRORS.MISSING_EMAIL_OR_PASSWORD);
      expect(body.responseCode).toBe(HTTP.BAD_REQUEST);
      expect(body.message).toBe(EXPECTED_RESPONSES.AUTH.VERIFY_LOGIN_BAD_REQUEST.message);
    });

    test('should return 400 when password parameter is missing @regression', async ({ authService }) => {
      const response = await authService.verifyLoginMissingPassword(EXISTING_USER.email);
      const body     = await parseBody(response);

      assertBadRequest(response, body, MESSAGES.ERRORS.MISSING_EMAIL_OR_PASSWORD);
      expect(body.responseCode).toBe(HTTP.BAD_REQUEST);
    });

  });

  // ─── API 9: DELETE /api/verifyLogin — Method Not Allowed ──────────────────
  test.describe('DELETE /api/verifyLogin — method not allowed', () => {

    test('should return 405 when DELETE method is used @regression', async ({ authService }) => {
      const response = await authService.deleteVerifyLogin();
      const body     = await parseBody(response);

      assertMethodNotAllowed(response, body);
      expect(body.responseCode).toBe(HTTP.METHOD_NOT_ALLOWED);
      expect(body.message).toBe(EXPECTED_RESPONSES.AUTH.VERIFY_LOGIN_METHOD_NOT_ALLOWED.message);
    });

  });

});
