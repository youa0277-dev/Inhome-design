import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { DAMAGE_ANALYSIS_SCHEMA, sanitizeAnalysis } from "@/lib/estimate/schema";
import type { DamageAnalysis, VehicleInfo } from "@/lib/estimate/types";

export const runtime = "nodejs";
export const maxDuration = 180;

const ESTIMATE_MODEL = "claude-opus-5-5";
const MAX_PHOTOS = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

interface AnalyzeBody {
  photos: { mediaType: string; data: string }[];
  vehicle: VehicleInfo;
  notes?: string;
}

const SYSTEM_PROMPT = `You are an experienced auto collision damage appraiser writing a preliminary, photo-based repair estimate for a vehicle owner in the United States.

How to work:
- Inspect every photo. Judge each photo's clarity honestly (focus, lighting, glare, distance, framing) and whether it actually shows damage.
- "confirmed_damages" lists only damage you can actually see in the photos. Give one entry per panel or component. Never invent damage you cannot see.
- "potential_damages" lists hidden or follow-on damage that commonly accompanies the visible damage but cannot be confirmed from photos (for example, reinforcement bars, absorbers, brackets, sensors, ADAS calibration, alignment, cooling components behind a grille). Explain why you suspect each and how a shop would confirm it. Only include items that are reasonably plausible given the visible damage.
- Estimate labor in hours as a collision estimating guide would (body/repair labor and paint/refinish labor separately, including blend time where appropriate). Estimate parts in USD at 2026 US national-average prices for the stated vehicle, as a typical mix of OEM and quality aftermarket, before tax. Use 0 parts cost when no parts are needed.
- Give honest low/high ranges. Widen the range and lower the confidence when the photos are unclear or only show part of the damage.
- Do not compute dollar totals for labor; the app applies local labor rates itself.
- If a photo does not show a vehicle or vehicle damage, say so in photo_quality and do not estimate from it.
- Set retake_recommended to true when the photos are too unclear or incomplete to estimate reliably, and say in overall_photo_feedback exactly which additional or clearer photos would help.
- safety_notes should flag anything that affects safe driving (lights, airbags, structural, wheels, fluid leaks). Use an empty string if there is nothing to flag.
- Photo indexes are 1-based, matching the "Photo N" labels.`;

export async function POST(req: NextRequest) {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    return NextResponse.json(
      {
        error: "Photo analysis isn't configured yet. Set an ANTHROPIC_API_KEY environment variable to enable it.",
        code: "not_configured",
      },
      { status: 503 }
    );
  }

  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const photos = Array.isArray(body.photos) ? body.photos : [];
  if (photos.length === 0) {
    return NextResponse.json({ error: "Add at least one photo of the damage." }, { status: 400 });
  }
  if (photos.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Please upload no more than ${MAX_PHOTOS} photos.` }, { status: 400 });
  }
  if (photos.some((p) => !ALLOWED_TYPES.includes(p.mediaType as AllowedType) || typeof p.data !== "string" || !p.data)) {
    return NextResponse.json({ error: "Photos must be JPEG, PNG, or WebP images." }, { status: 400 });
  }

  const v = body.vehicle ?? { year: "", make: "", model: "" };
  const vehicleText = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ").slice(0, 120) || "not specified";
  const notes = (body.notes ?? "").slice(0, 1000);

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  photos.forEach((p, i) => {
    content.push({ type: "text", text: `Photo ${i + 1}:` });
    content.push({ type: "image", source: { type: "base64", media_type: p.mediaType as AllowedType, data: p.data } });
  });
  content.push({
    type: "text",
    text: `Vehicle (as stated by the owner): ${vehicleText}
${notes ? `Owner's description of what happened: ${notes}` : "The owner did not describe what happened."}

Assess the damage in these ${photos.length} photo(s) and return the structured estimate.`,
  });

  try {
    const stream = anthropic.beta.messages.stream({
      model: ESTIMATE_MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: DAMAGE_ANALYSIS_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });
    const response = await stream.finalMessage();

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "These photos couldn't be analyzed. Please upload clear photos of the vehicle damage." },
        { status: 422 }
      );
    }
    if (response.stop_reason === "max_tokens") {
      return NextResponse.json({ error: "The analysis was cut short. Please try again." }, { status: 502 });
    }

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return NextResponse.json({ error: "The analysis came back empty. Please try again." }, { status: 502 });
    }

    const analysis = sanitizeAnalysis(JSON.parse(text.text) as DamageAnalysis, photos.length);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Damage analysis error", err);
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "We're handling a lot of requests. Please try again in a minute." }, { status: 429 });
    }
    if (err instanceof Anthropic.BadRequestError) {
      return NextResponse.json(
        { error: "One or more photos couldn't be read. Try re-saving them as JPEG and uploading again." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Something went wrong while analyzing the photos. Please try again." }, { status: 502 });
  }
}
