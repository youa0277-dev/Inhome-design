"use client";

import { Copy, Trash2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";

export function InspectorPanel() {
  const items = useStudioStore((s) => s.items);
  const selectedId = useStudioStore((s) => s.selectedId);
  const updateItem = useStudioStore((s) => s.updateItem);
  const removeItem = useStudioStore((s) => s.removeItem);
  const duplicateItem = useStudioStore((s) => s.duplicateItem);
  const transformMode = useStudioStore((s) => s.transformMode);
  const setTransformMode = useStudioStore((s) => s.setTransformMode);

  const item = items.find((i) => i.id === selectedId);

  if (!item) {
    return (
      <div className="p-4 text-sm text-neutral-400 space-y-2">
        <p>
          Select a piece of furniture to move, rotate, scale, or recolor it. You can also drag items directly in the
          3D view, or use the gizmo handles once selected.
        </p>
        <p className="text-xs text-neutral-400">
          Shortcuts: arrow keys nudge, Delete removes, Ctrl/Cmd+D duplicates, Esc deselects.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-800 truncate">{item.name}</h3>
        <div className="flex gap-1">
          <button className="icon-btn" title="Duplicate" onClick={() => duplicateItem(item.id)}>
            <Copy size={16} />
          </button>
          <button className="icon-btn text-red-500" title="Delete" onClick={() => removeItem(item.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">Gizmo</p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {(["translate", "rotate", "scale"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTransformMode(m)}
              className={`py-1.5 rounded-lg border capitalize ${
                transformMode === m ? "bg-blue-500 text-white border-blue-500" : "border-neutral-200 text-neutral-600"
              }`}
            >
              {m === "translate" ? "Move" : m}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-xs">
        <span className="text-neutral-500">Rotation</span>
        <input
          type="range"
          min={0}
          max={Math.PI * 2}
          step={0.01}
          value={item.rotation}
          onChange={(e) => updateItem(item.id, { rotation: Number(e.target.value) })}
          className="w-full"
        />
      </label>

      <label className="block text-xs">
        <span className="text-neutral-500">Scale ({item.scale.toFixed(2)}x)</span>
        <input
          type="range"
          min={0.3}
          max={2.5}
          step={0.01}
          value={item.scale}
          onChange={(e) => updateItem(item.id, { scale: Number(e.target.value) })}
          className="w-full"
        />
      </label>

      {item.kind === "model" && (
        <label className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Color</span>
          <input
            type="color"
            value={item.color}
            onChange={(e) => updateItem(item.id, { color: e.target.value })}
            className="w-9 h-9 rounded cursor-pointer"
          />
        </label>
      )}

      {item.kind === "cutout" && (
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={!!item.laidFlat}
            onChange={(e) => updateItem(item.id, { laidFlat: e.target.checked })}
          />
          Lay flat on the floor (rug / art mode)
        </label>
      )}

      <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-100">
        Position: {item.position.map((p) => p.toFixed(2)).join(", ")}
      </div>
    </div>
  );
}
