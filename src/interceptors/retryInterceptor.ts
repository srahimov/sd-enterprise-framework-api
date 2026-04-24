import { RETRY_CONFIG } from '@config/apiConfig';
import { createLogger } from '@utils/logger';
import { getDuration, timestamp } from '@utils/date';

const logger = createLogger('RetryInterceptor');

// ─── Retry Options ────────────────────────────────────────────────────────────
export interface RetryOptions {
  maxRetries?:          number;
  retryDelay?:          number;
  retryableStatusCodes?: number[];
}

// ─── Sleep utility ────────────────────────────────────────────────────────────
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── Calculate backoff delay ──────────────────────────────────────────────────
// Exponential backoff: attempt 1 = 1s, attempt 2 = 2s, attempt 3 = 4s
// Capped at 10 seconds to avoid excessively long waits
const calculateBackoff = (attempt: number, baseDelay: number): number => {
  const exponential = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(exponential, 10000);
};

// ─── Retry Interceptor ────────────────────────────────────────────────────────
// Wraps any async function with retry logic
// Usage: const response = await retryInterceptor.execute(() => client.get(url))
export class RetryInterceptor {
  private maxRetries:          number;
  private retryDelay:          number;
  private retryableStatusCodes: number[];

  constructor(options?: RetryOptions) {
    this.maxRetries           = options?.maxRetries          ?? RETRY_CONFIG.maxRetries;
    this.retryDelay           = options?.retryDelay          ?? RETRY_CONFIG.retryDelay;
    this.retryableStatusCodes = options?.retryableStatusCodes ?? RETRY_CONFIG.retryableStatusCodes as unknown as number[];
  }

  // ─── Execute with retry ──────────────────────────────────────────────────
  // Executes the provided function, retrying on retryable status codes
  // T is the return type of the function (e.g. APIResponse)
  async execute<T extends { status(): number }>(
    fn:       () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError:    Error | null   = null;
    let lastResponse: T | null       = null;
    const start = timestamp();

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        logger.debug(
          `Executing request${context ? ` [${context}]` : ''} — attempt ${attempt}/${this.maxRetries + 1}`
        );

        const response = await fn();
        const status   = response.status();

        // ─── Not retryable — return immediately ────────────────────────────
        if (!this.retryableStatusCodes.includes(status)) {
          if (attempt > 1) {
            logger.info(
              `Request succeeded on attempt ${attempt} after ${getDuration(start)}ms`,
              { context, status }
            );
          }
          return response;
        }

        // ─── Retryable status — log and prepare for retry ──────────────────
        lastResponse = response;
        logger.warn(
          `Retryable status ${status} on attempt ${attempt}`,
          { context, status, attempt }
        );

        // ─── Last attempt — return the bad response ─────────────────────────
        if (attempt === this.maxRetries + 1) {
          logger.error(
            `All ${this.maxRetries + 1} attempts exhausted — returning last response`,
            { context, status }
          );
          return lastResponse;
        }

        // ─── Wait before retrying ───────────────────────────────────────────
        const delay = calculateBackoff(attempt, this.retryDelay);
        logger.debug(`Waiting ${delay}ms before retry ${attempt + 1}`, { context });
        await sleep(delay);

      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.warn(
          `Request threw on attempt ${attempt}: ${lastError.message}`,
          { context, attempt }
        );

        // Last attempt — rethrow
        if (attempt === this.maxRetries + 1) {
          logger.error(
            `All attempts exhausted — throwing last error`,
            { context, error: lastError.message }
          );
          throw lastError;
        }

        // Wait before retrying
        const delay = calculateBackoff(attempt, this.retryDelay);
        await sleep(delay);
      }
    }

    // Should never reach here — TypeScript requires a return
    if (lastError) throw lastError;
    return lastResponse!;
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────
export const retryInterceptor = new RetryInterceptor();
