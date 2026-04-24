import { z } from 'zod';

// ─── Title Schema ─────────────────────────────────────────────────────────────
export const UserTitleSchema = z.enum(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']);

// ─── User Detail Schema ───────────────────────────────────────────────────────
// Validates the nested user object inside GET /api/getUserDetailByEmail
export const UserDetailSchema = z.object({
  id:            z.coerce.number().positive(),
  name:          z.string().min(1),
  email:         z.string().email(),
  title:         UserTitleSchema,
  birth_day:     z.string().min(1),
  birth_month:   z.string().min(1),
  birth_year:    z.string().min(1),
  first_name:    z.string().min(1),
  last_name:     z.string().min(1),
  company:       z.string().optional().default(''),
  address1:      z.string().min(1),
  address2:      z.string().optional().default(''),
  country:       z.string().min(1),
  zipcode:       z.string().min(1),
  state:         z.string().min(1),
  city:          z.string().min(1),
  mobile_number: z.string().min(1),
});

// ─── Get User Response Schema ─────────────────────────────────────────────────
// GET /api/getUserDetailByEmail?email=x
// { "responseCode": 200, "user": { ...UserDetail } }
export const GetUserResponseSchema = z.object({
  responseCode: z.number(),
  user:         UserDetailSchema,
});

// ─── User Mutation Response Schema ────────────────────────────────────────────
// Shared schema for create / update / delete responses
// { "responseCode": 200, "message": "User created!" }
export const UserMutationResponseSchema = z.object({
  responseCode: z.number(),
  message:      z.string().min(1),
});

// ─── Create User Request Schema ───────────────────────────────────────────────
// Validates outgoing create user payloads before sending
export const CreateUserRequestSchema = z.object({
  name:          z.string().min(1),
  email:         z.string().email(),
  password:      z.string().min(6),
  title:         UserTitleSchema,
  birth_date:    z.string().min(1),
  birth_month:   z.string().min(1),
  birth_year:    z.string().min(4).max(4),
  firstname:     z.string().min(1),
  lastname:      z.string().min(1),
  company:       z.string().optional().default(''),
  address1:      z.string().min(1),
  address2:      z.string().optional().default(''),
  country:       z.string().min(1),
  zipcode:       z.string().min(1),
  state:         z.string().min(1),
  city:          z.string().min(1),
  mobile_number: z.string().min(1),
});

// ─── Inferred Types from Schemas ──────────────────────────────────────────────
// These replace the manual types in types/user.ts for runtime-validated contexts
export type UserDetailFromSchema      = z.infer<typeof UserDetailSchema>;
export type GetUserResponseFromSchema = z.infer<typeof GetUserResponseSchema>;
export type CreateUserFromSchema      = z.infer<typeof CreateUserRequestSchema>;
