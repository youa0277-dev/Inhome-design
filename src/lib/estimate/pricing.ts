import { getAreaIndex, getCountry, getRegion } from "./regions";
import type { ConfirmedDamage, DamageAnalysis, LocationInfo, PotentialDamage, Range } from "./types";

export interface LocalRates {
  regionName: string;
  countryName: string;
  currency: "USD" | "CAD";
  bodyLaborRate: number;
  paintLaborRate: number;
  paintMaterialsPerHour: number;
  /** Converts the model's USD national-average parts prices to local prices. */
  partsFactor: number;
  taxRate: number;
  taxBase: "parts" | "all";
  taxLabel: string;
  /** Combined labor adjustment vs. the country's national baseline (e.g. 1.25 = 25% above). */
  laborAdjustment: number;
  overridden: boolean;
}

export function getLocalRates(location: LocationInfo): LocalRates {
  const country = getCountry(location.country);
  const region = getRegion(location.country, location.regionCode);
  const laborIndex = (region?.laborIndex ?? 1) * getAreaIndex(location.areaType);
  const override = location.laborRateOverride && location.laborRateOverride > 0 ? location.laborRateOverride : undefined;
  const bodyLaborRate = override ?? country.baseline.bodyLaborRate * laborIndex;
  const paintLaborRate = override ?? country.baseline.paintLaborRate * laborIndex;

  return {
    regionName: region ? `${region.name}, ${country.name}` : `${country.name} (national average)`,
    countryName: country.name,
    currency: country.currency,
    bodyLaborRate: round(bodyLaborRate),
    paintLaborRate: round(paintLaborRate),
    paintMaterialsPerHour: round(country.baseline.paintMaterialsPerHour * laborIndex),
    partsFactor: country.partsFromUsd * (region?.partsIndex ?? 1),
    taxRate: region?.taxRate ?? 0,
    taxBase: country.taxBase,
    taxLabel: country.taxLabel,
    laborAdjustment: bodyLaborRate / country.baseline.bodyLaborRate,
    overridden: Boolean(override),
  };
}

export interface CostBreakdown {
  labor: Range;
  paintMaterials: Range;
  parts: Range;
  tax: Range;
  total: Range;
}

export interface LineItem<T> {
  item: T;
  cost: CostBreakdown;
}

export interface Estimate {
  rates: LocalRates;
  confirmed: LineItem<ConfirmedDamage>[];
  potential: LineItem<PotentialDamage>[];
  confirmedTotal: CostBreakdown;
  /** Sum of every potential item's range, shown separately from the confirmed estimate. */
  potentialTotal: Range;
  /** Confirmed low (nothing hidden found) to confirmed high + all potential highs. */
  worstCaseTotal: Range;
}

function costConfirmed(d: ConfirmedDamage, rates: LocalRates): CostBreakdown {
  const labor = {
    low: d.body_labor_hours_low * rates.bodyLaborRate + d.paint_labor_hours_low * rates.paintLaborRate,
    high: d.body_labor_hours_high * rates.bodyLaborRate + d.paint_labor_hours_high * rates.paintLaborRate,
  };
  const paintMaterials = {
    low: d.paint_labor_hours_low * rates.paintMaterialsPerHour,
    high: d.paint_labor_hours_high * rates.paintMaterialsPerHour,
  };
  const parts = { low: d.parts_cost_low * rates.partsFactor, high: d.parts_cost_high * rates.partsFactor };
  return finalize(labor, paintMaterials, parts, rates);
}

function costPotential(d: PotentialDamage, rates: LocalRates): CostBreakdown {
  const labor = { low: d.labor_hours_low * rates.bodyLaborRate, high: d.labor_hours_high * rates.bodyLaborRate };
  const parts = { low: d.parts_cost_low * rates.partsFactor, high: d.parts_cost_high * rates.partsFactor };
  return finalize(labor, { low: 0, high: 0 }, parts, rates);
}

function finalize(labor: Range, paintMaterials: Range, parts: Range, rates: LocalRates): CostBreakdown {
  const taxable =
    rates.taxBase === "all"
      ? { low: labor.low + paintMaterials.low + parts.low, high: labor.high + paintMaterials.high + parts.high }
      : parts;
  const tax = { low: taxable.low * rates.taxRate, high: taxable.high * rates.taxRate };
  return {
    labor: roundRange(labor),
    paintMaterials: roundRange(paintMaterials),
    parts: roundRange(parts),
    tax: roundRange(tax),
    total: roundRange({
      low: labor.low + paintMaterials.low + parts.low + tax.low,
      high: labor.high + paintMaterials.high + parts.high + tax.high,
    }),
  };
}

function sumRanges(ranges: Range[]): Range {
  return ranges.reduce((acc, r) => ({ low: acc.low + r.low, high: acc.high + r.high }), { low: 0, high: 0 });
}

export function buildEstimate(analysis: DamageAnalysis, location: LocationInfo): Estimate {
  const rates = getLocalRates(location);
  const confirmed = analysis.confirmed_damages.map((item) => ({ item, cost: costConfirmed(item, rates) }));
  const potential = analysis.potential_damages.map((item) => ({ item, cost: costPotential(item, rates) }));

  const confirmedTotal: CostBreakdown = {
    labor: sumRanges(confirmed.map((c) => c.cost.labor)),
    paintMaterials: sumRanges(confirmed.map((c) => c.cost.paintMaterials)),
    parts: sumRanges(confirmed.map((c) => c.cost.parts)),
    tax: sumRanges(confirmed.map((c) => c.cost.tax)),
    total: sumRanges(confirmed.map((c) => c.cost.total)),
  };
  const potentialTotal = sumRanges(potential.map((p) => p.cost.total));

  return {
    rates,
    confirmed,
    potential,
    confirmedTotal,
    potentialTotal,
    worstCaseTotal: {
      low: confirmedTotal.total.low,
      high: confirmedTotal.total.high + potentialTotal.high,
    },
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Estimates are ranges, so round outward to the nearest 10 to avoid false precision. */
function roundRange(r: Range): Range {
  return { low: Math.floor(r.low / 10) * 10, high: Math.ceil(r.high / 10) * 10 };
}

/** "$1,200" for USD, "CA$1,200" for CAD so Canadian amounts are never mistaken for US dollars. */
export function formatMoney(n: number, currency: "USD" | "CAD"): string {
  return n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
}

export function formatRange(r: Range, currency: "USD" | "CAD"): string {
  if (r.low === r.high) return formatMoney(r.low, currency);
  return `${formatMoney(r.low, currency)} – ${formatMoney(r.high, currency)}`;
}
