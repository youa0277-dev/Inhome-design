// Base44 backend function: analyze-damage
//
// Receives public photo URLs (uploaded with base44.integrations.Core.UploadFile) plus the
// vehicle details, asks Claude to assess the damage, and returns structured line items.
// Dollar totals are NOT computed here: the page applies local labor rates and taxes itself,
// so changing the location updates the price instantly without a new analysis.
//
// Requires the ANTHROPIC_API_KEY secret (app settings → environment variables).

import { createClientFromRequest } from "npm:@base44/sdk";
import Anthropic from "npm:@anthropic-ai/sdk@0.125.0";

const MODEL = "claude-opus-5-5";
const MAX_PHOTOS = 8;

// Every scan is a paid Claude call. Leave this on so only signed-in users of your app can
// run it; set to false only if anonymous visitors must be able to get estimates.
const REQUIRE_LOGIN = true;

const SYSTEM_PROMPT = `You are an experienced auto collision damage appraiser writing a preliminary, photo-based repair estimate for a vehicle owner in the United States or Canada.

How to work:
- Inspect every photo. Judge each photo's clarity honestly (focus, lighting, glare, distance, framing) and whether it actually shows damage.
- "confirmed_damages" lists only damage you can actually see in the photos. Give one entry per panel or component. Never invent damage you cannot see.
- "potential_damages" lists hidden or follow-on damage that commonly accompanies the visible damage but cannot be confirmed from photos (for example, reinforcement bars, absorbers, brackets, sensors, ADAS calibration, alignment, cooling components behind a grille). Explain why you suspect each and how a shop would confirm it. Only include items that are reasonably plausible given the visible damage.
- Estimate labor in hours as a collision estimating guide would (body/repair labor and paint/refinish labor separately, including blend time where appropriate). Estimate parts in USD at 2026 US national-average prices for the stated vehicle, as a typical mix of OEM and quality aftermarket, before tax. Use 0 parts cost when no parts are needed. Always use USD; the app converts currency.
- Give honest low/high ranges. Widen the range and lower the confidence when the photos are unclear or only show part of the damage.
- Do not compute dollar totals for labor; the app applies local labor rates itself.
- If a photo does not show a vehicle or vehicle damage, say so in photo_quality and do not estimate from it.
- Set retake_recommended to true when the photos are too unclear or incomplete to estimate reliably, and say in overall_photo_feedback exactly which additional or clearer photos would help.
- safety_notes should flag anything that affects safe driving (lights, airbags, structural, wheels, fluid leaks). Use an empty string if there is nothing to flag.
- Photo indexes are 1-based, matching the "Photo N" labels.`;

const str = { type: "string" };
const num = { type: "number" };
function obj(properties: Record<string, unknown>) {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}

const DAMAGE_ANALYSIS_SCHEMA = obj({
  photo_quality: {
    type: "array",
    items: obj({
      photo_index: { type: "integer" },
      clarity: { type: "string", enum: ["good", "fair", "poor"] },
      shows_damage: { type: "boolean" },
      issues: str,
    }),
  },
  overall_photo_feedback: str,
  retake_recommended: { type: "boolean" },
  vehicle_observed: str,
  confirmed_damages: {
    type: "array",
    items: obj({
      area: str,
      damage_type: str,
      severity: { type: "string", enum: ["minor", "moderate", "severe"] },
      description: str,
      repair_method: {
        type: "string",
        enum: [
          "paintless_dent_repair",
          "repair_and_refinish",
          "replace_and_refinish",
          "replace",
          "refinish_only",
          "polish_buff",
        ],
      },
      body_labor_hours_low: num,
      body_labor_hours_high: num,
      paint_labor_hours_low: num,
      paint_labor_hours_high: num,
      parts_cost_low: num,
      parts_cost_high: num,
      photo_indices: { type: "array", items: { type: "integer" } },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
    }),
  },
  potential_damages: {
    type: "array",
    items: obj({
      area: str,
      concern: str,
      reason: str,
      likelihood: { type: "string", enum: ["likely", "possible", "unlikely"] },
      labor_hours_low: num,
      labor_hours_high: num,
      parts_cost_low: num,
      parts_cost_high: num,
      inspection_note: str,
    }),
  },
  summary: str,
  safety_notes: str,
});

// deno-lint-ignore no-explicit-any
type Analysis = Record<string, any>;

/** Model output is schema-shaped, but numbers still need guarding: no negatives, low <= high. */
function pair(a: unknown, b: unknown): [number, number] {
  const x = Math.max(0, Number(a) || 0);
  const y = Math.max(0, Number(b) || 0);
  return x <= y ? [x, y] : [y, x];
}

function sanitizeAnalysis(raw: Analysis, photoCount: number): Analysis {
  const validIndex = (i: number) => Number.isInteger(i) && i >= 1 && i <= photoCount;
  return {
    ...raw,
    photo_quality: (raw.photo_quality ?? []).filter((p: Analysis) => validIndex(p.photo_index)),
    confirmed_damages: (raw.confirmed_damages ?? []).map((d: Analysis) => {
      const [bl, bh] = pair(d.body_labor_hours_low, d.body_labor_hours_high);
      const [pl, ph] = pair(d.paint_labor_hours_low, d.paint_labor_hours_high);
      const [cl, ch] = pair(d.parts_cost_low, d.parts_cost_high);
      return {
        ...d,
        body_labor_hours_low: bl,
        body_labor_hours_high: bh,
        paint_labor_hours_low: pl,
        paint_labor_hours_high: ph,
        parts_cost_low: cl,
        parts_cost_high: ch,
        photo_indices: (d.photo_indices ?? []).filter(validIndex),
      };
    }),
    potential_damages: (raw.potential_damages ?? []).map((d: Analysis) => {
      const [ll, lh] = pair(d.labor_hours_low, d.labor_hours_high);
      const [cl, ch] = pair(d.parts_cost_low, d.parts_cost_high);
      return { ...d, labor_hours_low: ll, labor_hours_high: lh, parts_cost_low: cl, parts_cost_high: ch };
    }),
  };
}

/** Newer Base44 runtimes expose secrets via base44:runtime; older ones use Deno.env. */
async function getApiKey(): Promise<string | undefined> {
  try {
    const runtime = await import("base44:runtime");
    const key = runtime.secrets?.get("ANTHROPIC_API_KEY");
    if (key) return key;
  } catch {
    // Module not available on this runtime; fall through.
  }
  return Deno.env.get("ANTHROPIC_API_KEY") ?? undefined;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);
  if (REQUIRE_LOGIN) {
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: "Please sign in to get an estimate." }, { status: 401 });
    }
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    return Response.json(
      {
        error: "Photo analysis isn't configured yet. Add an ANTHROPIC_API_KEY secret to this app.",
        code: "not_configured",
      },
      { status: 503 }
    );
  }

  let body: { photo_urls?: unknown; vehicle?: Record<string, unknown>; notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const photoUrls = Array.isArray(body.photo_urls) ? body.photo_urls : [];
  if (photoUrls.length === 0) {
    return Response.json({ error: "Add at least one photo of the damage." }, { status: 400 });
  }
  if (photoUrls.length > MAX_PHOTOS) {
    return Response.json({ error: `Please upload no more than ${MAX_PHOTOS} photos.` }, { status: 400 });
  }
  if (!photoUrls.every(isHttpUrl)) {
    return Response.json({ error: "Invalid photo link." }, { status: 400 });
  }

  const v = body.vehicle ?? {};
  const vehicleText =
    [v.year, v.make, v.model, v.trim]
      .filter((x) => typeof x === "string" && x.trim())
      .join(" ")
      .slice(0, 120) || "not specified";
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 1000) : "";

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  photoUrls.forEach((url, i) => {
    content.push({ type: "text", text: `Photo ${i + 1}:` });
    content.push({ type: "image", source: { type: "url", url } });
  });
  content.push({
    type: "text",
    text: `Vehicle (as stated by the owner): ${vehicleText}
${notes ? `Owner's description of what happened: ${notes}` : "The owner did not describe what happened."}

Assess the damage in these ${photoUrls.length} photo(s) and return the structured estimate.`,
  });

  const anthropic = new Anthropic({ apiKey });

  try {
    const stream = anthropic.beta.messages.stream({
      model: MODEL,
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
      return Response.json(
        { error: "These photos couldn't be analyzed. Please upload clear photos of the vehicle damage." },
        { status: 422 }
      );
    }
    if (response.stop_reason === "max_tokens") {
      return Response.json({ error: "The analysis was cut short. Please try again." }, { status: 502 });
    }

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return Response.json({ error: "The analysis came back empty. Please try again." }, { status: 502 });
    }

    const analysis = sanitizeAnalysis(JSON.parse(text.text), photoUrls.length);
    return Response.json({ analysis });
  } catch (err) {
    console.error("Damage analysis error", err);
    if (err instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "The Anthropic API key was rejected. Check the ANTHROPIC_API_KEY secret.", code: "bad_key" },
        { status: 503 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "We're handling a lot of requests. Please try again in a minute." }, { status: 429 });
    }
    if (err instanceof Anthropic.BadRequestError) {
      return Response.json(
        { error: "One or more photos couldn't be read. Try re-uploading them as JPEG." },
        { status: 400 }
      );
    }
    return Response.json({ error: "Something went wrong while analyzing the photos. Please try again." }, { status: 502 });
  }
});
