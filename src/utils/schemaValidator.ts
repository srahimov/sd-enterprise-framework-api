import { z, ZodSchema, ZodError, ZodTypeAny } from 'zod';
import { createLogger } from './logger';

const logger = createLogger('SchemaValidator');

// ─── Validation Result ────────────────────────────────────────────────────────
export interface ValidationResult<T> {
  success: boolean;
  data?:   T;
  errors?: FormattedError[];
}

// ─── Formatted Error ──────────────────────────────────────────────────────────
export interface FormattedError {
  field:   string;
  message: string;
  value?:  unknown;
}

// ─── Format Zod Errors ────────────────────────────────────────────────────────
export const formatZodErrors = (error: ZodError): FormattedError[] => {
  return error.errors.map((err) => ({
    field:   err.path.join('.') || 'root',
    message: err.message,
    value:   undefined,
  }));
};

// ─── Format errors as readable string ────────────────────────────────────────
export const formatErrorsAsString = (errors: FormattedError[]): string => {
  return errors
    .map((e) => `  • ${e.field}: ${e.message}`)
    .join('\n');
};

// ─── Validate Schema ──────────────────────────────────────────────────────────
// Core validation function — returns typed result
// Usage: const result = validateSchema(ProductsListResponseSchema, responseBody)
export const validateSchema = <T>(
  schema:   ZodSchema<T>,
  data:     unknown,
  context?: string
): ValidationResult<T> => {
  const parsed = schema.safeParse(data);

  if (parsed.success) {
    logger.debug(`Schema validation passed${context ? ` [${context}]` : ''}`);
    return { success: true, data: parsed.data };
  }

  const errors = formatZodErrors(parsed.error);
  logger.warn(
    `Schema validation failed${context ? ` [${context}]` : ''}`,
    { errors }
  );

  return { success: false, errors };
};

// ─── Assert Schema ────────────────────────────────────────────────────────────
// Throws if validation fails — use directly in tests
// Usage: const data = assertSchema(ProductsListResponseSchema, body, 'GET /api/productsList')
export const assertSchema = <T>(
  schema:   ZodSchema<T>,
  data:     unknown,
  context?: string
): T => {
  const result = validateSchema(schema, data, context);

  if (!result.success && result.errors) {
    const errorMessage =
      `Schema validation failed${context ? ` for [${context}]` : ''}:\n` +
      formatErrorsAsString(result.errors);

    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return result.data as T;
};

// ─── Validate Partial Schema ──────────────────────────────────────────────────
// Validates only fields present — ignores missing optional fields
// Uses ZodTypeAny as base to avoid Zod internal type conflicts
export const validatePartialSchema = (
  schema:   z.ZodObject<z.ZodRawShape>,
  data:     unknown,
  context?: string
): ValidationResult<unknown> => {
  const partialSchema: ZodTypeAny = schema.partial();
  return validateSchema(partialSchema as ZodSchema<unknown>, data, context);
};

// ─── Is Valid Schema ──────────────────────────────────────────────────────────
// Returns boolean — use when branching on validity, not asserting
// Usage: if (isValidSchema(ProductSchema, item)) { ... }
export const isValidSchema = <T>(
  schema: ZodSchema<T>,
  data:   unknown
): data is T => {
  return schema.safeParse(data).success;
};
