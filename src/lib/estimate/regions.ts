import type { AreaType } from "./types";

/**
 * Regional cost data used to localize an estimate. Rates are approximations of typical
 * independent collision-shop pricing and are meant for preliminary estimates only.
 */

/** US national baseline, USD. */
export const NATIONAL_BASELINE = {
  bodyLaborRate: 62, // $/hr
  paintLaborRate: 62, // $/hr
  paintMaterialsPerHour: 42, // $ per paint labor hour
};

export interface Region {
  code: string;
  name: string;
  /** Multiplier applied to labor rates and paint materials. */
  laborIndex: number;
  /** Multiplier applied to parts (shipping / remoteness). */
  partsIndex: number;
  /** Approximate base state sales tax on parts, as a fraction. */
  partsTax: number;
}

export const REGIONS: Region[] = [
  { code: "AL", name: "Alabama", laborIndex: 0.9, partsIndex: 1, partsTax: 0.04 },
  { code: "AK", name: "Alaska", laborIndex: 1.25, partsIndex: 1.12, partsTax: 0 },
  { code: "AZ", name: "Arizona", laborIndex: 1.0, partsIndex: 1, partsTax: 0.056 },
  { code: "AR", name: "Arkansas", laborIndex: 0.88, partsIndex: 1, partsTax: 0.065 },
  { code: "CA", name: "California", laborIndex: 1.25, partsIndex: 1, partsTax: 0.0725 },
  { code: "CO", name: "Colorado", laborIndex: 1.1, partsIndex: 1, partsTax: 0.029 },
  { code: "CT", name: "Connecticut", laborIndex: 1.15, partsIndex: 1, partsTax: 0.0635 },
  { code: "DE", name: "Delaware", laborIndex: 1.05, partsIndex: 1, partsTax: 0 },
  { code: "DC", name: "District of Columbia", laborIndex: 1.2, partsIndex: 1, partsTax: 0.06 },
  { code: "FL", name: "Florida", laborIndex: 1.0, partsIndex: 1, partsTax: 0.06 },
  { code: "GA", name: "Georgia", laborIndex: 0.97, partsIndex: 1, partsTax: 0.04 },
  { code: "HI", name: "Hawaii", laborIndex: 1.25, partsIndex: 1.12, partsTax: 0.04 },
  { code: "ID", name: "Idaho", laborIndex: 0.93, partsIndex: 1, partsTax: 0.06 },
  { code: "IL", name: "Illinois", laborIndex: 1.08, partsIndex: 1, partsTax: 0.0625 },
  { code: "IN", name: "Indiana", laborIndex: 0.93, partsIndex: 1, partsTax: 0.07 },
  { code: "IA", name: "Iowa", laborIndex: 0.93, partsIndex: 1, partsTax: 0.06 },
  { code: "KS", name: "Kansas", laborIndex: 0.92, partsIndex: 1, partsTax: 0.065 },
  { code: "KY", name: "Kentucky", laborIndex: 0.9, partsIndex: 1, partsTax: 0.06 },
  { code: "LA", name: "Louisiana", laborIndex: 0.93, partsIndex: 1, partsTax: 0.05 },
  { code: "ME", name: "Maine", laborIndex: 1.0, partsIndex: 1.02, partsTax: 0.055 },
  { code: "MD", name: "Maryland", laborIndex: 1.1, partsIndex: 1, partsTax: 0.06 },
  { code: "MA", name: "Massachusetts", laborIndex: 1.22, partsIndex: 1, partsTax: 0.0625 },
  { code: "MI", name: "Michigan", laborIndex: 1.0, partsIndex: 1, partsTax: 0.06 },
  { code: "MN", name: "Minnesota", laborIndex: 1.05, partsIndex: 1, partsTax: 0.06875 },
  { code: "MS", name: "Mississippi", laborIndex: 0.86, partsIndex: 1, partsTax: 0.07 },
  { code: "MO", name: "Missouri", laborIndex: 0.93, partsIndex: 1, partsTax: 0.04225 },
  { code: "MT", name: "Montana", laborIndex: 0.95, partsIndex: 1.03, partsTax: 0 },
  { code: "NE", name: "Nebraska", laborIndex: 0.93, partsIndex: 1, partsTax: 0.055 },
  { code: "NV", name: "Nevada", laborIndex: 1.05, partsIndex: 1, partsTax: 0.0685 },
  { code: "NH", name: "New Hampshire", laborIndex: 1.05, partsIndex: 1, partsTax: 0 },
  { code: "NJ", name: "New Jersey", laborIndex: 1.18, partsIndex: 1, partsTax: 0.06625 },
  { code: "NM", name: "New Mexico", laborIndex: 0.93, partsIndex: 1, partsTax: 0.04875 },
  { code: "NY", name: "New York", laborIndex: 1.2, partsIndex: 1, partsTax: 0.04 },
  { code: "NC", name: "North Carolina", laborIndex: 0.95, partsIndex: 1, partsTax: 0.0475 },
  { code: "ND", name: "North Dakota", laborIndex: 0.95, partsIndex: 1.03, partsTax: 0.05 },
  { code: "OH", name: "Ohio", laborIndex: 0.95, partsIndex: 1, partsTax: 0.0575 },
  { code: "OK", name: "Oklahoma", laborIndex: 0.9, partsIndex: 1, partsTax: 0.045 },
  { code: "OR", name: "Oregon", laborIndex: 1.12, partsIndex: 1, partsTax: 0 },
  { code: "PA", name: "Pennsylvania", laborIndex: 1.02, partsIndex: 1, partsTax: 0.06 },
  { code: "RI", name: "Rhode Island", laborIndex: 1.1, partsIndex: 1, partsTax: 0.07 },
  { code: "SC", name: "South Carolina", laborIndex: 0.92, partsIndex: 1, partsTax: 0.06 },
  { code: "SD", name: "South Dakota", laborIndex: 0.92, partsIndex: 1.02, partsTax: 0.042 },
  { code: "TN", name: "Tennessee", laborIndex: 0.93, partsIndex: 1, partsTax: 0.07 },
  { code: "TX", name: "Texas", laborIndex: 0.97, partsIndex: 1, partsTax: 0.0625 },
  { code: "UT", name: "Utah", laborIndex: 1.0, partsIndex: 1, partsTax: 0.061 },
  { code: "VT", name: "Vermont", laborIndex: 1.0, partsIndex: 1.02, partsTax: 0.06 },
  { code: "VA", name: "Virginia", laborIndex: 1.02, partsIndex: 1, partsTax: 0.053 },
  { code: "WA", name: "Washington", laborIndex: 1.2, partsIndex: 1, partsTax: 0.065 },
  { code: "WV", name: "West Virginia", laborIndex: 0.88, partsIndex: 1, partsTax: 0.06 },
  { code: "WI", name: "Wisconsin", laborIndex: 0.97, partsIndex: 1, partsTax: 0.05 },
  { code: "WY", name: "Wyoming", laborIndex: 0.95, partsIndex: 1.03, partsTax: 0.04 },
];

export const AREA_TYPES: { value: AreaType; label: string; index: number }[] = [
  { value: "metro", label: "Major city / metro area", index: 1.12 },
  { value: "suburban", label: "Suburban", index: 1.0 },
  { value: "rural", label: "Small town / rural", index: 0.9 },
];

export function getRegion(code: string): Region | undefined {
  return REGIONS.find((r) => r.code === code);
}

export function getAreaIndex(areaType: AreaType): number {
  return AREA_TYPES.find((a) => a.value === areaType)?.index ?? 1;
}
