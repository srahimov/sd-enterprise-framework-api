import { APIRequestContext } from '@playwright/test';
import { authFixture }       from './authFixture';
import { AuthService }       from '@services/AuthService';
import { UserService }       from '@services/UserService';
import { ProductService }    from '@services/ProductService';
import { createLogger }      from '@utils/logger';

const logger = createLogger('ApiFixture');

// ─── API Fixture Types ────────────────────────────────────────────────────────
// All service instances exposed to tests
export type ApiFixtures = {
  authService:    AuthService;
  userService:    UserService;
  productService: ProductService;
  apiRequest:     APIRequestContext;
};

// ─── API Fixture ──────────────────────────────────────────────────────────────
// Extends authFixture — provides all services + auth in one import
export const apiFixture = authFixture.extend<ApiFixtures>({

  // ─── authService ───────────────────────────────────────────────────────────
  authService: async ({ request }, use) => {
    logger.debug('Creating AuthService instance');
    const service = new AuthService(request);
    await use(service);
  },

  // ─── userService ───────────────────────────────────────────────────────────
  userService: async ({ request }, use) => {
    logger.debug('Creating UserService instance');
    const service = new UserService(request);
    await use(service);
  },

  // ─── productService ────────────────────────────────────────────────────────
  productService: async ({ request }, use) => {
    logger.debug('Creating ProductService instance');
    const service = new ProductService(request);
    await use(service);
  },

  // ─── apiRequest ────────────────────────────────────────────────────────────
  // Raw request context — for tests that need direct API access
  apiRequest: async ({ request }, use) => {
    await use(request);
  },
});
