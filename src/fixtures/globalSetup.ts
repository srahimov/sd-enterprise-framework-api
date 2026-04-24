import { FullConfig, request } from '@playwright/test';
import { UserService }         from '@services/UserService';
import { AuthService }         from '@services/AuthService';
import { createUserPayload }   from '@test-data/payloads';
import { writeJson }           from '@utils/file';
import { createLogger }        from '@utils/logger';
import { generateRunId }       from '@utils/date';
import { ENV }                 from '@config/env';

const logger = createLogger('GlobalSetup');

// ─── Seeded Data Shape ────────────────────────────────────────────────────────
// Written to file — read by globalTeardown for cleanup
export interface SeededData {
  runId:       string;
  environment: string;
  timestamp:   string;
  users: Array<{
    email:    string;
    password: string;
    name:     string;
  }>;
}

// ─── Global Setup ─────────────────────────────────────────────────────────────
// Runs ONCE before the entire test suite
async function globalSetup(_config: FullConfig): Promise<void> {
  const runId = generateRunId();
  logger.info('═══════════════════════════════════════════');
  logger.info('Global Setup Starting');
  logger.info(`Run ID      : ${runId}`);
  logger.info(`Environment : ${ENV.environment.toUpperCase()}`);
  logger.info(`Base URL    : ${ENV.baseUrl}`);
  logger.info('═══════════════════════════════════════════');

  // ─── Create HTTP context for setup operations ────────────────────────────
  const context = await request.newContext({
    baseURL:           ENV.baseUrl,
    ignoreHTTPSErrors: true,
  });

  const seededData: SeededData = {
    runId,
    environment: ENV.environment,
    timestamp:   new Date().toISOString(),
    users:       [],
  };

  try {
    // ─── Step 1: Validate environment is reachable ─────────────────────────
    logger.info('Step 1: Validating environment connectivity...');
    const authService = new AuthService(context);
    const authState   = await authService.verifyAndStoreDefault();

    if (!authState.isAuthenticated) {
      throw new Error(
        `❌ Environment validation failed — could not authenticate with test credentials.\n` +
        `   Email: ${ENV.testUserEmail}\n` +
        `   Check that TEST_USER_EMAIL and TEST_USER_PASSWORD in ${ENV.environment === 'local' ? '.env' : `.env.${ENV.environment}`} are correct\n` +
        `   and that this account exists on ${ENV.baseUrl}`
      );
    }
    logger.info('✅ Environment reachable — test credentials verified');

    // ─── Step 2: Seed fresh test users ────────────────────────────────────
    logger.info('Step 2: Seeding test users...');
    const userService = new UserService(context);

    // Create 2 seeded users — used across the test suite
    // These are created fresh each run with unique emails
    for (let i = 1; i <= 2; i++) {
      const payload = createUserPayload({
        name:      `Seeded User ${i} ${runId}`,
        firstname: `Seeded${i}`,
        lastname:  'User',
      });

      try {
        const { body } = await userService.createUser(payload);

        if (body.responseCode === 201) {
          seededData.users.push({
            email:    payload.email,
            password: payload.password,
            name:     payload.name,
          });
          logger.info(`✅ Seeded user ${i} created`, { email: payload.email });
        } else {
          logger.warn(`⚠️  Seeded user ${i} creation returned unexpected response`, {
            responseCode: body.responseCode,
            message:      body.message,
          });
        }
      } catch (err) {
        logger.warn(`⚠️  Failed to seed user ${i} — tests may still pass`, {
          error: String(err),
        });
      }
    }

    // ─── Step 3: Write seeded data to file ────────────────────────────────
    logger.info('Step 3: Writing seeded data to file...');
    writeJson('test-results/seeded-data.json', seededData);
    logger.info(`✅ Seeded data written — ${seededData.users.length} users created`);

  } catch (err) {
    logger.error('❌ Global setup failed', { error: String(err) });
    throw err;
  } finally {
    await context.dispose();
  }

  logger.info('═══════════════════════════════════════════');
  logger.info('Global Setup Complete');
  logger.info(`Seeded users : ${seededData.users.length}`);
  logger.info('═══════════════════════════════════════════\n');
}

export default globalSetup;
