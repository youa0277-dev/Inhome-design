"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { CATALOG, CATEGORY_LABELS, getCatalogEntry } from "@/lib/catalog";
import { CatalogEntry, FurnitureCategory } from "@/lib/types";
import { iconDataUrl } from "@/lib/icon";

function CatalogCard({ entry }: { entry: CatalogEntry }) {
  const mode = useStudioStore((s) => s.mode);
  const addItem = useStudioStore((s) => s.addItem);
  const addPhotoItem = useStudioStore((s) => s.addPhotoItem);

  const thumb = entry.imageUrl ?? iconDataUrl(entry);

  const handleAdd = () => {
    if (mode === "photo") addPhotoItem(entry);
    else addItem(entry.id);
  };

  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", entry.id);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={handleAdd}
      className="group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-neutral-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all text-center"
      title={`Add ${entry.name}`}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt={entry.name} className="w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
          <Plus size={18} className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
        </div>
      </div>
      <span className="text-[11px] leading-tight text-neutral-600 line-clamp-2">{entry.name}</span>
    </button>
  );
}

export function Catalog() {
  const importedCatalog = useStudioStore((s) => s.importedCatalog);
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const all = [...CATALOG, ...importedCatalog];
    const q = query.trim().toLowerCase();
    const filtered = q ? all.filter((e) => e.name.toLowerCase().includes(q)) : all;
    const groups = new Map<FurnitureCategory, CatalogEntry[]>();
    for (const entry of filtered) {
      const list = groups.get(entry.category) ?? [];
      list.push(entry);
      groups.set(entry.category, list);
    }
    return groups;
  }, [importedCatalog, query]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-neutral-200">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search furniture…"
          className="w-full text-sm px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto panel-scroll p-3 space-y-5">
        {Array.from(grouped.entries()).map(([category, entries]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {entries.map((entry) => (
                <CatalogCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
        {grouped.size === 0 && <p className="text-sm text-neutral-400 text-center mt-8">No furniture found.</p>}
      </div>
    </div>
  );
}

export function catalogEntryById(id: string) {
  return getCatalogEntry(id);
}
