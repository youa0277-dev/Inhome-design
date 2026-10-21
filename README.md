# Inhome Design

Design your home in 3D — move real furniture around a room, drop in pieces you find online, and restyle paint, flooring, backsplash and windows. An AI assistant helps with color palettes, style advice, and one-click layout suggestions.

## Features

- **3D Design Studio** — a parametric room (Three.js / React Three Fiber) you furnish with real 3D pieces (sofas, tables, beds, lighting, decor…) that you move, rotate, and scale with on-screen gizmo handles.
- **Photo Mode** — upload a photo of your actual room and drag furniture cutouts directly onto it: move, rotate, resize, flip, and reorder layers.
- **Import from anywhere** — paste a product page link and the app scrapes its photo, lets you crop it, and removes the background with an on-device AI model (`@imgly/background-removal`, runs entirely in the browser) so it's ready to place as a 3D billboard or photo-mode cutout.
- **Materials** — wall paint (per-wall or all walls), flooring (procedurally generated wood/tile/carpet textures), a kitchen backsplash accent, and window styles.
- **AI design assistant** — a Claude-powered chat panel that can see your room's dimensions, colors, and furniture, plus an "auto-arrange" button that proposes a furniture layout via Claude tool-use.
- **Save/load** — projects persist to `localStorage` so you can keep multiple designs.

## Car Damage Estimate (`/estimate`)

A photo-based collision repair estimator:

- **Clear-photo requirement** — customers see a prominent notice (and must confirm) that photos need to be clear, well-lit, and show as much of the damage as possible. After analysis, each photo is graded for clarity and blurry, dark, or off-target photos are flagged with a retake recommendation.
- **AI damage scan** — Claude (vision) reviews every photo and returns structured line items: panel or part, damage type, severity, repair method, body/paint labor hours, and parts cost ranges (`/api/estimate/analyze`).
- **Location first** — customers are prompted to enter the vehicle's location (United States or Canada, then state or province/territory) before anything else; the rest of the form stays locked until they do.
- **Location-adjusted pricing** — labor rates, paint materials, and sales tax are localized by US state or Canadian province/territory and area type (metro / suburban / rural). Canadian estimates are shown in CAD with GST/HST/PST applied to parts and labor; US estimates are in USD with state sales tax on parts. Customers can also enter a shop's quoted hourly rate. Costs are computed in the app (`src/lib/estimate/pricing.ts`), not by the model, so changing the location updates the estimate instantly.
- **Potential damages section** — likely hidden damage (reinforcements, brackets, sensors, alignment…) is listed separately with its own "between $X and $Y" cost range, and the page shows the total if those items are found.

Regional rates in `src/lib/estimate/regions.ts` are approximations meant for preliminary estimates; adjust them to match real local data. Without an API key the page offers a clearly labeled sample estimate.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Enabling the AI assistant

Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` to a key from the [Anthropic Console](https://console.anthropic.com/). Without a key, the rest of the app works normally — the assistant just responds with a note that it isn't configured.

## Notes on scope

- Furniture from the catalog is real, editable 3D geometry.
- Furniture imported from a link is rendered as a background-removed cutout placed in 3D space (a "billboard") — full photogrammetry-to-3D reconstruction from a single product photo isn't feasible without specialized capture hardware, so this is the practical way to get real online finds into a 3D scene.
- Background removal for imports runs on-device in the browser; the product image itself is fetched once through a small server route (`/api/import-url`) to avoid browser CORS restrictions on arbitrary third-party sites.
