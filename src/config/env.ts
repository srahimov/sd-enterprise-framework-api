import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';

// ─── Load correct .env file ───────────────────────────────────────────────────
// This handles cases where env.ts is imported directly (e.g. from scripts)
// outside of the playwright.config.ts bootstrap flow
const environment = process.env.ENV || 'local';

const envFileMap: Record<string, string> = {
  local:   '.env',
  qa:      '.env.qa',
  staging: '.env.staging',
};

const envFile = envFileMap[environment];

if (!envFile) {
  throw new Error(
    `❌ Unknown environment: "${environment}". Valid options are: local, qa, staging`
  );
}

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// ─── Zod Schema — defines required + optional env vars ───────────────────────
// z.coerce.number() — converts string "10000" → number 10000 automatically
// .default() — provides fallback if variable is not set
const EnvSchema = z.object({

  // ─── Core ────────────────────────────────────────────────────────────────
  ENV: z.enum(['local', 'qa', 'staging']).default('local'),
  BASE_URL: z.string().url({ message: '❌ BASE_URL must be a valid URL' }),

  // ─── Test Account Credentials ────────────────────────────────────────────
  TEST_USER_EMAIL: z.string().email({ message: '❌ TEST_USER_EMAIL must be a valid email' }),
  TEST_USER_PASSWORD: z.string().min(1, { message: '❌ TEST_USER_PASSWORD is required' }),

  // ─── New User Template (used by seedTestData) ────────────────────────────
  NEW_USER_NAME:     z.string().min(1).default('Test User'),
  NEW_USER_EMAIL:    z.string().email().default('newuser@example.com'),
  NEW_USER_PASSWORD: z.string().min(1).default('NewPass@123'),

  // ─── Behaviour Settings ───────────────────────────────────────────────────
  API_TIMEOUT: z.coerce.number().min(1000).max(60000).default(10000),
  RETRY_COUNT: z.coerce.number().min(0).max(5).default(2),
  LOG_LEVEL:   z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// ─── Validate process.env against schema ─────────────────────────────────────
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Environment validation failed:');
  console.error('────────────────────────────────────────');
  parsed.error.errors.forEach((err) => {
    console.error(`  • ${err.path.join('.')}: ${err.message}`);
  });
  console.error('────────────────────────────────────────');
  console.error(`  Check your ${envFile} file\n`);
  throw new Error('Environment validation failed. See errors above.');
}

// ─── Export validated, typed ENV object ──────────────────────────────────────
// Use this throughout the framework — NEVER use process.env directly
export const ENV = {
  // Core
  environment:       parsed.data.ENV,
  baseUrl:           parsed.data.BASE_URL,

  // Test Account
  testUserEmail:     parsed.data.TEST_USER_EMAIL,
  testUserPassword:  parsed.data.TEST_USER_PASSWORD,

  // New User Template
  newUserName:       parsed.data.NEW_USER_NAME,
  newUserEmail:      parsed.data.NEW_USER_EMAIL,
  newUserPassword:   parsed.data.NEW_USER_PASSWORD,

  // Behaviour
  apiTimeout:        parsed.data.API_TIMEOUT,
  retryCount:        parsed.data.RETRY_COUNT,
  logLevel:          parsed.data.LOG_LEVEL,

  // ─── Computed helpers ──────────────────────────────────────────────────
  isLocal:   parsed.data.ENV === 'local',
  isQA:      parsed.data.ENV === 'qa',
  isStaging: parsed.data.ENV === 'staging',
  isCI:      process.env.CI === 'true',
} as const;

// ─── Type export — use this to type any function that receives ENV ────────────
export type EnvConfig = typeof ENV;
