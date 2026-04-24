import {
  test,
  expect,
  assertSuccess,
  assertBadRequest,
  assertHasProducts,
  parseBody,
  searchPayload,
  EXPECTED_RESPONSES,
  VALID_SEARCH_TERMS,
  HTTP,
  MESSAGES,
} from '@fixtures';

test.describe('Search API — @search', () => {

  // ─── API 5: POST /api/searchProduct — with param ──────────────────────────
  test.describe('POST /api/searchProduct — with search_product param', () => {

    test('should return 200 and matching products for "top" @smoke @regression', async ({ productService }) => {
      const { response, body } = await productService.searchProduct(
        searchPayload('top')
      );

      assertSuccess(response, body);
      assertHasProducts(body);
    });

    test('should return 200 and matching products for "tshirt" @regression', async ({ productService }) => {
      const { response, body } = await productService.searchProduct(
        searchPayload('tshirt')
      );

      assertSuccess(response, body);
      expect(body.responseCode).toBe(HTTP.OK);
      expect(Array.isArray(body.products)).toBe(true);
    });

    test('should return products for all known valid search terms @regression', async ({ productService }) => {
      for (const term of VALID_SEARCH_TERMS) {
        const { response, body } = await productService.searchProduct(
          searchPayload(term)
        );

        expect(
          response.status(),
          `Expected 200 for search term "${term}"`
        ).toBe(HTTP.OK);
        expect(
          body.responseCode,
          `Expected responseCode 200 for search term "${term}"`
        ).toBe(HTTP.OK);
      }
    });

    test('should return products array for valid search @regression', async ({ productService }) => {
      const products = await productService.searchAndVerify('dress');

      expect(Array.isArray(products)).toBe(true);
    });

    test('should return products with required fields in search results @regression', async ({ productService }) => {
      const products = await productService.searchAndVerify('top');

      if (products.length > 0) {
        const first = products[0];
        expect(first.id).toBeDefined();
        expect(first.name).toBeDefined();
        expect(first.price).toBeDefined();
        expect(first.brand).toBeDefined();
        expect(first.category).toBeDefined();
      }
    });

    test('should return empty array for unknown search term @regression', async ({ productService }) => {
      const { response, body } = await productService.searchProduct(
        searchPayload('xyznonexistentitem999abc')
      );

      expect(response.status()).toBe(HTTP.OK);
      expect(body.responseCode).toBe(HTTP.OK);
      expect(Array.isArray(body.products)).toBe(true);
    });

  });

  // ─── API 6: POST /api/searchProduct — missing param ───────────────────────
  test.describe('POST /api/searchProduct — missing search_product param', () => {

    test('should return 400 when search_product param is missing @smoke @regression', async ({ productService }) => {
      const response = await productService.searchProductMissingParam();
      const body     = await parseBody(response);

      assertBadRequest(response, body, MESSAGES.ERRORS.MISSING_SEARCH_PARAM);
    });

    test('should return exact 400 message in body @regression', async ({ productService }) => {
      const response = await productService.searchProductMissingParam();
      const body     = await parseBody(response);

      expect(body.responseCode).toBe(EXPECTED_RESPONSES.SEARCH.MISSING_PARAM.responseCode);
      expect(body.message).toBe(EXPECTED_RESPONSES.SEARCH.MISSING_PARAM.message);
    });

  });

});
