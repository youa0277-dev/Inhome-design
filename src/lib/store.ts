"use client";

import { create } from "zustand";
import { CatalogEntry, ChatMessage, PhotoItem, RoomState, SceneItem, Vec3, WallId, WindowInstance } from "./types";
import { getCatalogEntry } from "./catalog";
import { iconDataUrl } from "./icon";
import { makeId } from "./id";

export type StudioMode = "studio" | "photo";

export const DEFAULT_ROOM: RoomState = {
  width: 5,
  depth: 4,
  height: 2.7,
  wallColor: "#f2ede3",
  wallColors: {},
  floorMaterial: "oak-light",
  backsplash: {
    enabled: false,
    wall: "back",
    material: "subway-white",
    heightFrom: 0.9,
    heightTo: 1.5,
  },
  windows: [],
};

interface StudioState {
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;

  room: RoomState;
  items: SceneItem[];
  selectedId: string | null;
  transformMode: "translate" | "rotate" | "scale";
  photo: string | null;
  importedCatalog: CatalogEntry[];
  chat: ChatMessage[];
  chatBusy: boolean;

  photoItems: PhotoItem[];
  selectedPhotoItemId: string | null;
  addPhotoItem: (entry: CatalogEntry) => string;
  updatePhotoItem: (id: string, patch: Partial<PhotoItem>) => void;
  removePhotoItem: (id: string) => void;
  selectPhotoItem: (id: string | null) => void;
  bringPhotoItemForward: (id: string) => void;
  sendPhotoItemBackward: (id: string) => void;

  addItem: (catalogId: string, position?: Vec3) => string;
  addCutoutItem: (entry: CatalogEntry, position?: Vec3) => string;
  updateItem: (id: string, patch: Partial<SceneItem>) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;

  setRoomDims: (patch: Partial<Pick<RoomState, "width" | "depth" | "height">>) => void;
  setWallColor: (color: string, wall?: WallId) => void;
  resetWallColors: () => void;
  setFloorMaterial: (material: string) => void;
  setBacksplash: (patch: Partial<RoomState["backsplash"]>) => void;

  addWindow: (wall: WallId) => void;
  updateWindow: (id: string, patch: Partial<WindowInstance>) => void;
  removeWindow: (id: string) => void;

  setPhoto: (dataUrl: string | null) => void;
  addImportedCatalogEntry: (entry: CatalogEntry) => void;

  pushChat: (message: ChatMessage) => void;
  setChatBusy: (busy: boolean) => void;

  resetScene: () => void;
  loadSnapshot: (snapshot: {
    room: RoomState;
    items: SceneItem[];
    importedCatalog: CatalogEntry[];
    photoItems?: PhotoItem[];
  }) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  mode: "studio",
  setMode: (mode) => set({ mode }),

  room: DEFAULT_ROOM,
  items: [],
  selectedId: null,
  transformMode: "translate",
  photo: null,
  importedCatalog: [],
  chat: [],
  chatBusy: false,

  photoItems: [],
  selectedPhotoItemId: null,

  addPhotoItem: (entry) => {
    const id = makeId("photoitem");
    const [w, d] = entry.footprint;
    const item: PhotoItem = {
      id,
      catalogId: entry.id,
      name: entry.name,
      imageUrl: entry.imageUrl ?? iconDataUrl(entry),
      aspect: entry.aspect ?? Math.max(0.4, Math.min(2.4, w / d)),
      x: 50,
      y: 55,
      scale: 1,
      rotation: 0,
      z: get().photoItems.length + 1,
      flipped: false,
    };
    set((s) => ({
      photoItems: [...s.photoItems, item],
      importedCatalog: entry.kind === "cutout" ? [...s.importedCatalog, entry] : s.importedCatalog,
      selectedPhotoItemId: id,
    }));
    return id;
  },

  updatePhotoItem: (id, patch) =>
    set((s) => ({ photoItems: s.photoItems.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

  removePhotoItem: (id) =>
    set((s) => ({
      photoItems: s.photoItems.filter((p) => p.id !== id),
      selectedPhotoItemId: s.selectedPhotoItemId === id ? null : s.selectedPhotoItemId,
    })),

  selectPhotoItem: (id) => set({ selectedPhotoItemId: id }),

  bringPhotoItemForward: (id) => {
    const maxZ = Math.max(0, ...get().photoItems.map((p) => p.z));
    set((s) => ({ photoItems: s.photoItems.map((p) => (p.id === id ? { ...p, z: maxZ + 1 } : p)) }));
  },

  sendPhotoItemBackward: (id) => {
    const minZ = Math.min(0, ...get().photoItems.map((p) => p.z));
    set((s) => ({ photoItems: s.photoItems.map((p) => (p.id === id ? { ...p, z: minZ - 1 } : p)) }));
  },

  addItem: (catalogId, position) => {
    const entry = getCatalogEntry(catalogId) ?? get().importedCatalog.find((c) => c.id === catalogId);
    if (!entry) return "";
    const id = makeId("item");
    const room = get().room;
    const pos: Vec3 = position ?? [0, 0, 0];
    if (!position) {
      pos[0] = (Math.random() - 0.5) * (room.width * 0.4);
      pos[2] = (Math.random() - 0.5) * (room.depth * 0.4);
    }
    const item: SceneItem = {
      id,
      catalogId: entry.id,
      name: entry.name,
      kind: entry.kind,
      category: entry.category,
      position: pos,
      rotation: 0,
      scale: 1,
      color: entry.defaultColor,
      imageUrl: entry.imageUrl,
      aspect: entry.aspect,
      laidFlat: false,
    };
    set((s) => ({ items: [...s.items, item], selectedId: id }));
    return id;
  },

  addCutoutItem: (entry, position) => {
    set((s) => ({ importedCatalog: [...s.importedCatalog, entry] }));
    return get().addItem(entry.id, position);
  },

  updateItem: (id, patch) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),

  removeItem: (id) =>
    set((s) => ({
      items: s.items.filter((it) => it.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  duplicateItem: (id) => {
    const item = get().items.find((it) => it.id === id);
    if (!item) return;
    const newId = makeId("item");
    const copy: SceneItem = {
      ...item,
      id: newId,
      position: [item.position[0] + 0.4, item.position[1], item.position[2] + 0.4],
    };
    set((s) => ({ items: [...s.items, copy], selectedId: newId }));
  },

  selectItem: (id) => set({ selectedId: id }),
  setTransformMode: (mode) => set({ transformMode: mode }),

  setRoomDims: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),

  setWallColor: (color, wall) =>
    set((s) => ({
      room: wall
        ? { ...s.room, wallColors: { ...s.room.wallColors, [wall]: color } }
        : { ...s.room, wallColor: color, wallColors: {} },
    })),

  resetWallColors: () => set((s) => ({ room: { ...s.room, wallColors: {} } })),

  setFloorMaterial: (material) => set((s) => ({ room: { ...s.room, floorMaterial: material } })),

  setBacksplash: (patch) =>
    set((s) => ({ room: { ...s.room, backsplash: { ...s.room.backsplash, ...patch } } })),

  addWindow: (wall) =>
    set((s) => ({
      room: {
        ...s.room,
        windows: [
          ...s.room.windows,
          { id: makeId("win"), wall, offset: 0, width: 1.2, height: 1.3, sill: 0.9, style: "grid" },
        ],
      },
    })),

  updateWindow: (id, patch) =>
    set((s) => ({
      room: { ...s.room, windows: s.room.windows.map((w) => (w.id === id ? { ...w, ...patch } : w)) },
    })),

  removeWindow: (id) =>
    set((s) => ({ room: { ...s.room, windows: s.room.windows.filter((w) => w.id !== id) } })),

  setPhoto: (dataUrl) => set({ photo: dataUrl }),

  addImportedCatalogEntry: (entry) => set((s) => ({ importedCatalog: [...s.importedCatalog, entry] })),

  pushChat: (message) => set((s) => ({ chat: [...s.chat, message] })),
  setChatBusy: (busy) => set({ chatBusy: busy }),

  resetScene: () =>
    set({ room: DEFAULT_ROOM, items: [], selectedId: null, importedCatalog: [], photoItems: [], selectedPhotoItemId: null }),

  loadSnapshot: (snapshot) =>
    set({
      room: snapshot.room,
      items: snapshot.items,
      importedCatalog: snapshot.importedCatalog,
      photoItems: snapshot.photoItems ?? [],
      selectedId: null,
      selectedPhotoItemId: null,
    }),
}));
