import {
  test,
  expect,
  assertSuccess,
  assertMethodNotAllowed,
  assertHasProducts,
  parseBody,
  EXPECTED_RESPONSES,
  EXPECTED_PRODUCT_FIELDS,
  HTTP,
} from '@fixtures';

test.describe('Products API — @products', () => {

  // ─── API 1: GET /api/productsList ─────────────────────────────────────────
  test.describe('GET /api/productsList', () => {

    test('should return 200 and products list @smoke @regression', async ({ productService }) => {
      const { response, body } = await productService.getAllProducts();

      assertSuccess(response, body);
      assertHasProducts(body);
    });

    test('should return responseCode 200 in body @regression', async ({ productService }) => {
      const { body } = await productService.getAllProducts();

      expect(body.responseCode).toBe(HTTP.OK);
    });

    test('should return products as an array @regression', async ({ productService }) => {
      const { body } = await productService.getAllProducts();

      expect(Array.isArray(body.products)).toBe(true);
      expect(body.products.length).toBeGreaterThan(0);
    });

    test('should return products with all required fields @regression', async ({ productService }) => {
      const products = await productService.getProductsList();

      // Check first product has all required fields
      const firstProduct = products[0];
      for (const field of EXPECTED_PRODUCT_FIELDS) {
        expect(
          firstProduct,
          `Expected field "${field}" to be present in product`
        ).toHaveProperty(field);
      }
    });

    test('should return products with valid id as positive number @regression', async ({ productService }) => {
      const products = await productService.getProductsList();

      for (const product of products) {
        expect(typeof product.id).toBe('number');
        expect(product.id).toBeGreaterThan(0);
      }
    });

    test('should return products with price as string @regression', async ({ productService }) => {
      const products = await productService.getProductsList();

      for (const product of products) {
        expect(typeof product.price).toBe('string');
        expect(product.price.length).toBeGreaterThan(0);
      }
    });

    test('should return products with nested category object @regression', async ({ productService }) => {
      const products = await productService.getProductsList();
      const first    = products[0];

      expect(first.category).toBeDefined();
      expect(first.category.category).toBeDefined();
      expect(first.category.usertype).toBeDefined();
      expect(first.category.usertype.usertype).toBeDefined();
    });

    test('should return product by id from list @regression', async ({ productService }) => {
      const product = await productService.getProductById(1);

      expect(product).toBeDefined();
      expect(product?.id).toBe(1);
      expect(product?.name).toBeDefined();
    });

  });

  // ─── API 2: POST /api/productsList — Method Not Allowed ───────────────────
  test.describe('POST /api/productsList — method not allowed', () => {

    test('should return 405 when POST method is used @smoke @regression', async ({ productService }) => {
      const response = await productService.postToProductsList();
      const body     = await parseBody(response);

      assertMethodNotAllowed(response, body);
    });

    test('should return exact 405 message in body @regression', async ({ productService }) => {
      const response = await productService.postToProductsList();
      const body     = await parseBody(response);

      expect(body.responseCode).toBe(EXPECTED_RESPONSES.PRODUCTS.METHOD_NOT_ALLOWED.responseCode);
      expect(body.message).toBe(EXPECTED_RESPONSES.PRODUCTS.METHOD_NOT_ALLOWED.message);
    });

  });

});
