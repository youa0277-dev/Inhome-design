import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12000;

function isPrivateHost(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (/^127\./.test(h) || h === "0.0.0.0" || h === "::1") return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  return false;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InhomeDesignBot/1.0; +https://example.com)",
        Accept: "text/html,image/*,*/*;q=0.8",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function absolutize(src: string | undefined, base: string): string | null {
  if (!src) return null;
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function pickBestImage($: cheerio.CheerioAPI, pageUrl: string): { url: string; alt?: string } | null {
  const metaCandidates = [
    $('meta[property="og:image:secure_url"]').attr("content"),
    $('meta[property="og:image"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[name="twitter:image:src"]').attr("content"),
    $('link[rel="image_src"]').attr("href"),
  ];
  for (const c of metaCandidates) {
    const abs = absolutize(c, pageUrl);
    if (abs) return { url: abs };
  }

  let best: { url: string; alt?: string; score: number } | null = null;
  $("img").each((_, el) => {
    const $el = $(el);
    const src = $el.attr("src") || $el.attr("data-src") || $el.attr("data-lazy-src");
    const abs = absolutize(src, pageUrl);
    if (!abs) return;
    if (/\.(svg)(\?|$)/i.test(abs)) return;
    const w = Number($el.attr("width")) || 0;
    const h = Number($el.attr("height")) || 0;
    let score = w * h;
    const cls = ($el.attr("class") || "").toLowerCase();
    const id = ($el.attr("id") || "").toLowerCase();
    if (/logo|icon|sprite|avatar|banner-ad/.test(cls + id)) score -= 1_000_000;
    if (/product|hero|main|gallery/.test(cls + id)) score += 500_000;
    if (score === 0) score = 1000 - Math.min(999, best ? 1 : 0);
    if (!best || score > best.score) {
      best = { url: abs, alt: $el.attr("alt"), score };
    }
  });
  return best;
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "Please paste a product link." }, { status: 400 });
  }

  let pageUrl: URL;
  try {
    pageUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }
  if (!["http:", "https:"].includes(pageUrl.protocol) || isPrivateHost(pageUrl.hostname)) {
    return NextResponse.json({ error: "That URL can't be used." }, { status: 400 });
  }

  let html: string;
  let title: string | undefined;
  try {
    const res = await fetchWithTimeout(pageUrl.toString());
    if (!res.ok) throw new Error(`Page fetch failed: ${res.status}`);
    html = await res.text();
    const $ = cheerio.load(html);
    title = $('meta[property="og:title"]').attr("content") || $("title").text() || undefined;
    const picked = pickBestImage($, pageUrl.toString());
    if (!picked) {
      return NextResponse.json({ error: "Couldn't find a usable image on that page." }, { status: 422 });
    }

    let imgUrl: URL;
    try {
      imgUrl = new URL(picked.url);
    } catch {
      return NextResponse.json({ error: "Found an image but its URL was invalid." }, { status: 422 });
    }
    if (!["http:", "https:"].includes(imgUrl.protocol) || isPrivateHost(imgUrl.hostname)) {
      return NextResponse.json({ error: "That image source can't be used." }, { status: 400 });
    }

    const imgRes = await fetchWithTimeout(imgUrl.toString(), { headers: { Referer: pageUrl.toString() } });
    if (!imgRes.ok) {
      return NextResponse.json({ error: "Found the product image but couldn't download it." }, { status: 422 });
    }
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "The linked file isn't an image." }, { status: 422 });
    }
    const buf = await imgRes.arrayBuffer();
    if (buf.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "That image is too large." }, { status: 422 });
    }
    const base64 = Buffer.from(buf).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      imageUrl: dataUrl,
      title: title?.trim().slice(0, 140) ?? "Imported item",
      sourceUrl: pageUrl.toString(),
    });
  } catch (err) {
    const message = err instanceof Error && err.name === "AbortError" ? "That site took too long to respond." : "Couldn't load that page.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
