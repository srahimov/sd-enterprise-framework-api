import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { ENV } from '@config/env';

// ─── Ensure log directory exists ──────────────────────────────────────────────
const LOG_DIR = path.resolve(process.cwd(), 'test-results/logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Custom Log Format ────────────────────────────────────────────────────────
const terminalFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : '';
    return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ─── Winston Logger Instance ──────────────────────────────────────────────────
const winstonLogger = winston.createLogger({
  level: ENV.logLevel,
  transports: [
    new winston.transports.Console({
      format: terminalFormat,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'framework.log'),
      format:   fileFormat,
      maxsize:  10 * 1024 * 1024,
      maxFiles: 3,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'errors.log'),
      level:    'error',
      format:   fileFormat,
    }),
  ],
});

// ─── Whether to log bodies ────────────────────────────────────────────────────
// Log full bodies locally and in QA — hide in staging to avoid PII in logs
const shouldLogBody = ENV.isLocal || ENV.isQA;

// ─── Logger Class ─────────────────────────────────────────────────────────────
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.debug(message, { context: this.context, ...meta });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.info(message, { context: this.context, ...meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.warn(message, { context: this.context, ...meta });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    winstonLogger.error(message, { context: this.context, ...meta });
  }

  // ─── Request Logger ────────────────────────────────────────────────────────
  logRequest(method: string, url: string, body?: unknown): void {
    this.debug(`→ REQUEST ${method} ${url}`, {
      method,
      url,
      body: shouldLogBody ? body : '[hidden — staging]',
    });
  }

  // ─── Response Logger ───────────────────────────────────────────────────────
  logResponse(
    method:   string,
    url:      string,
    status:   number,
    duration: number,
    body?:    unknown
  ): void {
    const level = status >= 400 ? 'warn' : 'debug';
    winstonLogger[level](`← RESPONSE ${status} ${method} ${url} (${duration}ms)`, {
      context:  this.context,
      method,
      url,
      status,
      duration,
      body: shouldLogBody ? body : '[hidden — staging]',
    });
  }

  // ─── Child Logger ──────────────────────────────────────────────────────────
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }
}

// ─── Factory function ─────────────────────────────────────────────────────────
export const createLogger = (context: string): Logger => new Logger(context);

// ─── Default logger ───────────────────────────────────────────────────────────
export const logger = createLogger('Framework');

export { Logger };
