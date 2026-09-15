export type Vec3 = [number, number, number];

export type FurnitureCategory =
  | "seating"
  | "tables"
  | "storage"
  | "bedroom"
  | "lighting"
  | "decor"
  | "imported";

export type CatalogKind = "model" | "cutout";

export interface CatalogEntry {
  id: string;
  name: string;
  category: FurnitureCategory;
  kind: CatalogKind;
  defaultColor: string;
  footprint: [number, number]; // width, depth in meters, used for default scale/placement
  thumbnail?: string; // emoji or short label for cutout thumbnails
  imageUrl?: string; // for cutout items, the cropped/cutout PNG (data URL)
  aspect?: number; // width/height aspect ratio for cutout billboards
}

export interface SceneItem {
  id: string;
  catalogId: string;
  name: string;
  kind: CatalogKind;
  category: FurnitureCategory;
  position: Vec3;
  rotation: number; // radians around Y
  scale: number; // uniform scale multiplier
  color: string;
  imageUrl?: string;
  aspect?: number;
  laidFlat?: boolean; // for cutouts used as rugs/art
}

export type WallId = "back" | "left" | "right";

export interface WindowInstance {
  id: string;
  wall: WallId;
  offset: number; // -1..1 position along the wall
  width: number;
  height: number;
  sill: number; // height from floor to bottom of window
  style: "single" | "grid" | "arched" | "sliding";
}

export interface RoomState {
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  wallColors: Partial<Record<WallId, string>>;
  floorMaterial: string;
  backsplash: {
    enabled: boolean;
    wall: WallId;
    material: string;
    heightFrom: number;
    heightTo: number;
  };
  windows: WindowInstance[];
}

export interface PhotoItem {
  id: string;
  catalogId: string;
  name: string;
  imageUrl: string;
  aspect: number;
  x: number; // percent 0-100
  y: number; // percent 0-100
  scale: number;
  rotation: number; // degrees
  z: number; // stacking order
  flipped: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
