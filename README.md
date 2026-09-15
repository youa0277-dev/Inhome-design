# Inhome Design

Design your home in 3D — move real furniture around a room, drop in pieces you find online, and restyle paint, flooring, backsplash and windows. An AI assistant helps with color palettes, style advice, and one-click layout suggestions.

## Features

- **3D Design Studio** — a parametric room (Three.js / React Three Fiber) you furnish with real 3D pieces (sofas, tables, beds, lighting, decor…) that you move, rotate, and scale with on-screen gizmo handles.
- **Photo Mode** — upload a photo of your actual room and drag furniture cutouts directly onto it: move, rotate, resize, flip, and reorder layers.
- **Import from anywhere** — paste a product page link and the app scrapes its photo, lets you crop it, and removes the background with an on-device AI model (`@imgly/background-removal`, runs entirely in the browser) so it's ready to place as a 3D billboard or photo-mode cutout.
- **Materials** — wall paint (per-wall or all walls), flooring (procedurally generated wood/tile/carpet textures), a kitchen backsplash accent, and window styles.
- **AI design assistant** — a Claude-powered chat panel that can see your room's dimensions, colors, and furniture, plus an "auto-arrange" button that proposes a furniture layout via Claude tool-use.
- **Save/load** — projects persist to `localStorage` so you can keep multiple designs.

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
