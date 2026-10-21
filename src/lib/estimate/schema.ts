import type { DamageAnalysis } from "./types";

const str = { type: "string" };
const num = { type: "number" };

function obj(properties: Record<string, unknown>) {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}

/** JSON schema the model's response is constrained to (structured outputs). */
export const DAMAGE_ANALYSIS_SCHEMA = obj({
  photo_quality: {
    type: "array",
    items: obj({
      photo_index: { type: "integer" },
      clarity: { type: "string", enum: ["good", "fair", "poor"] },
      shows_damage: { type: "boolean" },
      issues: str,
    }),
  },
  overall_photo_feedback: str,
  retake_recommended: { type: "boolean" },
  vehicle_observed: str,
  confirmed_damages: {
    type: "array",
    items: obj({
      area: str,
      damage_type: str,
      severity: { type: "string", enum: ["minor", "moderate", "severe"] },
      description: str,
      repair_method: {
        type: "string",
        enum: [
          "paintless_dent_repair",
          "repair_and_refinish",
          "replace_and_refinish",
          "replace",
          "refinish_only",
          "polish_buff",
        ],
      },
      body_labor_hours_low: num,
      body_labor_hours_high: num,
      paint_labor_hours_low: num,
      paint_labor_hours_high: num,
      parts_cost_low: num,
      parts_cost_high: num,
      photo_indices: { type: "array", items: { type: "integer" } },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
    }),
  },
  potential_damages: {
    type: "array",
    items: obj({
      area: str,
      concern: str,
      reason: str,
      likelihood: { type: "string", enum: ["likely", "possible", "unlikely"] },
      labor_hours_low: num,
      labor_hours_high: num,
      parts_cost_low: num,
      parts_cost_high: num,
      inspection_note: str,
    }),
  },
  summary: str,
  safety_notes: str,
});

/** Model output is schema-shaped, but numbers still need guarding: no negatives, low <= high. */
function pair(a: unknown, b: unknown): [number, number] {
  const x = Math.max(0, Number(a) || 0);
  const y = Math.max(0, Number(b) || 0);
  return x <= y ? [x, y] : [y, x];
}

export function sanitizeAnalysis(raw: DamageAnalysis, photoCount: number): DamageAnalysis {
  const validIndex = (i: number) => Number.isInteger(i) && i >= 1 && i <= photoCount;

  return {
    ...raw,
    photo_quality: (raw.photo_quality ?? []).filter((p) => validIndex(p.photo_index)),
    confirmed_damages: (raw.confirmed_damages ?? []).map((d) => {
      const [bl, bh] = pair(d.body_labor_hours_low, d.body_labor_hours_high);
      const [pl, ph] = pair(d.paint_labor_hours_low, d.paint_labor_hours_high);
      const [cl, ch] = pair(d.parts_cost_low, d.parts_cost_high);
      return {
        ...d,
        body_labor_hours_low: bl,
        body_labor_hours_high: bh,
        paint_labor_hours_low: pl,
        paint_labor_hours_high: ph,
        parts_cost_low: cl,
        parts_cost_high: ch,
        photo_indices: (d.photo_indices ?? []).filter(validIndex),
      };
    }),
    potential_damages: (raw.potential_damages ?? []).map((d) => {
      const [ll, lh] = pair(d.labor_hours_low, d.labor_hours_high);
      const [cl, ch] = pair(d.parts_cost_low, d.parts_cost_high);
      return { ...d, labor_hours_low: ll, labor_hours_high: lh, parts_cost_low: cl, parts_cost_high: ch };
    }),
  };
}
