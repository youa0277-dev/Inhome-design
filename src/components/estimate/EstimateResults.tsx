"use client";

import clsx from "clsx";
import { CheckCircle2, Info, MapPin, ShieldAlert, TriangleAlert, Wrench } from "lucide-react";
import { formatRange, formatUsd, type Estimate } from "@/lib/estimate/pricing";
import type { Confidence, DamageAnalysis, Likelihood, RepairMethod, Severity } from "@/lib/estimate/types";

const REPAIR_LABELS: Record<RepairMethod, string> = {
  paintless_dent_repair: "Paintless dent repair",
  repair_and_refinish: "Repair & refinish",
  replace_and_refinish: "Replace & refinish",
  replace: "Replace",
  refinish_only: "Refinish only",
  polish_buff: "Polish / buff",
};

const SEVERITY_STYLES: Record<Severity, string> = {
  minor: "bg-green-50 text-green-700",
  moderate: "bg-amber-50 text-amber-700",
  severe: "bg-red-50 text-red-700",
};

const LIKELIHOOD_STYLES: Record<Likelihood, string> = {
  likely: "bg-red-50 text-red-700",
  possible: "bg-amber-50 text-amber-700",
  unlikely: "bg-neutral-100 text-neutral-600",
};

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full capitalize", className)}>{children}</span>;
}

interface Props {
  analysis: DamageAnalysis;
  estimate: Estimate;
  previews: string[];
  isSample: boolean;
}

export function EstimateResults({ analysis, estimate, previews, isSample }: Props) {
  const poorPhotos = analysis.photo_quality.filter((p) => p.clarity === "poor" || !p.shows_damage);
  const { rates } = estimate;
  const pct = Math.round((rates.laborAdjustment - 1) * 100);

  return (
    <div className="space-y-6">
      {isSample && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Sample estimate.</strong> This is example data to show how results look — it is not based on your
            photos. Configure an API key to analyze real photos.
          </span>
        </div>
      )}

      {/* Photo quality feedback */}
      {(analysis.retake_recommended || poorPhotos.length > 0) && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex gap-2 font-semibold text-amber-900">
            <TriangleAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            {analysis.retake_recommended
              ? "We recommend retaking or adding photos for a reliable estimate"
              : "Some photos could be clearer"}
          </div>
          <p className="text-sm text-amber-800 mt-1.5">{analysis.overall_photo_feedback}</p>
          {poorPhotos.length > 0 && (
            <ul className="mt-2 text-sm text-amber-800 list-disc pl-5 space-y-0.5">
              {poorPhotos.map((p) => (
                <li key={p.photo_index}>
                  Photo {p.photo_index}: {!p.shows_damage ? "no visible damage. " : ""}
                  {p.issues}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Headline */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-500">Estimated repair cost for visible damage</p>
        <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 mt-1">
          Between {formatUsd(estimate.confirmedTotal.total.low)} and {formatUsd(estimate.confirmedTotal.total.high)}
        </p>
        <p className="text-sm text-neutral-600 mt-3">{analysis.summary}</p>
        {analysis.vehicle_observed && (
          <p className="text-xs text-neutral-400 mt-2">Vehicle seen in photos: {analysis.vehicle_observed}</p>
        )}
        {estimate.potential.length > 0 && (
          <p className="text-sm text-neutral-700 mt-4 pt-4 border-t border-neutral-100">
            If the potential hidden damages below are found, the total could reach{" "}
            <strong>
              between {formatUsd(estimate.worstCaseTotal.low)} and {formatUsd(estimate.worstCaseTotal.high)}
            </strong>
            .
          </p>
        )}
      </section>

      {analysis.safety_notes && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Safety: </strong>
            {analysis.safety_notes}
          </span>
        </div>
      )}

      {/* Confirmed damages */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-blue-500" /> Damage found in your photos
        </h2>
        {estimate.confirmed.length === 0 ? (
          <p className="text-sm text-neutral-500 mt-2">No damage could be confirmed from these photos.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {estimate.confirmed.map(({ item, cost }, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-neutral-900">{item.area}</h3>
                      <Chip className={SEVERITY_STYLES[item.severity]}>{item.severity}</Chip>
                      <Chip className="bg-neutral-100 text-neutral-600 normal-case">{REPAIR_LABELS[item.repair_method]}</Chip>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">
                      <span className="font-medium">{item.damage_type}.</span> {item.description}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1.5">
                      {CONFIDENCE_LABELS[item.confidence]}
                      {item.photo_indices.length > 0 && ` · seen in photo ${item.photo_indices.join(", ")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.photo_indices.slice(0, 2).map((idx) =>
                      previews[idx - 1] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={idx} src={previews[idx - 1]} alt={`Photo ${idx}`} className="w-12 h-12 rounded-md object-cover" />
                      ) : null
                    )}
                    <p className="font-semibold text-neutral-900 whitespace-nowrap">{formatRange(cost.total)}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
                  <div>
                    <dt>Labor</dt>
                    <dd className="text-neutral-700">{formatRange(cost.labor)}</dd>
                  </div>
                  <div>
                    <dt>Paint materials</dt>
                    <dd className="text-neutral-700">{formatRange(cost.paintMaterials)}</dd>
                  </div>
                  <div>
                    <dt>Parts (incl. tax)</dt>
                    <dd className="text-neutral-700">{formatRange(cost.parts)}</dd>
                  </div>
                </dl>
              </div>
            ))}
            <div className="flex justify-between rounded-xl bg-neutral-900 text-white px-4 py-3">
              <span className="font-medium">Visible damage total</span>
              <span className="font-semibold">
                Between {formatUsd(estimate.confirmedTotal.total.low)} and {formatUsd(estimate.confirmedTotal.total.high)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Potential damages */}
      <section className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Wrench size={18} className="text-amber-600" /> Potential additional damage
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Hidden damage that often comes with what&apos;s visible but can&apos;t be confirmed from photos. These costs are{" "}
          <strong>not</strong> included in the estimate above — a shop confirms them once panels are removed.
        </p>
        {estimate.potential.length === 0 ? (
          <p className="text-sm text-neutral-500 mt-3">No likely hidden damage identified.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {estimate.potential.map(({ item, cost }, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-neutral-900">{item.area}</h3>
                      <Chip className={LIKELIHOOD_STYLES[item.likelihood]}>{item.likelihood}</Chip>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">{item.concern}</p>
                    <p className="text-sm text-neutral-500 mt-1">Why: {item.reason}</p>
                    {item.inspection_note && <p className="text-xs text-neutral-400 mt-1.5">{item.inspection_note}</p>}
                  </div>
                  <p className="text-sm text-neutral-900 whitespace-nowrap">
                    Between <strong>{formatUsd(cost.total.low)}</strong> and <strong>{formatUsd(cost.total.high)}</strong>
                  </p>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-amber-100 text-amber-900 px-4 py-3">
              <span className="font-medium">Potential additional cost</span>
              <span className="font-semibold">
                Between {formatUsd(estimate.potentialTotal.low)} and {formatUsd(estimate.potentialTotal.high)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Location adjustment */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" /> Adjusted for {rates.regionName}
        </h2>
        <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-neutral-500">
          <div>
            <dt className="text-xs">Body labor</dt>
            <dd className="text-neutral-800">{formatUsd(rates.bodyLaborRate)}/hr</dd>
          </div>
          <div>
            <dt className="text-xs">Paint labor</dt>
            <dd className="text-neutral-800">{formatUsd(rates.paintLaborRate)}/hr</dd>
          </div>
          <div>
            <dt className="text-xs">Paint materials</dt>
            <dd className="text-neutral-800">{formatUsd(rates.paintMaterialsPerHour)}/paint hr</dd>
          </div>
          <div>
            <dt className="text-xs">Parts tax</dt>
            <dd className="text-neutral-800">{(rates.partsTax * 100).toFixed(2).replace(/\.?0+$/, "")}%</dd>
          </div>
        </dl>
        <p className="text-xs text-neutral-400 mt-3">
          {rates.overridden
            ? "Using the labor rate you entered."
            : `Labor is ${pct === 0 ? "at" : `${Math.abs(pct)}% ${pct > 0 ? "above" : "below"}`} the US national average for this location.`}{" "}
          Change the location above and the estimate updates instantly.
        </p>
      </section>

      <p className="text-xs text-neutral-400 leading-relaxed">
        This is a preliminary, photo-based estimate for planning purposes only — not a binding quote or an insurance
        appraisal. Final costs depend on an in-person inspection, the shop&apos;s rates, parts availability, and any
        damage found after disassembly.
      </p>
    </div>
  );
}
