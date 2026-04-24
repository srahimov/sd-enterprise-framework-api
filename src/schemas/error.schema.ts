import { z } from 'zod';

// ─── Base Error Schema ────────────────────────────────────────────────────────
// All automationexercise.com error responses share this shape
// { "responseCode": 4xx, "message": "..." }
export const BaseErrorSchema = z.object({
  responseCode: z.number(),
  message:      z.string().min(1),
});

// ─── Method Not Allowed Schema ────────────────────────────────────────────────
// API 2, 4, 9 — POST/PUT/DELETE to unsupported endpoints
// { "responseCode": 405, "message": "This request method is not supported." }
export const MethodNotAllowedSchema = z.object({
  responseCode: z.literal(405),
  message:      z.literal('This request method is not supported.'),
});

// ─── Missing Search Param Schema ─────────────────────────────────────────────
// API 6 — POST /api/searchProduct without search_product param
// { "responseCode": 400, "message": "Bad request, search_product parameter is missing in POST request." }
export const MissingSearchParamSchema = z.object({
  responseCode: z.literal(400),
  message:      z.literal(
    'Bad request, search_product parameter is missing in POST request.'
  ),
});

// ─── Missing Email Or Password Schema ────────────────────────────────────────
// API 8 — POST /api/verifyLogin without email param
// { "responseCode": 400, "message": "Bad request, email or password parameter is missing in POST request." }
export const MissingEmailOrPasswordSchema = z.object({
  responseCode: z.literal(400),
  message:      z.literal(
    'Bad request, email or password parameter is missing in POST request.'
  ),
});

// ─── User Not Found Schema ────────────────────────────────────────────────────
// API 10 — POST /api/verifyLogin with invalid credentials
// { "responseCode": 404, "message": "User not found!" }
export const UserNotFoundSchema = z.object({
  responseCode: z.literal(404),
  message:      z.literal('User not found!'),
});

// ─── Generic 4xx Error Schema ─────────────────────────────────────────────────
// Flexible schema for any client error response
// Used when exact message is not being asserted
export const ClientErrorSchema = z.object({
  responseCode: z.number().min(400).max(499),
  message:      z.string().min(1),
});

// ─── Generic 5xx Error Schema ─────────────────────────────────────────────────
export const ServerErrorSchema = z.object({
  responseCode: z.number().min(500).max(599),
  message:      z.string().min(1),
});

// ─── Union — any valid error response ────────────────────────────────────────
// Use this when you want to validate it IS an error but don't care which type
export const AnyErrorSchema = z.union([
  MethodNotAllowedSchema,
  MissingSearchParamSchema,
  MissingEmailOrPasswordSchema,
  UserNotFoundSchema,
  ClientErrorSchema,
  ServerErrorSchema,
]);

// ─── Inferred Types from Schemas ──────────────────────────────────────────────
export type BaseError              = z.infer<typeof BaseErrorSchema>;
export type MethodNotAllowedError  = z.infer<typeof MethodNotAllowedSchema>;
export type MissingSearchParam     = z.infer<typeof MissingSearchParamSchema>;
export type MissingEmailOrPassword = z.infer<typeof MissingEmailOrPasswordSchema>;
export type UserNotFound           = z.infer<typeof UserNotFoundSchema>;
