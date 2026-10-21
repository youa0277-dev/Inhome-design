"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Car, ImagePlus, LoaderCircle, MapPin, ScanLine, X } from "lucide-react";
import { makeId } from "@/lib/id";
import { buildEstimate } from "@/lib/estimate/pricing";
import { AREA_TYPES, REGIONS } from "@/lib/estimate/regions";
import { SAMPLE_ANALYSIS } from "@/lib/estimate/sample";
import type { AreaType, DamageAnalysis, LocationInfo, VehicleInfo } from "@/lib/estimate/types";
import { EstimateResults } from "./EstimateResults";
import { PhotoGuidelines } from "./PhotoGuidelines";
import { prepareImage, type PreparedPhoto } from "./prepareImage";

const MAX_PHOTOS = 8;

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export function EstimatorShell() {
  const [photos, setPhotos] = useState<PreparedPhoto[]>([]);
  const [vehicle, setVehicle] = useState<VehicleInfo>({ year: "", make: "", model: "", trim: "" });
  const [location, setLocation] = useState<LocationInfo>({ stateCode: "", areaType: "suburban", city: "", zip: "" });
  const [notes, setNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [status, setStatus] = useState<"idle" | "preparing" | "analyzing">("idle");
  const [error, setError] = useState<{ message: string; notConfigured?: boolean } | null>(null);
  const [result, setResult] = useState<{ analysis: DamageAnalysis; isSample: boolean; previews: string[] } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const estimate = useMemo(() => (result ? buildEstimate(result.analysis, location) : null), [result, location]);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (picked.length === 0) return;
    setStatus("preparing");
    setError(null);
    try {
      const prepared = await Promise.all(picked.map((f) => prepareImage(f, makeId("photo"))));
      setPhotos((prev) => [...prev, ...prepared]);
    } catch {
      setError({ message: "One of those photos couldn't be opened. Try a JPEG or PNG." });
    } finally {
      setStatus("idle");
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  const missing: string[] = [];
  if (photos.length === 0) missing.push("add at least one photo");
  if (!vehicle.make.trim() || !vehicle.model.trim()) missing.push("enter the vehicle make and model");
  if (!location.stateCode) missing.push("choose the vehicle's location");
  if (!acknowledged) missing.push("confirm your photos are clear");

  function showResult(analysis: DamageAnalysis, isSample: boolean) {
    setResult({ analysis, isSample, previews: isSample ? [] : photos.map((p) => p.previewUrl) });
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function analyze() {
    if (missing.length > 0) return;
    setStatus("analyzing");
    setError(null);
    try {
      const res = await fetch("/api/estimate/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: photos.map((p) => ({ mediaType: p.mediaType, data: p.data })),
          vehicle,
          notes,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({ message: json.error ?? "Analysis failed. Please try again.", notConfigured: json.code === "not_configured" });
        return;
      }
      showResult(json.analysis as DamageAnalysis, false);
    } catch {
      setError({ message: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setStatus("idle");
    }
  }

  const analyzing = status === "analyzing";

  return (
    <div className="flex-1 flex flex-col bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/estimate" className="font-semibold text-lg flex items-center gap-2">
            <Car size={20} className="text-blue-500" />
            Damage<span className="text-blue-500 -ml-2">Estimate</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">
            Inhome Design
          </Link>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Get a repair estimate from photos</h1>
          <p className="text-neutral-500 mt-2 max-w-2xl">
            Upload photos of the damage, tell us about the car and where it is, and we&apos;ll scan the damage and
            estimate the repair cost using local labor rates.
          </p>
        </div>

        <PhotoGuidelines />

        {/* 1. Photos */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-neutral-900">1. Photos of the damage</h2>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 text-xs font-medium bg-black/60 text-white rounded px-1.5 py-0.5">
                  {i + 1}
                </span>
                {analyzing ? (
                  <div className="absolute inset-0 bg-blue-500/10">
                    <div className="scan-line absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_12px_3px_rgba(96,165,250,0.8)]" />
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
                {status === "preparing" ? <LoaderCircle className="animate-spin" size={22} /> : <ImagePlus size={22} />}
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
              className={clsx(inputClass, "mt-1.5")}
            />
          </label>
        </section>

        {/* 2. Vehicle & location */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
              <Car size={16} className="text-blue-500" /> 2. Vehicle
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Year" inputMode="numeric" maxLength={4} value={vehicle.year}
                onChange={(e) => setVehicle({ ...vehicle, year: e.target.value.replace(/\D/g, "") })} />
              <input className={inputClass} placeholder="Make *" value={vehicle.make}
                onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} />
              <input className={inputClass} placeholder="Model *" value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
              <input className={inputClass} placeholder="Trim (optional)" value={vehicle.trim}
                onChange={(e) => setVehicle({ ...vehicle, trim: e.target.value })} />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> 3. Vehicle location
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <select className={clsx(inputClass, "col-span-2")} value={location.stateCode}
                onChange={(e) => setLocation({ ...location, stateCode: e.target.value })}>
                <option value="">State *</option>
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              <select className={clsx(inputClass, "col-span-2")} value={location.areaType}
                onChange={(e) => setLocation({ ...location, areaType: e.target.value as AreaType })}>
                {AREA_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <input className={inputClass} placeholder="City (optional)" value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })} />
              <input className={inputClass} placeholder="Shop $/hr (optional)" inputMode="decimal"
                value={location.laborRateOverride ?? ""}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  setLocation({ ...location, laborRateOverride: Number.isFinite(n) && n > 0 ? n : undefined });
                }} />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Labor rates, paint materials, and parts tax are adjusted for the vehicle&apos;s location. Have a quote from a
              shop? Enter its hourly rate to use it instead.
            </p>
          </div>
        </section>

        {/* Analyze */}
        <section className="space-y-3">
          <label className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 cursor-pointer">
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-500" />
            <span className="text-sm text-amber-900">
              I confirm my photos are <strong>clear, well-lit, and show as much of the damage as possible</strong>. I
              understand unclear or incomplete photos make the estimate less accurate.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={analyze}
              disabled={missing.length > 0 || analyzing}
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyzing ? <LoaderCircle size={16} className="animate-spin" /> : <ScanLine size={16} />}
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
                <button type="button" onClick={() => showResult(SAMPLE_ANALYSIS, true)}
                  className="ml-2 font-medium underline hover:no-underline">
                  View a sample estimate instead
                </button>
              )}
            </div>
          )}
        </section>

        {result && estimate && (
          <div ref={resultsRef} className="scroll-mt-6">
            <EstimateResults analysis={result.analysis} estimate={estimate} previews={result.previews} isSample={result.isSample} />
          </div>
        )}
      </main>
    </div>
  );
}
