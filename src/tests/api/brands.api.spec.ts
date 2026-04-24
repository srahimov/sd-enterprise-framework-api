import {
  test,
  expect,
  assertSuccess,
  assertMethodNotAllowed,
  assertHasBrands,
  parseBody,
  EXPECTED_RESPONSES,
  EXPECTED_BRAND_FIELDS,
  HTTP,
} from '@fixtures';

test.describe('Brands API — @brands', () => {

  // ─── API 3: GET /api/brandsList ───────────────────────────────────────────
  test.describe('GET /api/brandsList', () => {

    test('should return 200 and brands list @smoke @regression', async ({ productService }) => {
      const { response, body } = await productService.getAllBrands();

      assertSuccess(response, body);
      assertHasBrands(body);
    });

    test('should return responseCode 200 in body @regression', async ({ productService }) => {
      const { body } = await productService.getAllBrands();

      expect(body.responseCode).toBe(HTTP.OK);
    });

    test('should return brands as an array @regression', async ({ productService }) => {
      const { body } = await productService.getAllBrands();

      expect(Array.isArray(body.brands)).toBe(true);
      expect(body.brands.length).toBeGreaterThan(0);
    });

    test('should return brands with all required fields @regression', async ({ productService }) => {
      const brands = await productService.getBrandsList();
      const first  = brands[0];

      for (const field of EXPECTED_BRAND_FIELDS) {
        expect(
          first,
          `Expected field "${field}" to be present in brand`
        ).toHaveProperty(field);
      }
    });

    test('should return brands with valid id as positive number @regression', async ({ productService }) => {
      const brands = await productService.getBrandsList();

      for (const brand of brands) {
        expect(typeof brand.id).toBe('number');
        expect(brand.id).toBeGreaterThan(0);
      }
    });

    test('should return brand name as non-empty string @regression', async ({ productService }) => {
      const brands = await productService.getBrandsList();

      for (const brand of brands) {
        expect(typeof brand.brand).toBe('string');
        expect(brand.brand.trim().length).toBeGreaterThan(0);
      }
    });

  });

  // ─── API 4: PUT /api/brandsList — Method Not Allowed ─────────────────────
  test.describe('PUT /api/brandsList — method not allowed', () => {

    test('should return 405 when PUT method is used @smoke @regression', async ({ productService }) => {
      const response = await productService.putToBrandsList();
      const body     = await parseBody(response);

      assertMethodNotAllowed(response, body);
    });

    test('should return exact 405 message in body @regression', async ({ productService }) => {
      const response = await productService.putToBrandsList();
      const body     = await parseBody(response);

      expect(body.responseCode).toBe(EXPECTED_RESPONSES.BRANDS.METHOD_NOT_ALLOWED.responseCode);
      expect(body.message).toBe(EXPECTED_RESPONSES.BRANDS.METHOD_NOT_ALLOWED.message);
    });

  });

});
