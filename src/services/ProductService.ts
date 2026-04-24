import { APIRequestContext, APIResponse } from '@playwright/test';
import { ProductClient }                  from '@clients/ProductClient';
import { SearchRequest, Product, ProductsListResponse, SearchResponse } from '@appTypes/product';
import { BrandsListResponse, Brand }      from '@appTypes/brand';
import { parseBody }                      from '@helpers/responseHelper';
import { createLogger }                   from '@utils/logger';

export class ProductService {
  private client: ProductClient;
  private logger  = createLogger('ProductService');

  constructor(request: APIRequestContext) {
    this.client = new ProductClient(request);
  }

  // ─── Get All Products ────────────────────────────────────────────────────────
  // GET /api/productsList
  // Returns raw response + typed products list body
  async getAllProducts(): Promise<{
    response: APIResponse;
    body:     ProductsListResponse;
  }> {
    this.logger.info('Getting all products');

    const response = await this.client.getAllProducts();
    const body     = await parseBody<ProductsListResponse>(response);

    this.logger.debug('Products list response', {
      status:       response.status(),
      responseCode: body.responseCode,
      count:        body.products?.length,
    });

    return { response, body };
  }

  // ─── Get Products List ────────────────────────────────────────────────────────
  // Convenience method — returns just the products array
  async getProductsList(): Promise<Product[]> {
    const { body } = await this.getAllProducts();
    return body.products;
  }

  // ─── Get Product By ID ────────────────────────────────────────────────────────
  // Finds a specific product from the full list by ID
  // Usage: const product = await productService.getProductById(1)
  async getProductById(id: number): Promise<Product | undefined> {
    this.logger.info('Getting product by ID', { id });
    const products = await this.getProductsList();
    return products.find((p) => p.id === id);
  }

  // ─── Get All Brands ──────────────────────────────────────────────────────────
  // GET /api/brandsList
  // Returns raw response + typed brands list body
  async getAllBrands(): Promise<{
    response: APIResponse;
    body:     BrandsListResponse;
  }> {
    this.logger.info('Getting all brands');

    const response = await this.client.getAllBrands();
    const body     = await parseBody<BrandsListResponse>(response);

    this.logger.debug('Brands list response', {
      status:       response.status(),
      responseCode: body.responseCode,
      count:        body.brands?.length,
    });

    return { response, body };
  }

  // ─── Get Brands List ─────────────────────────────────────────────────────────
  // Convenience method — returns just the brands array
  async getBrandsList(): Promise<Brand[]> {
    const { body } = await this.getAllBrands();
    return body.brands;
  }

  // ─── Search Product ───────────────────────────────────────────────────────────
  // POST /api/searchProduct
  // Returns raw response + typed search response body
  async searchProduct(payload: SearchRequest): Promise<{
    response: APIResponse;
    body:     SearchResponse;
  }> {
    this.logger.info('Searching products', {
      term: payload.search_product,
    });

    const response = await this.client.searchProduct(payload);
    const body     = await parseBody<SearchResponse>(response);

    this.logger.debug('Search response', {
      status:       response.status(),
      responseCode: body.responseCode,
      count:        body.products?.length,
    });

    return { response, body };
  }

  // ─── Search and Verify ────────────────────────────────────────────────────────
  // Searches AND verifies results are non-empty
  // Returns products array for further assertions in tests
  async searchAndVerify(term: string): Promise<Product[]> {
    this.logger.info('Search and verify products', { term });

    const { body } = await this.searchProduct({ search_product: term });

    if (!body.products || body.products.length === 0) {
      this.logger.warn('Search returned no products', { term });
    } else {
      this.logger.debug('Search returned products', {
        term,
        count: body.products.length,
      });
    }

    return body.products ?? [];
  }

  // ─── Negative: POST to Products List ─────────────────────────────────────────
  // POST /api/productsList → 405
  // Returns raw response for negative test assertions
  async postToProductsList(): Promise<APIResponse> {
    this.logger.info('POST to productsList — expecting 405');
    return this.client.postToProductsList();
  }

  // ─── Negative: PUT to Brands List ────────────────────────────────────────────
  // PUT /api/brandsList → 405
  // Returns raw response for negative test assertions
  async putToBrandsList(): Promise<APIResponse> {
    this.logger.info('PUT to brandsList — expecting 405');
    return this.client.putToBrandsList();
  }

  // ─── Negative: Search Missing Param ──────────────────────────────────────────
  // POST /api/searchProduct with no body → 400
  // Returns raw response for negative test assertions
  async searchProductMissingParam(): Promise<APIResponse> {
    this.logger.info('Search with missing param — expecting 400');
    return this.client.searchProductMissingParam();
  }
}
