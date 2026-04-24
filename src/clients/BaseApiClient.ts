import { APIRequestContext, APIResponse } from '@playwright/test';
import { API_CONFIG, DEFAULT_HEADERS }    from '@config/apiConfig';
import { ENV }                            from '@config/env';
import { RequestOptions }                 from '@appTypes/common';
import { authInterceptor }                from '@interceptors/authInterceptor';
import { retryInterceptor }               from '@interceptors/retryInterceptor';
import { createLogger }                   from '@utils/logger';
import { timestamp, getDuration }         from '@utils/date';

export abstract class BaseApiClient {
  protected request: APIRequestContext;
  protected logger  = createLogger(this.constructor.name);
  protected baseUrl = ENV.baseUrl;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // ─── Build full URL ─────────────────────────────────────────────────────────
  protected buildUrl(path: string): string {
    // If path already starts with http — use as-is (absolute URL)
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}${path}`;
  }

  // ─── Build request options ──────────────────────────────────────────────────
  // Merges global API_CONFIG defaults with per-request overrides
  protected buildRequestOptions(
    options:      RequestOptions = {},
    requiresAuth: boolean        = false
  ): RequestOptions {
    // Inject credentials if this request requires auth
    const withAuth = authInterceptor.injectCredentials(options, requiresAuth);

    return {
      timeout: API_CONFIG.timeouts.request,
      headers: DEFAULT_HEADERS.json,
      ...withAuth,
    };
  }

  // ─── GET ────────────────────────────────────────────────────────────────────
  async get(
    path:     string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const url   = this.buildUrl(path);
    const opts  = this.buildRequestOptions(options);
    const start = timestamp();

    this.logger.logRequest('GET', url);

    const response = await retryInterceptor.execute(
      () => this.request.get(url, {
        headers: opts.headers as Record<string, string>,
        timeout: opts.timeout,
        params:  opts.params as Record<string, string | number | boolean>,
      }),
      `GET ${path}`
    );

    this.logger.logResponse('GET', url, response.status(), getDuration(start));
    return response;
  }

  // ─── POST ───────────────────────────────────────────────────────────────────
  async post(
    path:         string,
    options?:     RequestOptions,
    requiresAuth: boolean = false
  ): Promise<APIResponse> {
    const url   = this.buildUrl(path);
    const opts  = this.buildRequestOptions(options, requiresAuth);
    const start = timestamp();

    this.logger.logRequest('POST', url, opts.formData ?? opts.data);

    const response = await retryInterceptor.execute(
      () => this.request.post(url, {
        headers:  opts.headers as Record<string, string>,
        timeout:  opts.timeout,
        form:     opts.formData as Record<string, string | number | boolean>,
        data:     opts.data,
      }),
      `POST ${path}`
    );

    this.logger.logResponse('POST', url, response.status(), getDuration(start));
    return response;
  }

  // ─── PUT ────────────────────────────────────────────────────────────────────
  async put(
    path:         string,
    options?:     RequestOptions,
    requiresAuth: boolean = false
  ): Promise<APIResponse> {
    const url   = this.buildUrl(path);
    const opts  = this.buildRequestOptions(options, requiresAuth);
    const start = timestamp();

    this.logger.logRequest('PUT', url, opts.formData ?? opts.data);

    const response = await retryInterceptor.execute(
      () => this.request.put(url, {
        headers: opts.headers as Record<string, string>,
        timeout: opts.timeout,
        form:    opts.formData as Record<string, string | number | boolean>,
        data:    opts.data,
      }),
      `PUT ${path}`
    );

    this.logger.logResponse('PUT', url, response.status(), getDuration(start));
    return response;
  }

  // ─── PATCH ──────────────────────────────────────────────────────────────────
  async patch(
    path:         string,
    options?:     RequestOptions,
    requiresAuth: boolean = false
  ): Promise<APIResponse> {
    const url   = this.buildUrl(path);
    const opts  = this.buildRequestOptions(options, requiresAuth);
    const start = timestamp();

    this.logger.logRequest('PATCH', url, opts.formData ?? opts.data);

    const response = await retryInterceptor.execute(
      () => this.request.patch(url, {
        headers: opts.headers as Record<string, string>,
        timeout: opts.timeout,
        form:    opts.formData as Record<string, string | number | boolean>,
        data:    opts.data,
      }),
      `PATCH ${path}`
    );

    this.logger.logResponse('PATCH', url, response.status(), getDuration(start));
    return response;
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────
  async delete(
    path:         string,
    options?:     RequestOptions,
    requiresAuth: boolean = false
  ): Promise<APIResponse> {
    const url   = this.buildUrl(path);
    const opts  = this.buildRequestOptions(options, requiresAuth);
    const start = timestamp();

    this.logger.logRequest('DELETE', url, opts.formData ?? opts.data);

    const response = await retryInterceptor.execute(
      () => this.request.delete(url, {
        headers: opts.headers as Record<string, string>,
        timeout: opts.timeout,
        form:    opts.formData as Record<string, string | number | boolean>,
        data:    opts.data,
      }),
      `DELETE ${path}`
    );

    this.logger.logResponse('DELETE', url, response.status(), getDuration(start));
    return response;
  }

  // ─── HEAD ───────────────────────────────────────────────────────────────────
  async head(
    path:    string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const url   = this.buildUrl(path);
    const opts  = this.buildRequestOptions(options);
    const start = timestamp();

    this.logger.logRequest('HEAD', url);

    const response = await retryInterceptor.execute(
      () => this.request.head(url, {
        headers: opts.headers as Record<string, string>,
        timeout: opts.timeout,
      }),
      `HEAD ${path}`
    );

    this.logger.logResponse('HEAD', url, response.status(), getDuration(start));
    return response;
  }
}
