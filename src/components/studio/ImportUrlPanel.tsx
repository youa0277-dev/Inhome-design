"use client";

import { useState } from "react";
import { Link2, Loader2, Upload } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { CatalogEntry } from "@/lib/types";
import { makeId } from "@/lib/id";
import { CropModal } from "./CropModal";

export function ImportUrlPanel() {
  const mode = useStudioStore((s) => s.mode);
  const addCutoutItem = useStudioStore((s) => s.addCutoutItem);
  const addPhotoItem = useStudioStore((s) => s.addPhotoItem);
  const importedCatalog = useStudioStore((s) => s.importedCatalog);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ imageUrl: string; name: string } | null>(null);

  const fetchFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't fetch that link.");
      setPending({ imageUrl: data.imageUrl, name: data.title || "Imported item" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPending({ imageUrl: reader.result as string, name: file.name.replace(/\.[a-z0-9]+$/i, "") });
    reader.readAsDataURL(file);
  };

  const handleComplete = (result: { imageUrl: string; aspect: number; name: string }) => {
    const entry: CatalogEntry = {
      id: makeId("cutout"),
      name: result.name || "Imported item",
      category: "imported",
      kind: "cutout",
      defaultColor: "#ffffff",
      footprint: [0.9 * result.aspect, 0.9],
      imageUrl: result.imageUrl,
      aspect: result.aspect,
    };
    if (mode === "photo") addPhotoItem(entry);
    else addCutoutItem(entry);
    setPending(null);
    setUrl("");
  };

  const myImports = importedCatalog;

  return (
    <div className="flex-1 overflow-y-auto panel-scroll p-3 space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">Paste a product link</h3>
        <p className="text-xs text-neutral-500 mb-2.5">
          Found a chair, lamp, or rug you love online? Paste the page link — we&apos;ll grab its photo, let you crop it,
          and cut out the background so it drops straight into your design.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-1.5 border border-neutral-200 rounded-lg px-2.5">
            <Link2 size={14} className="text-neutral-400 shrink-0" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchFromUrl()}
              placeholder="https://store.example.com/product/..."
              className="flex-1 py-2 text-xs outline-none min-w-0"
            />
          </div>
          <button
            onClick={fetchFromUrl}
            disabled={loading || !url.trim()}
            className="px-3 py-2 text-xs rounded-lg bg-blue-500 text-white disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Fetch"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      </div>

      <div className="relative flex items-center gap-2 text-[11px] text-neutral-400">
        <div className="flex-1 h-px bg-neutral-200" />
        or
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      <label className="flex items-center justify-center gap-2 text-xs px-3 py-3 rounded-lg border border-dashed border-neutral-300 hover:bg-neutral-50 cursor-pointer text-neutral-500">
        <Upload size={14} />
        Upload a product photo instead
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
          }}
        />
      </label>

      {myImports.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">Your imports</h3>
          <div className="grid grid-cols-3 gap-2">
            {myImports.map((entry) => (
              <div key={entry.id} className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-neutral-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.imageUrl} alt={entry.name} className="w-full aspect-square object-contain" />
                <span className="text-[10px] text-neutral-600 line-clamp-1">{entry.name}</span>
                <button
                  className="text-[10px] text-blue-600"
                  onClick={() => (mode === "photo" ? addPhotoItem(entry) : addCutoutItem(entry))}
                >
                  + Add another
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending && (
        <CropModal
          imageUrl={pending.imageUrl}
          suggestedName={pending.name}
          onCancel={() => setPending(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
