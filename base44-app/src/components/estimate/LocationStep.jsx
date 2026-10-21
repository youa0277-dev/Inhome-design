import { cx } from "./cx";
import { CheckCircle2, MapPin } from "lucide-react";
import { AREA_TYPES, COUNTRIES, getCountry, getRegions } from "./regions";
export function isLocationComplete(l) {
  return l.country !== "" && l.regionCode !== "";
}
const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500";
const FLAGS = { US: "🇺🇸", CA: "🇨🇦" };
export function LocationStep({ location, onChange }) {
  const complete = isLocationComplete(location);
  const country = location.country ? getCountry(location.country) : null;
  return (
    <section
      id="location-step"
      className={cx(
        "rounded-2xl bg-white p-5 sm:p-6 scroll-mt-6 transition-shadow",
        complete ? "border border-neutral-200" : "border-2 border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
      )}
    >
      <div className="flex items-start gap-3">
        {complete ? (
          <CheckCircle2 size={22} className="text-green-600 shrink-0 mt-0.5" />
        ) : (
          <MapPin size={22} className="text-blue-500 shrink-0 mt-0.5" />
        )}
        <div>
          <h2 className="font-semibold text-neutral-900">
            1. {complete ? "Vehicle location" : "Start here — where is the vehicle located?"}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Repair costs vary a lot by location. We use your country,{" "}
            {country ? country.subdivisionLabel.toLowerCase() : "state or province"}, and area to apply local labor
            rates, paint costs, and sales tax.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 max-w-md" role="radiogroup" aria-label="Country">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            type="button"
            role="radio"
            aria-checked={location.country === c.code}
            onClick={() => location.country !== c.code && onChange({ ...location, country: c.code, regionCode: "" })}
            className={cx(
              "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
              location.country === c.code
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-neutral-300 text-neutral-700 hover:border-neutral-400",
            )}
          >
            <span className="text-lg" aria-hidden>
              {FLAGS[c.code]}
            </span>
            {c.name}
          </button>
        ))}
      </div>

      {country && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">{country.subdivisionLabel} *</span>
            <select
              className={cx(inputClass, "mt-1", !location.regionCode && "border-blue-400")}
              value={location.regionCode}
              onChange={(e) => onChange({ ...location, regionCode: e.target.value })}
            >
              <option value="">Select {country.subdivisionLabel.toLowerCase()}…</option>
              {getRegions(country.code).map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">Area</span>
            <select
              className={cx(inputClass, "mt-1")}
              value={location.areaType}
              onChange={(e) => onChange({ ...location, areaType: e.target.value })}
            >
              {AREA_TYPES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">City (optional)</span>
            <input
              className={cx(inputClass, "mt-1")}
              value={location.city ?? ""}
              onChange={(e) => onChange({ ...location, city: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">
              Shop labor rate, {country.currency}/hr (optional)
            </span>
            <input
              className={cx(inputClass, "mt-1")}
              inputMode="decimal"
              placeholder="Use regional average"
              value={location.laborRateOverride ?? ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                onChange({ ...location, laborRateOverride: Number.isFinite(n) && n > 0 ? n : undefined });
              }}
            />
          </label>
        </div>
      )}
    </section>
  );
}
