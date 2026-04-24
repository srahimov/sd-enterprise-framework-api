// ─── Date Utilities ───────────────────────────────────────────────────────────
// All functions work with plain strings — the API uses string dates
// No external date library needed — native Date is sufficient here

// ─── Format a Date to ISO string ─────────────────────────────────────────────
// Returns: "2024-05-15T10:30:00.000Z"
export const toISOString = (date: Date = new Date()): string =>
  date.toISOString();

// ─── Get current timestamp ────────────────────────────────────────────────────
// Returns: "2024-05-15T10:30:00.000Z"
export const now = (): string => new Date().toISOString();

// ─── Format date for logging ──────────────────────────────────────────────────
// Returns: "2024-05-15 10:30:00"
export const formatForLog = (date: Date = new Date()): string => {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

// ─── Add days to a date ───────────────────────────────────────────────────────
// Usage: addDays(new Date(), 7) → 7 days from now
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ─── Subtract days from a date ────────────────────────────────────────────────
export const subtractDays = (date: Date, days: number): Date =>
  addDays(date, -days);

// ─── Check if a date is in the past ──────────────────────────────────────────
export const isPast = (date: Date): boolean => date < new Date();

// ─── Check if a date is in the future ────────────────────────────────────────
export const isFuture = (date: Date): boolean => date > new Date();

// ─── Get timestamp in ms ─────────────────────────────────────────────────────
// Used for measuring request duration
export const timestamp = (): number => Date.now();

// ─── Calculate duration between two timestamps ────────────────────────────────
// Usage: const start = timestamp(); ... const duration = getDuration(start);
export const getDuration = (startMs: number): number => Date.now() - startMs;

// ─── Format duration for logging ─────────────────────────────────────────────
// Usage: formatDuration(1523) → "1523ms"
export const formatDuration = (ms: number): string => `${ms}ms`;

// ─── Generate a unique test run ID ────────────────────────────────────────────
// Used to tag test data created in a specific run for easy cleanup
// Returns: "run_20240515_103000"
export const generateRunId = (): string => {
  const d   = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `run_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
};
