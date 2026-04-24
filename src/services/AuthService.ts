import { APIRequestContext, APIResponse } from '@playwright/test';
import { AuthClient }                     from '@clients/AuthClient';
import { authInterceptor }                from '@interceptors/authInterceptor';
import { LoginRequest, LoginResponse, StoredCredentials, AuthState } from '@appTypes/auth';
import { parseBody }                      from '@helpers/responseHelper';
import { createLogger }                   from '@utils/logger';
import { ENV }                            from '@config/env';

export class AuthService {
  private client: AuthClient;
  private logger  = createLogger('AuthService');
  private state:  AuthState = {
    isAuthenticated: false,
    credentials:     null,
    verifiedAt:      null,
  };

  constructor(request: APIRequestContext) {
    this.client = new AuthClient(request);
  }

  // ─── Verify Login — Valid Credentials ──────────────────────────────────────
  // Verifies credentials and returns the parsed response body
  // Does NOT store credentials — use verifyAndStore() for fixture setup
  async verifyLogin(credentials: LoginRequest): Promise<LoginResponse> {
    this.logger.info('Verifying login credentials', { email: credentials.email });

    const response = await this.client.verifyLogin(credentials);
    const body     = await parseBody<LoginResponse>(response);

    this.logger.debug('Login verification response', {
      status:       response.status(),
      responseCode: body.responseCode,
      message:      body.message,
    });

    return body;
  }

  // ─── Verify and Store Credentials ──────────────────────────────────────────
  // Verifies credentials AND stores them in authInterceptor
  // Called by authFixture — sets up auth for entire test
  // All subsequent requests that require auth will use these credentials
  async verifyAndStore(credentials: StoredCredentials): Promise<AuthState> {
    this.logger.info('Verifying and storing credentials', {
      email: credentials.email,
    });

    const response = await this.client.verifyLogin(credentials);
    const body     = await parseBody<LoginResponse>(response);

    if (response.status() === 200 && body.responseCode === 200) {
      // Store in interceptor — all authenticated requests will use these
      authInterceptor.setCredentials(credentials);

      this.state = {
        isAuthenticated: true,
        credentials,
        verifiedAt: new Date(),
      };

      this.logger.info('Credentials verified and stored successfully', {
        email: credentials.email,
      });
    } else {
      this.logger.warn('Credential verification failed', {
        status:  response.status(),
        message: body.message,
      });

      this.state = {
        isAuthenticated: false,
        credentials:     null,
        verifiedAt:      null,
      };
    }

    return this.state;
  }

  // ─── Verify Login — Default Test Credentials ───────────────────────────────
  // Convenience method — uses TEST_USER_EMAIL and TEST_USER_PASSWORD from .env
  // Called by authFixture as the primary setup method
  async verifyAndStoreDefault(): Promise<AuthState> {
    return this.verifyAndStore({
      email:    ENV.testUserEmail,
      password: ENV.testUserPassword,
    });
  }

  // ─── Verify Login — Invalid Credentials ────────────────────────────────────
  // Returns raw APIResponse for negative test assertions
  // API 10 — invalid credentials → 404 "User not found!"
  async verifyLoginInvalid(credentials: LoginRequest): Promise<APIResponse> {
    this.logger.info('Verifying login with invalid credentials', {
      email: credentials.email,
    });
    return this.client.verifyLogin(credentials);
  }

  // ─── Verify Login — Missing Email ──────────────────────────────────────────
  // Returns raw APIResponse for negative test assertions
  // API 8 — missing email → 400
  async verifyLoginMissingEmail(password: string): Promise<APIResponse> {
    this.logger.info('Verifying login with missing email');
    return this.client.verifyLoginMissingEmail(password);
  }

  // ─── Verify Login — Missing Password ───────────────────────────────────────
  // Returns raw APIResponse for negative test assertions
  async verifyLoginMissingPassword(email: string): Promise<APIResponse> {
    this.logger.info('Verifying login with missing password');
    return this.client.verifyLoginMissingPassword(email);
  }

  // ─── Delete Verify Login ────────────────────────────────────────────────────
  // Returns raw APIResponse for negative test assertions
  // API 9 — DELETE method → 405
  async deleteVerifyLogin(): Promise<APIResponse> {
    this.logger.info('Sending DELETE to verifyLogin endpoint');
    return this.client.deleteVerifyLogin();
  }

  // ─── Clear Auth State ────────────────────────────────────────────────────────
  // Called by globalTeardown and authFixture teardown
  clearAuth(): void {
    authInterceptor.clearCredentials();
    this.state = {
      isAuthenticated: false,
      credentials:     null,
      verifiedAt:      null,
    };
    this.logger.info('Auth state cleared');
  }

  // ─── Get Current Auth State ──────────────────────────────────────────────────
  getAuthState(): AuthState {
    return this.state;
  }

  // ─── Is Authenticated ────────────────────────────────────────────────────────
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }
}
