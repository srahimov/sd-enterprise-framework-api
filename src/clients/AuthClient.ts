import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient }                  from './BaseApiClient';
import { ENDPOINTS }                      from '@constants/endpoints';
import { DEFAULT_HEADERS }                from '@config/apiConfig';
import { LoginRequest }                   from '@appTypes/auth';

export class AuthClient extends BaseApiClient {

  constructor(request: APIRequestContext) {
    super(request);
  }

  // ─── Verify Login ─────────────────────────────────────────────────────────
  // POST /api/verifyLogin
  // API 7 — valid credentials → 200 "User exists!"
  // API 10 — invalid credentials → 404 "User not found!"
  async verifyLogin(credentials: LoginRequest): Promise<APIResponse> {
    this.logger.info('Verifying login', { email: credentials.email });

    return this.post(
      ENDPOINTS.AUTH.VERIFY_LOGIN,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: {
          email:    credentials.email,
          password: credentials.password,
        },
      }
    );
  }

  // ─── Verify Login — Missing Email ──────────────────────────────────────────
  // POST /api/verifyLogin with only password
  // API 8 — missing email → 400 "Bad request, email or password parameter is missing"
  async verifyLoginMissingEmail(password: string): Promise<APIResponse> {
    this.logger.info('Verifying login with missing email param');

    return this.post(
      ENDPOINTS.AUTH.VERIFY_LOGIN,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: { password },
      }
    );
  }

  // ─── Verify Login — Missing Password ─────────────────────────────────────
  // POST /api/verifyLogin with only email
  // Negative test — missing password
  async verifyLoginMissingPassword(email: string): Promise<APIResponse> {
    this.logger.info('Verifying login with missing password param');

    return this.post(
      ENDPOINTS.AUTH.VERIFY_LOGIN,
      {
        headers:  DEFAULT_HEADERS.formData,
        formData: { email },
      }
    );
  }

  // ─── Delete Verify Login ──────────────────────────────────────────────────
  // DELETE /api/verifyLogin
  // API 9 — DELETE method → 405 "This request method is not supported."
  async deleteVerifyLogin(): Promise<APIResponse> {
    this.logger.info('Sending DELETE to verifyLogin — expecting 405');

    return this.delete(ENDPOINTS.AUTH.VERIFY_LOGIN);
  }
}
