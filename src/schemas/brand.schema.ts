import { z } from 'zod';

// ─── Brand Schema ─────────────────────────────────────────────────────────────
// Single brand shape inside GET /api/brandsList
// { "id": 1, "brand": "Polo" }
export const BrandSchema = z.object({
  id:    z.number().positive(),
  brand: z.string().min(1),   // e.g. "Polo", "H&M", "Madame"
});

// ─── Brands List Response Schema ──────────────────────────────────────────────
// GET /api/brandsList
// { "responseCode": 200, "brands": [...] }
export const BrandsListResponseSchema = z.object({
  responseCode: z.number(),
  brands:       z.array(BrandSchema).min(1),  // Must have at least one brand
});

// ─── Inferred Types from Schemas ──────────────────────────────────────────────
export type BrandFromSchema              = z.infer<typeof BrandSchema>;
export type BrandsListResponseFromSchema = z.infer<typeof BrandsListResponseSchema>;
