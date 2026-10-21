import { getAreaIndex, getCountry, getRegion } from "./regions";
export function getLocalRates(location) {
  const country = getCountry(location.country);
  const region = getRegion(location.country, location.regionCode);
  const laborIndex = (region?.laborIndex ?? 1) * getAreaIndex(location.areaType);
  const override =
    location.laborRateOverride && location.laborRateOverride > 0 ? location.laborRateOverride : undefined;
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
function costConfirmed(d, rates) {
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
function costPotential(d, rates) {
  const labor = { low: d.labor_hours_low * rates.bodyLaborRate, high: d.labor_hours_high * rates.bodyLaborRate };
  const parts = { low: d.parts_cost_low * rates.partsFactor, high: d.parts_cost_high * rates.partsFactor };
  return finalize(labor, { low: 0, high: 0 }, parts, rates);
}
function finalize(labor, paintMaterials, parts, rates) {
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
function sumRanges(ranges) {
  return ranges.reduce((acc, r) => ({ low: acc.low + r.low, high: acc.high + r.high }), { low: 0, high: 0 });
}
export function buildEstimate(analysis, location) {
  const rates = getLocalRates(location);
  const confirmed = analysis.confirmed_damages.map((item) => ({ item, cost: costConfirmed(item, rates) }));
  const potential = analysis.potential_damages.map((item) => ({ item, cost: costPotential(item, rates) }));
  const confirmedTotal = {
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
function round(n) {
  return Math.round(n * 100) / 100;
}
/** Estimates are ranges, so round outward to the nearest 10 to avoid false precision. */
function roundRange(r) {
  return { low: Math.floor(r.low / 10) * 10, high: Math.ceil(r.high / 10) * 10 };
}
/** "$1,200" for USD, "CA$1,200" for CAD so Canadian amounts are never mistaken for US dollars. */
export function formatMoney(n, currency) {
  return n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
}
export function formatRange(r, currency) {
  if (r.low === r.high) return formatMoney(r.low, currency);
  return `${formatMoney(r.low, currency)} – ${formatMoney(r.high, currency)}`;
}
