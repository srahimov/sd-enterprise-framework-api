import { AutomationExerciseResponse } from './common';

// ─── Brand ────────────────────────────────────────────────────────────────────
// Shape of a single brand in GET /api/brandsList response
export interface Brand {
  id:   number;
  brand: string;   // e.g. "Polo", "H&M", "Madame"
}

// ─── Brands List Response ─────────────────────────────────────────────────────
// GET /api/brandsList
// { "responseCode": 200, "brands": [...] }
export interface BrandsListResponse {
  responseCode: number;
  brands:       Brand[];
}

// ─── Method Not Allowed Response ─────────────────────────────────────────────
// PUT /api/brandsList → 405
export interface BrandMethodNotAllowedResponse extends AutomationExerciseResponse {
  responseCode: 405;
  message:      'This request method is not supported.';
}
