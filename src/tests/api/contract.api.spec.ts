import {
  test,
  expect,
  assertSchema,
  parseBody,
  createUserPayload,
  searchPayload,
  EXISTING_USER,
  ProductsListResponseSchema,
  SearchResponseSchema,
  BrandsListResponseSchema,
  GetUserResponseSchema,
  UserMutationResponseSchema,
  MethodNotAllowedSchema,
  MissingSearchParamSchema,
  MissingEmailOrPasswordSchema,
  UserNotFoundSchema,
  HTTP,
} from '@fixtures';

test.describe('Contract Tests — @contract', () => {

  // ─── Products Contract ────────────────────────────────────────────────────
  test.describe('GET /api/productsList — contract', () => {

    test('response body should match ProductsListResponse schema @contract @regression', async ({ productService }) => {
      const { body } = await productService.getAllProducts();

      assertSchema(
        ProductsListResponseSchema,
        body,
        'GET /api/productsList'
      );
    });

    test('each product should match Product schema @contract @regression', async ({ productService }) => {
      const { body } = await productService.getAllProducts();

      assertSchema(ProductsListResponseSchema, body, 'products list');

      // Validate structure has responseCode and products array
      expect(body).toHaveProperty('responseCode');
      expect(body).toHaveProperty('products');
      expect(body.responseCode).toBe(HTTP.OK);
    });

  });

  // ─── Brands Contract ──────────────────────────────────────────────────────
  test.describe('GET /api/brandsList — contract', () => {

    test('response body should match BrandsListResponse schema @contract @regression', async ({ productService }) => {
      const { body } = await productService.getAllBrands();

      assertSchema(
        BrandsListResponseSchema,
        body,
        'GET /api/brandsList'
      );
    });

  });

  // ─── Search Contract ──────────────────────────────────────────────────────
  test.describe('POST /api/searchProduct — contract', () => {

    test('response body should match SearchResponse schema @contract @regression', async ({ productService }) => {
      const { body } = await productService.searchProduct(
        searchPayload('top')
      );

      assertSchema(
        SearchResponseSchema,
        body,
        'POST /api/searchProduct'
      );
    });

  });

  // ─── Auth Contract ────────────────────────────────────────────────────────
  test.describe('POST /api/verifyLogin — contract', () => {

    test('valid login response should match expected schema @contract @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid(EXISTING_USER);
      const body     = await parseBody(response);

      // Valid login returns { responseCode: 200, message: "User exists!" }
      expect(body).toHaveProperty('responseCode');
      expect(body).toHaveProperty('message');
      expect(body.responseCode).toBe(HTTP.OK);
    });

    test('invalid login response should match UserNotFound schema @contract @regression', async ({ authService }) => {
      const response = await authService.verifyLoginInvalid({
        email:    'schema.test.invalid@nowhere.com',
        password: 'WrongPass999!',
      });
      const body = await parseBody(response);

      assertSchema(UserNotFoundSchema, body, 'POST /api/verifyLogin invalid');
    });

    test('missing param response should match MissingEmailOrPassword schema @contract @regression', async ({ authService }) => {
      const response = await authService.verifyLoginMissingEmail('pass');
      const body     = await parseBody(response);

      assertSchema(
        MissingEmailOrPasswordSchema,
        body,
        'POST /api/verifyLogin missing email'
      );
    });

  });

  // ─── User Contract ────────────────────────────────────────────────────────
  test.describe('User endpoints — contract', () => {

    test('POST /api/createAccount response should match UserMutationResponse schema @contract @regression', async ({ userService }) => {
      const payload        = createUserPayload();
      const { body }       = await userService.createUser(payload);

      assertSchema(
        UserMutationResponseSchema,
        body,
        'POST /api/createAccount'
      );

      await userService.safeDelete(payload.email, payload.password);
    });

    test('GET /api/getUserDetailByEmail response should match GetUserResponse schema @contract @regression', async ({ userService }) => {
      const payload  = createUserPayload();
await userService.createUser(payload);

      const { body } = await userService.getUserByEmail(payload.email);

      assertSchema(
        GetUserResponseSchema,
        body,
        'GET /api/getUserDetailByEmail'
      );

      await userService.safeDelete(payload.email, payload.password);
    });

    test('DELETE /api/deleteAccount response should match UserMutationResponse schema @contract @regression', async ({ userService }) => {
      const payload  = createUserPayload();
      await userService.createUser(payload);

      const { body } = await userService.deleteUser({
        email:    payload.email,
        password: payload.password,
      });

      assertSchema(
        UserMutationResponseSchema,
        body,
        'DELETE /api/deleteAccount'
      );
    });

    test('PUT /api/updateAccount response should match UserMutationResponse schema @contract @regression', async ({ userService }) => {
      const createData = createUserPayload();
      await userService.createUser(createData);

      const { body } = await userService.updateUser({
        ...createData,
        name: 'Contract Test Updated',
      });

      assertSchema(
        UserMutationResponseSchema,
        body,
        'PUT /api/updateAccount'
      );

      await userService.safeDelete(createData.email, createData.password);
    });

  });

  // ─── Error Response Contracts ─────────────────────────────────────────────
  test.describe('Error responses — contract', () => {

    test('POST /api/productsList 405 should match MethodNotAllowed schema @contract @regression', async ({ productService }) => {
      const response = await productService.postToProductsList();
      const body     = await parseBody(response);

      assertSchema(
        MethodNotAllowedSchema,
        body,
        'POST /api/productsList'
      );
    });

    test('PUT /api/brandsList 405 should match MethodNotAllowed schema @contract @regression', async ({ productService }) => {
      const response = await productService.putToBrandsList();
      const body     = await parseBody(response);

      assertSchema(
        MethodNotAllowedSchema,
        body,
        'PUT /api/brandsList'
      );
    });

    test('POST /api/searchProduct missing param should match MissingSearchParam schema @contract @regression', async ({ productService }) => {
      const response = await productService.searchProductMissingParam();
      const body     = await parseBody(response);

      assertSchema(
        MissingSearchParamSchema,
        body,
        'POST /api/searchProduct missing param'
      );
    });

  });

});
