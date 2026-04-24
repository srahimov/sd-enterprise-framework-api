import {
  test,
  expect,
  assertMethodNotAllowed,
  assertBadRequest,
  assertNotFound,
  parseBody,
  EXPECTED_RESPONSES,
  HTTP,
  MESSAGES,
} from '@fixtures';

test.describe('Negative Tests — @negative', () => {

  // ─── 405 Method Not Allowed ───────────────────────────────────────────────
  test.describe('405 — Method Not Allowed', () => {

    test('POST /api/productsList should return 405 @smoke @regression', async ({ productService }) => {
      const response = await productService.postToProductsList();
      const body     = await parseBody(response);

      assertMethodNotAllowed(response, body);
      expect(body.message).toBe(MESSAGES.ERRORS.METHOD_NOT_SUPPORTED);
    });

    test('PUT /api/brandsList should return 405 @smoke @regression', async ({ productService }) => {
      const response = await productService.putToBrandsList();
      const body     = await parseBody(response);

      assertMethodNotAllowed(response, body);
      expect(body.message).toBe(MESSAGES.ERRORS.METHOD_NOT_SUPPORTED);
    });

    test('DELETE /api/verifyLogin should return 405 @smoke @regression', async ({ authService }) => {
      const response = await authService.deleteVerifyLogin();
      const body     = await parseBody(response);

      assertMethodNotAllowed(response, body);
      expect(body.message).toBe(MESSAGES.ERRORS.METHOD_NOT_SUPPORTED);
    });

    test('all 405 responses should have matching HTTP status and body responseCode @regression', async ({ productService, authService }) => {
      const responses = await Promise.all([
        productService.postToProductsList(),
        productService.putToBrandsList(),
        authService.deleteVerifyLogin(),
      ]);

      for (const response of responses) {
        const body = await parseBody(response);
        expect(response.status()).toBe(HTTP.METHOD_NOT_ALLOWED);
        expect(body.responseCode).toBe(HTTP.METHOD_NOT_ALLOWED);
        expect(body.message).toBe(MESSAGES.ERRORS.METHOD_NOT_SUPPORTED);
      }
    });

  });

  // ─── 400 Bad Request ──────────────────────────────────────────────────────
  test.describe('400 — Bad Request', () => {

    test('POST /api/verifyLogin missing email should return 400 @regression', async ({ authService }) => {
      const response = await authService.verifyLoginMissingEmail('Password123!');
      const body     = await parseBody(response);

      assertBadRequest(response, body, MESSAGES.ERRORS.MISSING_EMAIL_OR_PASSWORD);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.AUTH.VERIFY_LOGIN_BAD_REQUEST.responseCode);
    });

    test('POST /api/verifyLogin missing password should return 400 @regression', async ({ authService }) => {
      const response = await authService.verifyLoginMissingPassword('test@test.com');
      const body     = await parseBody(response);

      assertBadRequest(response, body, MESSAGES.ERRORS.MISSING_EMAIL_OR_PASSWORD);
    });

    test('POST /api/searchProduct missing param should return 400 @regression', async ({ productService }) => {
      const response = await productService.searchProductMissingParam();
      const body     = await parseBody(response);

      assertBadRequest(response, body, MESSAGES.ERRORS.MISSING_SEARCH_PARAM);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.SEARCH.MISSING_PARAM.responseCode);
    });

    test('all 400 responses should contain descriptive error messages @regression', async ({ authService, productService }) => {
      const [loginResponse, searchResponse] = await Promise.all([
        authService.verifyLoginMissingEmail('Pass123!'),
        productService.searchProductMissingParam(),
      ]);

      const loginBody  = await parseBody(loginResponse);
      const searchBody = await parseBody(searchResponse);

      // Both should be 400 with meaningful messages
      expect(loginResponse.status()).toBe(HTTP.BAD_REQUEST);
      expect(searchResponse.status()).toBe(HTTP.BAD_REQUEST);
      expect(typeof loginBody.message).toBe('string');
      expect(typeof searchBody.message).toBe('string');
      expect((loginBody.message as string).length).toBeGreaterThan(0);
      expect((searchBody.message as string).length).toBeGreaterThan(0);
    });

  });

  // ─── 404 Not Found ────────────────────────────────────────────────────────
  test.describe('404 — Not Found', () => {

    test('POST /api/verifyLogin with invalid credentials should return 404 @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid({
        email:    'invalid.user.xyz@nowhere.com',
        password: 'WrongPassword999!',
      });
      const body = await parseBody(response);

      assertNotFound(response, body, MESSAGES.AUTH.USER_NOT_FOUND);
      expect(body.responseCode).toBe(EXPECTED_RESPONSES.AUTH.VERIFY_LOGIN_NOT_FOUND.responseCode);
    });

    test('404 response should contain "User not found!" message @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid({
        email:    'another.nonexistent@email.com',
        password: 'BadPass123!',
      });
      const body = await parseBody(response);

      expect(body.message).toBe(MESSAGES.AUTH.USER_NOT_FOUND);
    });

  });

  // ─── Response Consistency ─────────────────────────────────────────────────
  test.describe('Response Consistency', () => {

    test('all error responses should have responseCode field in body @regression', async ({ productService, authService }) => {
      const responses = await Promise.all([
        productService.postToProductsList(),
        productService.putToBrandsList(),
        productService.searchProductMissingParam(),
        authService.deleteVerifyLogin(),
        authService.verifyLoginMissingEmail('pass'),
        authService.verifyLoginInvalid({ email: 'x@x.com', password: 'bad' }),
      ]);

      for (const response of responses) {
        const body = await parseBody(response);
        expect(
          body.responseCode,
          `Expected responseCode in body for ${response.url()}`
        ).toBeDefined();
        expect(typeof body.responseCode).toBe('number');
      }
    });

    test('all error responses should have message field in body @regression', async ({ productService }) => {
      const response = await productService.postToProductsList();
      const body     = await parseBody(response);

      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
      expect((body.message as string).length).toBeGreaterThan(0);
    });

  });

});
