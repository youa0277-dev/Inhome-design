import { cx } from "./cx";
import { useMemo, useRef, useState } from "react";
import { Car, ImagePlus, Loader2, Lock, ScanLine, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildEstimate } from "./pricing";
import { SAMPLE_ANALYSIS } from "./sample";
import { EstimateResults } from "./EstimateResults";
import { isLocationComplete, LocationStep } from "./LocationStep";
import { PhotoGuidelines } from "./PhotoGuidelines";
import { prepareImage } from "./prepareImage";
const MAX_PHOTOS = 8;
// Must match the backend function's name in Base44 (the folder name: base44/functions/analyze-damage).
const ANALYZE_FUNCTION = "analyze-damage";
// Scan-line animation shown over photos while they're analyzed (kept here so no global CSS is needed).
const SCAN_CSS = `@keyframes estimate-scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
.estimate-scan-line { animation: estimate-scan 2.2s ease-in-out infinite; }`;
const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500";
export function EstimatorShell() {
  const [photos, setPhotos] = useState([]);
  const [vehicle, setVehicle] = useState({ year: "", make: "", model: "", trim: "" });
  const [location, setLocation] = useState({ country: "", regionCode: "", areaType: "suburban", city: "" });
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInput = useRef(null);
  const resultsRef = useRef(null);
  const locationReady = isLocationComplete(location);
  const estimate = useMemo(
    () => (result && isLocationComplete(location) ? buildEstimate(result.analysis, location) : null),
    [result, location],
  );
  async function addFiles(files) {
    if (!files || !isLocationComplete(location)) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room);
    if (picked.length === 0) return;
    setStatus("preparing");
    setError(null);
    try {
      const prepared = await Promise.all(picked.map((f) => prepareImage(f)));
      setPhotos((prev) => [...prev, ...prepared]);
    } catch {
      setError({ message: "One of those photos couldn't be opened. Try a JPEG or PNG." });
    } finally {
      setStatus("idle");
    }
  }
  function removePhoto(id) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }
  const missing = [];
  if (!locationReady) missing.push("add the vehicle's location");
  if (photos.length === 0) missing.push("add at least one photo");
  if (!vehicle.make.trim() || !vehicle.model.trim()) missing.push("enter the vehicle make and model");
  if (!acknowledged) missing.push("confirm your photos are clear");
  function showResult(analysis, isSample) {
    setResult({ analysis, isSample, previews: isSample ? [] : photos.map((p) => p.previewUrl) });
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  async function analyze() {
    if (!locationReady) {
      document.getElementById("location-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (missing.length > 0) return;
    setStatus("analyzing");
    setError(null);
    try {
      // Upload each photo once (re-runs reuse the URL), then send the URLs to the backend function.
      const uploaded = await Promise.all(
        photos.map(async (p) => {
          if (p.fileUrl) return p;
          const { file_url } = await base44.integrations.Core.UploadFile({ file: p.file });
          return { ...p, fileUrl: file_url };
        }),
      );
      setPhotos(uploaded);
      const photoUrls = uploaded.map((p) => p.fileUrl);

      const res = await base44.functions.invoke(ANALYZE_FUNCTION, { photo_urls: photoUrls, vehicle, notes });
      const analysis = res.data?.analysis;
      if (!analysis) {
        setError({ message: res.data?.error ?? "Analysis failed. Please try again." });
        return;
      }
      showResult(analysis, false);
      saveEstimate(analysis, photoUrls);
    } catch (err) {
      // invoke() throws on non-2xx responses; the function's JSON error is on err.response.data.
      const body = err?.response?.data;
      setError({
        message: body?.error ?? "Couldn't analyze the photos. Check your connection and try again.",
        notConfigured: body?.code === "not_configured",
      });
    } finally {
      setStatus("idle");
    }
  }
  /** Saves the estimate to the DamageEstimate entity. Optional: skipped quietly if the entity isn't set up. */
  async function saveEstimate(analysis, photoUrls) {
    try {
      const est = buildEstimate(analysis, location);
      await base44.entities.DamageEstimate.create({
        vehicle_year: vehicle.year,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_trim: vehicle.trim,
        country: location.country,
        region_code: location.regionCode,
        area_type: location.areaType,
        city: location.city ?? "",
        currency: est.rates.currency,
        notes,
        photo_urls: photoUrls,
        estimate_low: est.confirmedTotal.total.low,
        estimate_high: est.confirmedTotal.total.high,
        potential_low: est.potentialTotal.low,
        potential_high: est.potentialTotal.high,
        summary: analysis.summary,
        analysis,
      });
    } catch (err) {
      console.warn("Estimate not saved (is the DamageEstimate entity set up?)", err);
    }
  }
  const analyzing = status === "analyzing";
  return (
    <div className="flex-1 flex flex-col bg-neutral-50 min-h-screen">
      <style>{SCAN_CSS}</style>
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Get a repair estimate from photos</h1>
          <p className="text-neutral-500 mt-2 max-w-2xl">
            Tell us where the vehicle is, upload photos of the damage, and we&apos;ll scan the damage and estimate the
            repair cost using local labor rates and taxes — in the US or Canada.
          </p>
        </div>

        <LocationStep location={location} onChange={setLocation} />

        <PhotoGuidelines />

        <div className="relative">
          {!locationReady && (
            <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-6">
              <div className="flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm px-4 py-2 shadow-lg">
                <Lock size={14} /> Add the vehicle&apos;s location above to start your estimate
              </div>
            </div>
          )}
          <fieldset
            disabled={!locationReady}
            aria-describedby={locationReady ? undefined : "location-step"}
            className={cx("space-y-8 min-w-0 transition-opacity", !locationReady && "opacity-40 select-none")}
          >
            {/* 2. Photos */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h2 className="font-semibold text-neutral-900">2. Photos of the damage</h2>
              <p className="text-sm text-neutral-500 mt-1">Up to {MAX_PHOTOS} photos. JPEG, PNG, or WebP.</p>

              <div
                className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
              >
                {photos.map((p, i) => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 group">
                        <img src={p.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 text-xs font-medium bg-black/60 text-white rounded px-1.5 py-0.5">
                      {i + 1}
                    </span>
                    {analyzing ? (
                      <div className="absolute inset-0 bg-blue-500/10">
                        <div className="estimate-scan-line absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_12px_3px_rgba(96,165,250,0.8)]" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        aria-label={`Remove photo ${i + 1}`}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white p-1 hover:bg-black/80"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={analyzing || status === "preparing"}
                    className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                  >
                    {status === "preparing" ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <ImagePlus size={22} />
                    )}
                    <span className="text-xs font-medium">{photos.length === 0 ? "Add photos" : "Add more"}</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              <label className="block mt-5">
                <span className="text-sm font-medium text-neutral-700">What happened? (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="e.g. Backed into a pole at low speed; rear bumper on the passenger side."
                  className={cx(inputClass, "mt-1.5")}
                />
              </label>
            </section>

            {/* 3. Vehicle */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Car size={16} className="text-blue-500" /> 3. Vehicle
              </h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  className={inputClass}
                  placeholder="Year"
                  inputMode="numeric"
                  maxLength={4}
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: e.target.value.replace(/\D/g, "") })}
                />
                <input
                  className={inputClass}
                  placeholder="Make *"
                  value={vehicle.make}
                  onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="Model *"
                  value={vehicle.model}
                  onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="Trim (optional)"
                  value={vehicle.trim}
                  onChange={(e) => setVehicle({ ...vehicle, trim: e.target.value })}
                />
              </div>
            </section>

            {/* Analyze */}
            <section className="space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-amber-900">
                  I confirm my photos are <strong>clear, well-lit, and show as much of the damage as possible</strong>.
                  I understand unclear or incomplete photos make the estimate less accurate.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={analyze}
                  disabled={missing.length > 0 || analyzing}
                  className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {analyzing ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
                  {analyzing ? "Scanning damage…" : "Scan & estimate"}
                </button>
                {missing.length > 0 && !analyzing && (
                  <span className="text-sm text-neutral-500">To continue, {missing.join(", ")}.</span>
                )}
                {analyzing && <span className="text-sm text-neutral-500">This usually takes under a minute.</span>}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error.message}
                  {error.notConfigured && (
                    <button
                      type="button"
                      onClick={() => showResult(SAMPLE_ANALYSIS, true)}
                      className="ml-2 font-medium underline hover:no-underline"
                    >
                      View a sample estimate instead
                    </button>
                  )}
                </div>
              )}
            </section>
          </fieldset>
        </div>

        {result && estimate && (
          <div ref={resultsRef} className="scroll-mt-6">
            <EstimateResults
              analysis={result.analysis}
              estimate={estimate}
              previews={result.previews}
              isSample={result.isSample}
            />
          </div>
        )}
      </main>
    </div>
  );
}
