import * as https  from 'https';
import * as http   from 'http';
import * as path   from 'path';
import * as fs     from 'fs';
import * as dotenv from 'dotenv';

// ─── Load environment ─────────────────────────────────────────────────────────
const environment = process.env.ENV || 'local';
const envFileMap: Record<string, string> = {
  local:   '.env',
  qa:      '.env.qa',
  staging: '.env.staging',
};
dotenv.config({ path: path.resolve(process.cwd(), envFileMap[environment] || '.env') });

const BASE_URL  = process.env.BASE_URL  || 'https://automationexercise.com';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ─── Logger ───────────────────────────────────────────────────────────────────
const log = {
  info:  (msg: string) => console.log(`  ℹ️  ${msg}`),
  ok:    (msg: string) => console.log(`  ✅ ${msg}`),
  warn:  (msg: string) => console.log(`  ⚠️  ${msg}`),
  error: (msg: string) => console.error(`  ❌ ${msg}`),
  debug: (msg: string) => { if (LOG_LEVEL === 'debug') console.log(`  🔍 ${msg}`); },
};

// ─── HTTP POST helper ─────────────────────────────────────────────────────────
// Lightweight HTTP client — no external dependencies needed in scripts
const httpPost = (
  url:      string,
  formData: Record<string, string>
): Promise<{ status: number; body: Record<string, unknown> }> => {
  return new Promise((resolve, reject) => {
    const params   = new URLSearchParams(formData).toString();
    const urlObj   = new URL(url);
    const isHttps  = urlObj.protocol === 'https:';
    const options  = {
      hostname: urlObj.hostname,
      port:     urlObj.port || (isHttps ? 443 : 80),
      path:     urlObj.pathname + urlObj.search,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params),
      },
    };

    const transport = isHttps ? https : http;
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode || 0,
            body:   JSON.parse(data) as Record<string, unknown>,
          });
        } catch {
          resolve({ status: res.statusCode || 0, body: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    req.write(params);
    req.end();
  });
};

// ─── Generate unique email ────────────────────────────────────────────────────
const generateEmail = (prefix: string): string =>
  `${prefix}.seed.${Date.now()}@example.com`;

// ─── Seeded Data Types ────────────────────────────────────────────────────────
interface SeededUser {
  email:    string;
  password: string;
  name:     string;
}

interface SeededData {
  runId:       string;
  environment: string;
  timestamp:   string;
  users:       SeededUser[];
}

// ─── Ensure directory exists ──────────────────────────────────────────────────
const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ─── Create test user via API ─────────────────────────────────────────────────
const createTestUser = async (userData: Record<string, string>): Promise<boolean> => {
  log.debug(`Creating user: ${userData['email']}`);

  const result = await httpPost(
    `${BASE_URL}/api/createAccount`,
    userData
  );

  if (result.status === 201 && result.body['responseCode'] === 201) {
    log.ok(`Created user: ${userData['email']}`);
    return true;
  }

  log.warn(`Failed to create user ${userData['email']}: ${JSON.stringify(result.body)}`);
  return false;
};

// ─── Delete test user via API ─────────────────────────────────────────────────
const deleteTestUser = async (email: string, password: string): Promise<boolean> => {
  log.debug(`Deleting user: ${email}`);

  const result = await httpPost(
    `${BASE_URL}/api/deleteAccount`,
    { email, password }
  );

  if (result.status === 200) {
    log.ok(`Deleted user: ${email}`);
    return true;
  }

  log.warn(`Could not delete user ${email}: ${JSON.stringify(result.body)}`);
  return false;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedData = async (): Promise<void> => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🌱 Seeding Test Data');
  console.log(`  Environment : ${environment.toUpperCase()}`);
  console.log(`  Base URL    : ${BASE_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const runId      = `seed_${Date.now()}`;
  const seededData: SeededData = {
    runId,
    environment,
    timestamp: new Date().toISOString(),
    users:     [],
  };

  // ─── Define users to seed ──────────────────────────────────────────────────
  const usersToSeed = [
    {
      name:          'Seed User One',
      email:         generateEmail('seed1'),
      password:      'SeedPass@123',
      title:         'Mr',
      birth_date:    '10',
      birth_month:   '5',
      birth_year:    '1990',
      firstname:     'Seed',
      lastname:      'One',
      company:       'Seed Corp',
      address1:      '1 Seed Street',
      address2:      '',
      country:       'United States',
      zipcode:       '10001',
      state:         'New York',
      city:          'New York',
      mobile_number: '5551234567',
    },
    {
      name:          'Seed User Two',
      email:         generateEmail('seed2'),
      password:      'SeedPass@456',
      title:         'Mrs',
      birth_date:    '20',
      birth_month:   '8',
      birth_year:    '1992',
      firstname:     'Seed',
      lastname:      'Two',
      company:       'Seed Corp',
      address1:      '2 Seed Avenue',
      address2:      '',
      country:       'Canada',
      zipcode:       'M5V 3A8',
      state:         'Ontario',
      city:          'Toronto',
      mobile_number: '5559876543',
    },
  ];

  // ─── Create users ──────────────────────────────────────────────────────────
  log.info(`Creating ${usersToSeed.length} seed users...`);

  for (const userData of usersToSeed) {
    const created = await createTestUser(userData);
    if (created) {
      seededData.users.push({
        email:    userData['email'],
        password: userData['password'],
        name:     userData['name'],
      });
    }
  }

  // ─── Write seeded data to file ────────────────────────────────────────────
  ensureDir(path.resolve(process.cwd(), 'test-results'));
  const outputPath = path.resolve(process.cwd(), 'test-results/seeded-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(seededData, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ Seeding complete`);
  console.log(`  Users created : ${seededData.users.length}/${usersToSeed.length}`);
  console.log(`  Data file     : test-results/seeded-data.json`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// ─── Clean Seeded Data ────────────────────────────────────────────────────────
const cleanSeedData = async (): Promise<void> => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🧹 Cleaning Seeded Data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const dataPath = path.resolve(process.cwd(), 'test-results/seeded-data.json');

  if (!fs.existsSync(dataPath)) {
    log.warn('No seeded-data.json found — nothing to clean');
    return;
  }

  const seededData = JSON.parse(
    fs.readFileSync(dataPath, 'utf-8')
  ) as SeededData;

  log.info(`Found ${seededData.users.length} users to delete...`);

  let deleted = 0;
  for (const user of seededData.users) {
    const success = await deleteTestUser(user.email, user.password);
    if (success) deleted++;
  }

  // Remove the data file
  fs.unlinkSync(dataPath);
  log.ok('Removed seeded-data.json');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ✅ Cleanup complete — deleted ${deleted} users`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// ─── Entry Point ──────────────────────────────────────────────────────────────
const isClean = process.argv.includes('--clean');

if (isClean) {
  cleanSeedData().catch((err) => {
    console.error('Seed cleanup failed:', err);
    process.exit(1);
  });
} else {
  seedData().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
