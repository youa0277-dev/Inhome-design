import { CatalogEntry } from "./types";

const EMOJI: Record<string, string> = {
  seating: "🛋️",
  tables: "🪑",
  storage: "🗄️",
  bedroom: "🛏️",
  lighting: "💡",
  decor: "🪴",
  imported: "📦",
};

export function iconDataUrl(entry: CatalogEntry): string {
  const [w, d] = entry.footprint;
  const aspect = Math.max(0.5, Math.min(2, w / d));
  const width = 240;
  const height = Math.round(width / aspect);
  const emoji = EMOJI[entry.category] ?? "🪑";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="18" fill="${entry.defaultColor}" stroke="rgba(0,0,0,0.18)" stroke-width="3"/>
    <text x="50%" y="50%" font-size="${Math.min(width, height) * 0.4}" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
