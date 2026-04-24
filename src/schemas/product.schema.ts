import { z } from 'zod';

// ─── User Type Schema ─────────────────────────────────────────────────────────
// Nested inside CategorySchema
// { "usertype": "Women" }
export const UserTypeSchema = z.object({
  usertype: z.string().min(1),  // e.g. "Women", "Men", "Kids"
});

// ─── Category Schema ──────────────────────────────────────────────────────────
// Nested inside ProductSchema
// { "usertype": { "usertype": "Women" }, "category": "Tops" }
export const CategorySchema = z.object({
  usertype: UserTypeSchema,
  category: z.string().min(1),   // e.g. "Tops", "Tshirts", "Dress"
});

// ─── Product Schema ───────────────────────────────────────────────────────────
// Single product shape inside GET /api/productsList and POST /api/searchProduct
export const ProductSchema = z.object({
  id:       z.number().positive(),
  name:     z.string().min(1),
  price:    z.string().min(1),   // e.g. "Rs. 500" — string not number
  brand:    z.string().min(1),
  category: CategorySchema,
});

// ─── Products List Response Schema ───────────────────────────────────────────
// GET /api/productsList
// { "responseCode": 200, "products": [...] }
export const ProductsListResponseSchema = z.object({
  responseCode: z.number(),
  products:     z.array(ProductSchema).min(0),
});

// ─── Search Request Schema ────────────────────────────────────────────────────
// Validates outgoing search payload
export const SearchRequestSchema = z.object({
  search_product: z.string().min(1, {
    message: 'search_product parameter is required',
  }),
});

// ─── Search Response Schema ───────────────────────────────────────────────────
// POST /api/searchProduct
// { "responseCode": 200, "products": [...] }
// Reuses ProductSchema — same shape as products list
export const SearchResponseSchema = z.object({
  responseCode: z.number(),
  products:     z.array(ProductSchema).min(0),
});

// ─── Inferred Types from Schemas ──────────────────────────────────────────────
export type ProductFromSchema              = z.infer<typeof ProductSchema>;
export type ProductsListResponseFromSchema = z.infer<typeof ProductsListResponseSchema>;
export type SearchResponseFromSchema       = z.infer<typeof SearchResponseSchema>;
export type CategoryFromSchema             = z.infer<typeof CategorySchema>;
