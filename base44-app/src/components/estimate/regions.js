export const COUNTRIES = [
  {
    code: "US",
    name: "United States",
    currency: "USD",
    subdivisionLabel: "State",
    baseline: { bodyLaborRate: 62, paintLaborRate: 62, paintMaterialsPerHour: 42 },
    partsFromUsd: 1,
    taxBase: "parts",
    taxLabel: "Sales tax on parts",
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    subdivisionLabel: "Province / territory",
    baseline: { bodyLaborRate: 115, paintLaborRate: 115, paintMaterialsPerHour: 55 },
    partsFromUsd: 1.38,
    taxBase: "all",
    taxLabel: "GST / HST / PST",
  },
];
export const REGIONS = [
  { country: "US", code: "AL", name: "Alabama", laborIndex: 0.9, partsIndex: 1, taxRate: 0.04 },
  { country: "US", code: "AK", name: "Alaska", laborIndex: 1.25, partsIndex: 1.12, taxRate: 0 },
  { country: "US", code: "AZ", name: "Arizona", laborIndex: 1.0, partsIndex: 1, taxRate: 0.056 },
  { country: "US", code: "AR", name: "Arkansas", laborIndex: 0.88, partsIndex: 1, taxRate: 0.065 },
  { country: "US", code: "CA", name: "California", laborIndex: 1.25, partsIndex: 1, taxRate: 0.0725 },
  { country: "US", code: "CO", name: "Colorado", laborIndex: 1.1, partsIndex: 1, taxRate: 0.029 },
  { country: "US", code: "CT", name: "Connecticut", laborIndex: 1.15, partsIndex: 1, taxRate: 0.0635 },
  { country: "US", code: "DE", name: "Delaware", laborIndex: 1.05, partsIndex: 1, taxRate: 0 },
  { country: "US", code: "DC", name: "District of Columbia", laborIndex: 1.2, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "FL", name: "Florida", laborIndex: 1.0, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "GA", name: "Georgia", laborIndex: 0.97, partsIndex: 1, taxRate: 0.04 },
  { country: "US", code: "HI", name: "Hawaii", laborIndex: 1.25, partsIndex: 1.12, taxRate: 0.04 },
  { country: "US", code: "ID", name: "Idaho", laborIndex: 0.93, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "IL", name: "Illinois", laborIndex: 1.08, partsIndex: 1, taxRate: 0.0625 },
  { country: "US", code: "IN", name: "Indiana", laborIndex: 0.93, partsIndex: 1, taxRate: 0.07 },
  { country: "US", code: "IA", name: "Iowa", laborIndex: 0.93, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "KS", name: "Kansas", laborIndex: 0.92, partsIndex: 1, taxRate: 0.065 },
  { country: "US", code: "KY", name: "Kentucky", laborIndex: 0.9, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "LA", name: "Louisiana", laborIndex: 0.93, partsIndex: 1, taxRate: 0.05 },
  { country: "US", code: "ME", name: "Maine", laborIndex: 1.0, partsIndex: 1.02, taxRate: 0.055 },
  { country: "US", code: "MD", name: "Maryland", laborIndex: 1.1, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "MA", name: "Massachusetts", laborIndex: 1.22, partsIndex: 1, taxRate: 0.0625 },
  { country: "US", code: "MI", name: "Michigan", laborIndex: 1.0, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "MN", name: "Minnesota", laborIndex: 1.05, partsIndex: 1, taxRate: 0.06875 },
  { country: "US", code: "MS", name: "Mississippi", laborIndex: 0.86, partsIndex: 1, taxRate: 0.07 },
  { country: "US", code: "MO", name: "Missouri", laborIndex: 0.93, partsIndex: 1, taxRate: 0.04225 },
  { country: "US", code: "MT", name: "Montana", laborIndex: 0.95, partsIndex: 1.03, taxRate: 0 },
  { country: "US", code: "NE", name: "Nebraska", laborIndex: 0.93, partsIndex: 1, taxRate: 0.055 },
  { country: "US", code: "NV", name: "Nevada", laborIndex: 1.05, partsIndex: 1, taxRate: 0.0685 },
  { country: "US", code: "NH", name: "New Hampshire", laborIndex: 1.05, partsIndex: 1, taxRate: 0 },
  { country: "US", code: "NJ", name: "New Jersey", laborIndex: 1.18, partsIndex: 1, taxRate: 0.06625 },
  { country: "US", code: "NM", name: "New Mexico", laborIndex: 0.93, partsIndex: 1, taxRate: 0.04875 },
  { country: "US", code: "NY", name: "New York", laborIndex: 1.2, partsIndex: 1, taxRate: 0.04 },
  { country: "US", code: "NC", name: "North Carolina", laborIndex: 0.95, partsIndex: 1, taxRate: 0.0475 },
  { country: "US", code: "ND", name: "North Dakota", laborIndex: 0.95, partsIndex: 1.03, taxRate: 0.05 },
  { country: "US", code: "OH", name: "Ohio", laborIndex: 0.95, partsIndex: 1, taxRate: 0.0575 },
  { country: "US", code: "OK", name: "Oklahoma", laborIndex: 0.9, partsIndex: 1, taxRate: 0.045 },
  { country: "US", code: "OR", name: "Oregon", laborIndex: 1.12, partsIndex: 1, taxRate: 0 },
  { country: "US", code: "PA", name: "Pennsylvania", laborIndex: 1.02, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "RI", name: "Rhode Island", laborIndex: 1.1, partsIndex: 1, taxRate: 0.07 },
  { country: "US", code: "SC", name: "South Carolina", laborIndex: 0.92, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "SD", name: "South Dakota", laborIndex: 0.92, partsIndex: 1.02, taxRate: 0.042 },
  { country: "US", code: "TN", name: "Tennessee", laborIndex: 0.93, partsIndex: 1, taxRate: 0.07 },
  { country: "US", code: "TX", name: "Texas", laborIndex: 0.97, partsIndex: 1, taxRate: 0.0625 },
  { country: "US", code: "UT", name: "Utah", laborIndex: 1.0, partsIndex: 1, taxRate: 0.061 },
  { country: "US", code: "VT", name: "Vermont", laborIndex: 1.0, partsIndex: 1.02, taxRate: 0.06 },
  { country: "US", code: "VA", name: "Virginia", laborIndex: 1.02, partsIndex: 1, taxRate: 0.053 },
  { country: "US", code: "WA", name: "Washington", laborIndex: 1.2, partsIndex: 1, taxRate: 0.065 },
  { country: "US", code: "WV", name: "West Virginia", laborIndex: 0.88, partsIndex: 1, taxRate: 0.06 },
  { country: "US", code: "WI", name: "Wisconsin", laborIndex: 0.97, partsIndex: 1, taxRate: 0.05 },
  { country: "US", code: "WY", name: "Wyoming", laborIndex: 0.95, partsIndex: 1.03, taxRate: 0.04 },
  // Canada: tax is the combined GST/HST + PST/QST, which applies to repair labor and parts.
  { country: "CA", code: "AB", name: "Alberta", laborIndex: 1.05, partsIndex: 1, taxRate: 0.05 },
  { country: "CA", code: "BC", name: "British Columbia", laborIndex: 1.08, partsIndex: 1, taxRate: 0.12 },
  { country: "CA", code: "MB", name: "Manitoba", laborIndex: 0.95, partsIndex: 1.02, taxRate: 0.12 },
  { country: "CA", code: "NB", name: "New Brunswick", laborIndex: 0.9, partsIndex: 1.03, taxRate: 0.15 },
  { country: "CA", code: "NL", name: "Newfoundland and Labrador", laborIndex: 0.95, partsIndex: 1.06, taxRate: 0.15 },
  { country: "CA", code: "NS", name: "Nova Scotia", laborIndex: 0.92, partsIndex: 1.03, taxRate: 0.14 },
  { country: "CA", code: "ON", name: "Ontario", laborIndex: 1.03, partsIndex: 1, taxRate: 0.13 },
  { country: "CA", code: "PE", name: "Prince Edward Island", laborIndex: 0.9, partsIndex: 1.04, taxRate: 0.15 },
  { country: "CA", code: "QC", name: "Quebec", laborIndex: 0.95, partsIndex: 1, taxRate: 0.14975 },
  { country: "CA", code: "SK", name: "Saskatchewan", laborIndex: 0.97, partsIndex: 1.02, taxRate: 0.11 },
  { country: "CA", code: "NT", name: "Northwest Territories", laborIndex: 1.2, partsIndex: 1.2, taxRate: 0.05 },
  { country: "CA", code: "NU", name: "Nunavut", laborIndex: 1.3, partsIndex: 1.3, taxRate: 0.05 },
  { country: "CA", code: "YT", name: "Yukon", laborIndex: 1.15, partsIndex: 1.15, taxRate: 0.05 },
];
export const AREA_TYPES = [
  { value: "metro", label: "Major city / metro area", index: 1.12 },
  { value: "suburban", label: "Suburban", index: 1.0 },
  { value: "rural", label: "Small town / rural", index: 0.9 },
];
export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
export function getRegions(country) {
  return REGIONS.filter((r) => r.country === country);
}
export function getRegion(country, code) {
  return REGIONS.find((r) => r.country === country && r.code === code);
}
export function getAreaIndex(areaType) {
  return AREA_TYPES.find((a) => a.value === areaType)?.index ?? 1;
}
