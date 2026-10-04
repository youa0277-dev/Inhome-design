import { CatalogEntry } from "./types";

export const CATALOG: CatalogEntry[] = [
  { id: "sofa-3seat", name: "3-Seat Sofa", category: "seating", kind: "model", defaultColor: "#8a9a8b", footprint: [2.0, 0.9] },
  { id: "armchair", name: "Armchair", category: "seating", kind: "model", defaultColor: "#a5765a", footprint: [0.8, 0.85] },
  { id: "dining-chair", name: "Dining Chair", category: "seating", kind: "model", defaultColor: "#5b4636", footprint: [0.45, 0.5] },
  { id: "coffee-table", name: "Coffee Table", category: "tables", kind: "model", defaultColor: "#6b4a34", footprint: [1.1, 0.6] },
  { id: "dining-table", name: "Dining Table", category: "tables", kind: "model", defaultColor: "#7a5636", footprint: [1.6, 0.9] },
  { id: "side-table", name: "Side Table", category: "tables", kind: "model", defaultColor: "#7a5636", footprint: [0.45, 0.45] },
  { id: "bookshelf", name: "Bookshelf", category: "storage", kind: "model", defaultColor: "#5b4636", footprint: [0.9, 0.35] },
  { id: "tv-stand", name: "TV Stand", category: "storage", kind: "model", defaultColor: "#3f3f3f", footprint: [1.5, 0.4] },
  { id: "wardrobe", name: "Wardrobe", category: "storage", kind: "model", defaultColor: "#e8e2d6", footprint: [1.2, 0.6] },
  { id: "bed-queen", name: "Queen Bed", category: "bedroom", kind: "model", defaultColor: "#d8cdbd", footprint: [1.6, 2.05] },
  { id: "nightstand", name: "Nightstand", category: "bedroom", kind: "model", defaultColor: "#6b4a34", footprint: [0.45, 0.4] },
  { id: "floor-lamp", name: "Floor Lamp", category: "lighting", kind: "model", defaultColor: "#c9a24b", footprint: [0.35, 0.35] },
  { id: "pendant-lamp", name: "Pendant Lamp", category: "lighting", kind: "model", defaultColor: "#c9a24b", footprint: [0.3, 0.3] },
  { id: "plant", name: "Potted Plant", category: "decor", kind: "model", defaultColor: "#3f7a4d", footprint: [0.45, 0.45] },
  { id: "rug", name: "Area Rug", category: "decor", kind: "model", defaultColor: "#b6472f", footprint: [2.2, 1.5] },
  { id: "desk", name: "Desk", category: "tables", kind: "model", defaultColor: "#7a5636", footprint: [1.2, 0.6] },
  { id: "office-chair", name: "Office Chair", category: "seating", kind: "model", defaultColor: "#3f3f46", footprint: [0.55, 0.55] },
  { id: "ottoman", name: "Ottoman", category: "seating", kind: "model", defaultColor: "#8a9a8b", footprint: [0.5, 0.5] },
  { id: "console-table", name: "Console Table", category: "tables", kind: "model", defaultColor: "#6b4a34", footprint: [1.1, 0.35] },
  { id: "mirror", name: "Floor Mirror", category: "decor", kind: "model", defaultColor: "#5b4636", footprint: [0.55, 0.1] },
  { id: "dresser", name: "Dresser", category: "storage", kind: "model", defaultColor: "#e8e2d6", footprint: [1.0, 0.5] },
];

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG.find((c) => c.id === id);
}

export const CATEGORY_LABELS: Record<string, string> = {
  seating: "Seating",
  tables: "Tables",
  storage: "Storage",
  bedroom: "Bedroom",
  lighting: "Lighting",
  decor: "Decor",
  imported: "Your Imports",
};
