import { CatalogEntry, PhotoItem, RoomState, SceneItem } from "./types";

const INDEX_KEY = "inhome-design:projects";

export interface ProjectSnapshot {
  name: string;
  updatedAt: number;
  room: RoomState;
  items: SceneItem[];
  importedCatalog: CatalogEntry[];
  photoItems: PhotoItem[];
  photo: string | null;
}

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function listProjects(): string[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(INDEX_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveProject(snapshot: ProjectSnapshot) {
  const ls = safeLocalStorage();
  if (!ls) return;
  ls.setItem(`inhome-design:project:${snapshot.name}`, JSON.stringify(snapshot));
  const names = new Set(listProjects());
  names.add(snapshot.name);
  ls.setItem(INDEX_KEY, JSON.stringify(Array.from(names)));
}

export function loadProject(name: string): ProjectSnapshot | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(`inhome-design:project:${name}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deleteProject(name: string) {
  const ls = safeLocalStorage();
  if (!ls) return;
  ls.removeItem(`inhome-design:project:${name}`);
  const names = listProjects().filter((n) => n !== name);
  ls.setItem(INDEX_KEY, JSON.stringify(names));
}
