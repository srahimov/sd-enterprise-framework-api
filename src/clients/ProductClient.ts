import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient }                  from './BaseApiClient';
import { ENDPOINTS }                      from '@constants/endpoints';
import { DEFAULT_HEADERS }                from '@config/apiConfig';
import { SearchRequest }                  from '@appTypes/product';

export class ProductClient extends BaseApiClient {

  constructor(request: APIRequestContext) {
    super(request);
  }

  // ─── Get All Products ──────────────────────────────────────────────────────
  // GET /api/productsList
  // API 1 — → 200 + products array
  async getAllProducts(): Promise<APIResponse> {
    this.logger.info('Getting all products');

    return this.get(ENDPOINTS.PRODUCTS.LIST);
  }

  // ─── POST To Products List ─────────────────────────────────────────────────
  // POST /api/productsList
  // API 2 — → 405 "This request method is not supported."
  // Exists purely for negative testing
  async postToProductsList(): Promise<APIResponse> {
    this.logger.info('POST to productsList — expecting 405');

    return this.post(
      ENDPOINTS.PRODUCTS.LIST,
      { headers: DEFAULT_HEADERS.json }
    );
  }

  // ─── Get All Brands ────────────────────────────────────────────────────────
  // GET /api/brandsList
  // API 3 — → 200 + brands array
  async getAllBrands(): Promise<APIResponse> {
    this.logger.info('Getting all brands');

    return this.get(ENDPOINTS.BRANDS.LIST);
  }

  // ─── PUT To Brands List ────────────────────────────────────────────────────
  // PUT /api/brandsList
  // API 4 — → 405 "This request method is not supported."
  // Exists purely for negative testing
  async putToBrandsList(): Promise<APIResponse> {
    this.logger.info('PUT to brandsList — expecting 405');

    return this.put(
      ENDPOINTS.BRANDS.LIST,
      { headers: DEFAULT_HEADERS.json }
    );
  }

  // ─── Search Product ────────────────────────────────────────────────────────
  // POST /api/searchProduct
  // API 5 — search_product param → 200 + matching products array
  async searchProduct(payload: SearchRequest): Promise<APIResponse> {
    this.logger.info('Searching products', {
      search_product: payload.search_product,
    });

    return this.post(
      ENDPOINTS.SEARCH.PRODUCT,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: { search_product: payload.search_product },
      }
    );
  }

  // ─── Search Product — Missing Param ───────────────────────────────────────
  // POST /api/searchProduct (no body)
  // API 6 — missing search_product → 400 "Bad request, search_product parameter is missing"
  async searchProductMissingParam(): Promise<APIResponse> {
    this.logger.info('POST to searchProduct with no param — expecting 400');

    return this.post(
      ENDPOINTS.SEARCH.PRODUCT,
      { headers: DEFAULT_HEADERS.formData }
    );
  }
}
