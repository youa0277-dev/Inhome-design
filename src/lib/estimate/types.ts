export type Severity = "minor" | "moderate" | "severe";
export type Confidence = "high" | "medium" | "low";
export type Likelihood = "likely" | "possible" | "unlikely";
export type Clarity = "good" | "fair" | "poor";
export type RepairMethod =
  | "paintless_dent_repair"
  | "repair_and_refinish"
  | "replace_and_refinish"
  | "replace"
  | "refinish_only"
  | "polish_buff";

export interface PhotoQuality {
  photo_index: number;
  clarity: Clarity;
  shows_damage: boolean;
  issues: string;
}

export interface ConfirmedDamage {
  area: string;
  damage_type: string;
  severity: Severity;
  description: string;
  repair_method: RepairMethod;
  body_labor_hours_low: number;
  body_labor_hours_high: number;
  paint_labor_hours_low: number;
  paint_labor_hours_high: number;
  parts_cost_low: number;
  parts_cost_high: number;
  photo_indices: number[];
  confidence: Confidence;
}

export interface PotentialDamage {
  area: string;
  concern: string;
  reason: string;
  likelihood: Likelihood;
  labor_hours_low: number;
  labor_hours_high: number;
  parts_cost_low: number;
  parts_cost_high: number;
  inspection_note: string;
}

/** What the vision model returns. All dollar amounts are pre-tax US national averages. */
export interface DamageAnalysis {
  photo_quality: PhotoQuality[];
  overall_photo_feedback: string;
  retake_recommended: boolean;
  vehicle_observed: string;
  confirmed_damages: ConfirmedDamage[];
  potential_damages: PotentialDamage[];
  summary: string;
  safety_notes: string;
}

export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  trim?: string;
}

export type CountryCode = "US" | "CA";

export interface LocationInfo {
  country: CountryCode;
  /** State or province code within the country; empty until the user picks one. */
  regionCode: string;
  areaType: AreaType;
  city?: string;
  zip?: string;
  /** Optional shop-quoted labor rate that overrides the regional estimate. */
  laborRateOverride?: number;
}

export type AreaType = "metro" | "suburban" | "rural";

export interface Range {
  low: number;
  high: number;
}
