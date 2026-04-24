import * as fs   from 'fs';
import * as path from 'path';
import { createLogger } from './logger';

const logger = createLogger('FileUtil');

// ─── Resolve path from project root ──────────────────────────────────────────
export const resolvePath = (...segments: string[]): string =>
  path.resolve(process.cwd(), ...segments);

// ─── Check if file exists ─────────────────────────────────────────────────────
export const fileExists = (filePath: string): boolean =>
  fs.existsSync(resolvePath(filePath));

// ─── Ensure directory exists ──────────────────────────────────────────────────
export const ensureDir = (dirPath: string): void => {
  const resolved = resolvePath(dirPath);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
    logger.debug(`Created directory: ${resolved}`);
  }
};

// ─── Read JSON file ───────────────────────────────────────────────────────────
// Returns typed data or null if file doesn't exist
// Usage: const users = readJson<User[]>('test-results/seeded-users.json')
export const readJson = <T>(filePath: string): T | null => {
  const resolved = resolvePath(filePath);
  if (!fs.existsSync(resolved)) {
    logger.warn(`File not found: ${resolved}`);
    return null;
  }
  try {
    const content = fs.readFileSync(resolved, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    logger.error(`Failed to read JSON file: ${resolved}`, { err });
    throw err;
  }
};

// ─── Write JSON file ──────────────────────────────────────────────────────────
// Creates parent directories if they don't exist
// Usage: writeJson('test-results/seeded-users.json', users)
export const writeJson = <T>(filePath: string, data: T): void => {
  const resolved = resolvePath(filePath);
  ensureDir(path.dirname(resolved));
  try {
    fs.writeFileSync(resolved, JSON.stringify(data, null, 2), 'utf-8');
    logger.debug(`Written JSON file: ${resolved}`);
  } catch (err) {
    logger.error(`Failed to write JSON file: ${resolved}`, { err });
    throw err;
  }
};

// ─── Delete file ──────────────────────────────────────────────────────────────
export const deleteFile = (filePath: string): void => {
  const resolved = resolvePath(filePath);
  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
    logger.debug(`Deleted file: ${resolved}`);
  }
};

// ─── Delete directory recursively ────────────────────────────────────────────
export const deleteDir = (dirPath: string): void => {
  const resolved = resolvePath(dirPath);
  if (fs.existsSync(resolved)) {
    fs.rmSync(resolved, { recursive: true, force: true });
    logger.debug(`Deleted directory: ${resolved}`);
  }
};

// ─── List files in directory ──────────────────────────────────────────────────
export const listFiles = (dirPath: string, extension?: string): string[] => {
  const resolved = resolvePath(dirPath);
  if (!fs.existsSync(resolved)) return [];
  const files = fs.readdirSync(resolved);
  return extension
    ? files.filter((f) => f.endsWith(extension))
    : files;
};

// ─── Append to log file ───────────────────────────────────────────────────────
export const appendLog = (filePath: string, line: string): void => {
  const resolved = resolvePath(filePath);
  ensureDir(path.dirname(resolved));
  fs.appendFileSync(resolved, `${line}\n`, 'utf-8');
};
