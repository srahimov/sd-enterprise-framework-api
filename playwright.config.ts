import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

require('tsconfig-paths/register');

const environment = process.env.ENV || 'local';

const envFileMap: Record<string, string> = {
  local:   '.env',
  qa:      '.env.qa',
  staging: '.env.staging',
};

const envFile = envFileMap[environment];

if (!envFile) {
  throw new Error(
    `❌ Unknown environment: "${environment}". ` +
    `Valid options are: local, qa, staging`
  );
}

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`\n🌍 Environment : ${environment.toUpperCase()}`);
console.log(`📄 Loaded file : ${envFile}`);
console.log(`📡 Base URL    : ${process.env.BASE_URL}\n`);

export default defineConfig({

  testDir: './src/tests',
  testMatch: '**/*.spec.ts',

  globalSetup:    './src/fixtures/globalSetup.ts',
  globalTeardown: './src/fixtures/globalTeardown.ts',

  outputDir: './test-results',

  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,

  retries: process.env.CI ? 2 : 0,

  timeout: Number(process.env.API_TIMEOUT) || 10000,
  expect: {
    timeout: 5000,
  },

  reporter: [
    ['allure-playwright', {
      detail: true,
      outputFolder: 'reports/allure-results',
      suiteTitle: false,
      environmentInfo: {
        Environment: environment,
        BaseURL:      process.env.BASE_URL || '',
        NodeVersion:  process.version,
      },
    }],
    ['html', {
      outputFolder: 'reports/html',
      open: 'never',
    }],
    ['junit', {
      outputFile: 'reports/junit/results.xml',
    }],
    ['line'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://automationexercise.com',
    extraHTTPHeaders: {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    },
    trace:              'retain-on-failure',
    ignoreHTTPSErrors:  true,
  },

  projects: [
    { name: 'auth-tests',     testMatch: '**/auth.api.spec.ts'     },
    { name: 'user-tests',     testMatch: '**/user.api.spec.ts'     },
    { name: 'product-tests',  testMatch: '**/products.api.spec.ts' },
    { name: 'brand-tests',    testMatch: '**/brands.api.spec.ts'   },
    { name: 'search-tests',   testMatch: '**/search.api.spec.ts'   },
    { name: 'negative-tests', testMatch: '**/negative.api.spec.ts' },
    { name: 'contract-tests', testMatch: '**/contract.api.spec.ts' },
  ],
});
