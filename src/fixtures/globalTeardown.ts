import { FullConfig, request } from '@playwright/test';
import { UserService }         from '@services/UserService';
import { readJson, deleteFile } from '@utils/file';
import { createLogger }        from '@utils/logger';
import { ENV }                 from '@config/env';
import { SeededData }          from './globalSetup';

const logger = createLogger('GlobalTeardown');

// ─── Global Teardown ──────────────────────────────────────────────────────────
// Runs ONCE after the entire test suite completes
async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.info('═══════════════════════════════════════════');
  logger.info('Global Teardown Starting');
  logger.info(`Environment : ${ENV.environment.toUpperCase()}`);
  logger.info('═══════════════════════════════════════════');

  // ─── Create HTTP context for teardown operations ─────────────────────────
  const context = await request.newContext({
    baseURL:           ENV.baseUrl,
    ignoreHTTPSErrors: true,
  });

  let deletedCount  = 0;
  let failedCount   = 0;

  try {
    // ─── Step 1: Read seeded data ──────────────────────────────────────────
    logger.info('Step 1: Reading seeded data from file...');
    const seededData = readJson<SeededData>('test-results/seeded-data.json');

    if (!seededData) {
      logger.warn('No seeded data file found — skipping cleanup');
      return;
    }

    logger.info(`Found ${seededData.users.length} seeded users to clean up`, {
      runId:       seededData.runId,
      environment: seededData.environment,
    });

    // ─── Step 2: Delete all seeded users ─────────────────────────────────
    logger.info('Step 2: Deleting seeded users...');
    const userService = new UserService(context);

    for (const user of seededData.users) {
      try {
        await userService.safeDelete(user.email, user.password);
        deletedCount++;
        logger.info(`✅ Deleted seeded user`, { email: user.email });
      } catch (err) {
        failedCount++;
        logger.warn(`⚠️  Failed to delete seeded user`, {
          email: user.email,
          error: String(err),
        });
      }
    }

    // ─── Step 3: Clean up seeded data file ────────────────────────────────
    logger.info('Step 3: Removing seeded data file...');
    deleteFile('test-results/seeded-data.json');
    logger.info('✅ Seeded data file removed');

  } catch (err) {
    logger.error('❌ Global teardown encountered an error', {
      error: String(err),
    });
    // Do NOT rethrow — teardown errors should not fail the test run
  } finally {
    await context.dispose();
  }

  logger.info('═══════════════════════════════════════════');
  logger.info('Global Teardown Complete');
  logger.info(`Deleted : ${deletedCount} users`);
  logger.info(`Failed  : ${failedCount} users`);
  logger.info('═══════════════════════════════════════════\n');
}

export default globalTeardown;
