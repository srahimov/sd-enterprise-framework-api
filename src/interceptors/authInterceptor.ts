import { StoredCredentials } from '@appTypes/auth';
import { RequestOptions }    from '@appTypes/common';
import { createLogger }      from '@utils/logger';

const logger = createLogger('AuthInterceptor');

// ─── Auth Interceptor ─────────────────────────────────────────────────────────
// Handles credential injection for automationexercise.com
// This API uses form-data credentials (email + password) — not Bearer tokens
// Credentials are merged into the formData of requests that require auth

export class AuthInterceptor {
  private credentials: StoredCredentials | null = null;

  // ─── Store credentials ──────────────────────────────────────────────────────
  // Called by authFixture after successful login verification
  setCredentials(credentials: StoredCredentials): void {
    this.credentials = credentials;
    logger.debug('Credentials stored in auth interceptor', {
      email: credentials.email,
    });
  }

  // ─── Clear credentials ──────────────────────────────────────────────────────
  // Called by globalTeardown or after logout
  clearCredentials(): void {
    this.credentials = null;
    logger.debug('Credentials cleared from auth interceptor');
  }

  // ─── Check if authenticated ─────────────────────────────────────────────────
  isAuthenticated(): boolean {
    return this.credentials !== null;
  }

  // ─── Get stored credentials ─────────────────────────────────────────────────
  getCredentials(): StoredCredentials | null {
    return this.credentials;
  }

  // ─── Inject credentials into request options ────────────────────────────────
  // Merges email + password into formData for endpoints that require auth
  // Only injects if requiresAuth is true AND credentials are available
  // Usage: const options = authInterceptor.injectCredentials(options, true)
  injectCredentials(
    options:      RequestOptions,
    requiresAuth: boolean = false
  ): RequestOptions {
    if (!requiresAuth) {
      return options;
    }

    if (!this.credentials) {
      logger.warn('Auth required but no credentials stored — request may fail');
      return options;
    }

    logger.debug('Injecting credentials into request formData', {
      email: this.credentials.email,
    });

    // Merge credentials into existing formData
    // Existing formData fields take precedence — credentials are added alongside
    return {
      ...options,
      formData: {
        email:    this.credentials.email,
        password: this.credentials.password,
        ...options.formData,  // Existing fields override if they exist
      },
    };
  }

  // ─── Build auth form data ────────────────────────────────────────────────────
  // Returns credentials as a plain object for direct use in requests
  // Usage: const formData = authInterceptor.buildAuthFormData()
  buildAuthFormData(): Record<string, string> {
    if (!this.credentials) {
      throw new Error(
        'Cannot build auth form data — no credentials stored. ' +
        'Ensure authFixture has run before this request.'
      );
    }
    return {
      email:    this.credentials.email,
      password: this.credentials.password,
    };
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────
// Shared across the test run — fixtures set credentials, clients consume them
export const authInterceptor = new AuthInterceptor();
