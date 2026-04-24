import { test as base, APIRequestContext } from '@playwright/test';
import { AuthService }                     from '@services/AuthService';
import { AuthFixtureContext, StoredCredentials } from '@appTypes/auth';
import { createLogger }                    from '@utils/logger';
import { ENV }                             from '@config/env';

const logger = createLogger('AuthFixture');

// ─── Auth Fixture Type ────────────────────────────────────────────────────────
// What this fixture exposes to tests
export type AuthFixtures = {
  // Full auth context — credentials + state + helpers
  auth: AuthFixtureContext;

  // Just the credentials — for tests that need to pass them to specific requests
  credentials: StoredCredentials;

  // Authenticated request context — pre-configured with credentials
  authenticatedRequest: APIRequestContext;
};

// ─── Auth Fixture ─────────────────────────────────────────────────────────────
export const authFixture = base.extend<AuthFixtures>({

  // ─── auth fixture ──────────────────────────────────────────────────────────
  // Provides full auth context — verifies credentials and stores them
  auth: async ({ request }, use) => {
    logger.debug('Auth fixture setup — verifying credentials');

    const authService = new AuthService(request);

    // Verify and store credentials in authInterceptor
    // All subsequent requests that require auth will use these automatically
    const authState = await authService.verifyAndStoreDefault();

    if (!authState.isAuthenticated) {
      throw new Error(
        `Auth fixture failed — could not verify credentials.\n` +
        `Email: ${ENV.testUserEmail}\n` +
        `Ensure the account exists on ${ENV.baseUrl}`
      );
    }

    logger.debug('Auth fixture ready', { email: ENV.testUserEmail });

    // Build the context object exposed to tests
    const authContext: AuthFixtureContext = {
      credentials: {
        email:    ENV.testUserEmail,
        password: ENV.testUserPassword,
      },
      authState,
      getFormData: () => ({
        email:    ENV.testUserEmail,
        password: ENV.testUserPassword,
      }),
    };

    // ─── Provide to test ───────────────────────────────────────────────────
    await use(authContext);

    // ─── Teardown — runs after each test ──────────────────────────────────
    logger.debug('Auth fixture teardown — clearing credentials');
    authService.clearAuth();
  },

  // ─── credentials fixture ───────────────────────────────────────────────────
  // Lightweight — just the credentials object
  // Usage: test('my test', async ({ credentials }) => { ... })
  credentials: async ({ request }, use) => {
    const authService = new AuthService(request);
    await authService.verifyAndStoreDefault();

    await use({
      email:    ENV.testUserEmail,
      password: ENV.testUserPassword,
    });

    authService.clearAuth();
  },

  // ─── authenticatedRequest fixture ─────────────────────────────────────────
  // Provides the raw APIRequestContext — for tests that build requests manually
  authenticatedRequest: async ({ request }, use) => {
    const authService = new AuthService(request);
    await authService.verifyAndStoreDefault();

    await use(request);

    authService.clearAuth();
  },
});

export { base as test };
