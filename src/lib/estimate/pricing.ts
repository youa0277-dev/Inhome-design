import { NATIONAL_BASELINE, getAreaIndex, getRegion } from "./regions";
import type { ConfirmedDamage, DamageAnalysis, LocationInfo, PotentialDamage, Range } from "./types";

export interface LocalRates {
  regionName: string;
  bodyLaborRate: number;
  paintLaborRate: number;
  paintMaterialsPerHour: number;
  partsIndex: number;
  partsTax: number;
  /** Combined labor adjustment vs. the national baseline (e.g. 1.25 = 25% above). */
  laborAdjustment: number;
  overridden: boolean;
}

export function getLocalRates(location: LocationInfo): LocalRates {
  const region = getRegion(location.stateCode);
  const laborIndex = (region?.laborIndex ?? 1) * getAreaIndex(location.areaType);
  const override = location.laborRateOverride && location.laborRateOverride > 0 ? location.laborRateOverride : undefined;
  const bodyLaborRate = override ?? NATIONAL_BASELINE.bodyLaborRate * laborIndex;
  const paintLaborRate = override ?? NATIONAL_BASELINE.paintLaborRate * laborIndex;

  return {
    regionName: region?.name ?? "United States (national average)",
    bodyLaborRate: round(bodyLaborRate),
    paintLaborRate: round(paintLaborRate),
    paintMaterialsPerHour: round(NATIONAL_BASELINE.paintMaterialsPerHour * laborIndex),
    partsIndex: region?.partsIndex ?? 1,
    partsTax: region?.partsTax ?? 0,
    laborAdjustment: bodyLaborRate / NATIONAL_BASELINE.bodyLaborRate,
    overridden: Boolean(override),
  };
}

export interface CostBreakdown {
  labor: Range;
  paintMaterials: Range;
  parts: Range;
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

function partsCost(low: number, high: number, rates: LocalRates): Range {
  const factor = rates.partsIndex * (1 + rates.partsTax);
  return { low: low * factor, high: high * factor };
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
  const parts = partsCost(d.parts_cost_low, d.parts_cost_high, rates);
  return finalize(labor, paintMaterials, parts);
}

function costPotential(d: PotentialDamage, rates: LocalRates): CostBreakdown {
  const labor = { low: d.labor_hours_low * rates.bodyLaborRate, high: d.labor_hours_high * rates.bodyLaborRate };
  const parts = partsCost(d.parts_cost_low, d.parts_cost_high, rates);
  return finalize(labor, { low: 0, high: 0 }, parts);
}

function finalize(labor: Range, paintMaterials: Range, parts: Range): CostBreakdown {
  return {
    labor: roundRange(labor),
    paintMaterials: roundRange(paintMaterials),
    parts: roundRange(parts),
    total: roundRange({
      low: labor.low + paintMaterials.low + parts.low,
      high: labor.high + paintMaterials.high + parts.high,
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

/** Estimates are ranges, so round outward to the nearest $10 to avoid false precision. */
function roundRange(r: Range): Range {
  return { low: Math.floor(r.low / 10) * 10, high: Math.ceil(r.high / 10) * 10 };
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatRange(r: Range): string {
  if (r.low === r.high) return formatUsd(r.low);
  return `${formatUsd(r.low)} – ${formatUsd(r.high)}`;
}
