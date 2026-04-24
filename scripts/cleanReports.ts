import * as fs   from 'fs';
import * as path from 'path';

// ─── Directories to clean ─────────────────────────────────────────────────────
// These are all generated — safe to delete before every run
const CLEAN_DIRS = [
  'reports/allure-results',
  'reports/allure-report',
  'reports/html',
  'reports/junit',
  'test-results/logs',
  'test-results',
];

// ─── Directories to recreate after cleaning ───────────────────────────────────
// Reporters expect these to exist — create them empty after deletion
const RECREATE_DIRS = [
  'reports/allure-results',
  'reports/allure-report',
  'reports/html',
  'reports/junit',
  'test-results/logs',
];

// ─── Resolve path from project root ──────────────────────────────────────────
const resolve = (...segments: string[]): string =>
  path.resolve(process.cwd(), ...segments);

// ─── Delete directory ─────────────────────────────────────────────────────────
const deleteDir = (dirPath: string): void => {
  const resolved = resolve(dirPath);
  if (fs.existsSync(resolved)) {
    fs.rmSync(resolved, { recursive: true, force: true });
    console.log(`  🗑  Deleted  : ${dirPath}`);
  } else {
    console.log(`  ⏭  Skipped  : ${dirPath} (does not exist)`);
  }
};

// ─── Create directory ─────────────────────────────────────────────────────────
const createDir = (dirPath: string): void => {
  const resolved = resolve(dirPath);
  fs.mkdirSync(resolved, { recursive: true });
  console.log(`  📁 Created  : ${dirPath}`);
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const cleanReports = (): void => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🧹 Cleaning Reports & Artifacts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ─── Step 1: Delete all generated directories
  console.log('\n  Deleting generated directories...');
  for (const dir of CLEAN_DIRS) {
    deleteDir(dir);
  }

  // ─── Step 2: Recreate empty directory structure
  console.log('\n  Recreating directory structure...');
  for (const dir of RECREATE_DIRS) {
    createDir(dir);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Clean complete — ready for new run');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

cleanReports();
