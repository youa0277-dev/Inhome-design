"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { BACKSPLASH_MATERIALS, FLOOR_MATERIALS, WALL_PAINTS } from "@/lib/textures";
import { WallId, WindowInstance } from "@/lib/types";

const WALL_LABELS: Record<WallId, string> = { back: "Back wall", left: "Left wall", right: "Right wall" };

function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-full border-2 transition-transform ${active ? "border-blue-500 scale-110" : "border-white shadow"}`}
      style={{ backgroundColor: color }}
    />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-neutral-200 pb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">{title}</h3>
      {children}
    </div>
  );
}

function WindowRow({ win }: { win: WindowInstance }) {
  const updateWindow = useStudioStore((s) => s.updateWindow);
  const removeWindow = useStudioStore((s) => s.removeWindow);
  return (
    <div className="rounded-lg border border-neutral-200 p-2.5 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium">{WALL_LABELS[win.wall]} window</span>
        <button onClick={() => removeWindow(win.id)} className="icon-btn text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
      <label className="flex items-center gap-2">
        <span className="w-16 text-neutral-500">Style</span>
        <select
          value={win.style}
          onChange={(e) => updateWindow(win.id, { style: e.target.value as WindowInstance["style"] })}
          className="flex-1 border border-neutral-200 rounded px-1.5 py-1"
        >
          <option value="single">Single pane</option>
          <option value="grid">Grid pane</option>
          <option value="sliding">Sliding</option>
          <option value="arched">Arched</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="w-16 text-neutral-500">Position</span>
        <input
          type="range"
          min={-0.85}
          max={0.85}
          step={0.01}
          value={win.offset}
          onChange={(e) => updateWindow(win.id, { offset: Number(e.target.value) })}
          className="flex-1"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="w-16 text-neutral-500">Width</span>
        <input
          type="range"
          min={0.5}
          max={2.4}
          step={0.05}
          value={win.width}
          onChange={(e) => updateWindow(win.id, { width: Number(e.target.value) })}
          className="flex-1"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="w-16 text-neutral-500">Height</span>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={win.height}
          onChange={(e) => updateWindow(win.id, { height: Number(e.target.value) })}
          className="flex-1"
        />
      </label>
    </div>
  );
}

export function MaterialsPanel() {
  const room = useStudioStore((s) => s.room);
  const setRoomDims = useStudioStore((s) => s.setRoomDims);
  const setWallColor = useStudioStore((s) => s.setWallColor);
  const setFloorMaterial = useStudioStore((s) => s.setFloorMaterial);
  const setBacksplash = useStudioStore((s) => s.setBacksplash);
  const addWindow = useStudioStore((s) => s.addWindow);

  const [wallTarget, setWallTarget] = useState<"all" | WallId>("all");
  const [customColor, setCustomColor] = useState(room.wallColor);

  const applyColor = (color: string) => {
    setCustomColor(color);
    setWallColor(color, wallTarget === "all" ? undefined : wallTarget);
  };

  return (
    <div className="flex-1 overflow-y-auto panel-scroll p-3 space-y-4">
      <Section title="Room dimensions">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500">Width (m)</span>
            <input
              type="number"
              min={2.5}
              max={12}
              step={0.1}
              value={room.width}
              onChange={(e) => setRoomDims({ width: Number(e.target.value) })}
              className="border border-neutral-200 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500">Depth (m)</span>
            <input
              type="number"
              min={2.5}
              max={12}
              step={0.1}
              value={room.depth}
              onChange={(e) => setRoomDims({ depth: Number(e.target.value) })}
              className="border border-neutral-200 rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-neutral-500">Height (m)</span>
            <input
              type="number"
              min={2.2}
              max={4}
              step={0.1}
              value={room.height}
              onChange={(e) => setRoomDims({ height: Number(e.target.value) })}
              className="border border-neutral-200 rounded px-2 py-1"
            />
          </label>
        </div>
      </Section>

      <Section title="Wall paint">
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          {(["all", "back", "left", "right"] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWallTarget(w)}
              className={`text-[11px] px-2 py-1 rounded-full border ${
                wallTarget === w ? "bg-blue-500 text-white border-blue-500" : "border-neutral-200 text-neutral-600"
              }`}
            >
              {w === "all" ? "All walls" : WALL_LABELS[w]}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-2 mb-2.5">
          {WALL_PAINTS.map((c) => (
            <Swatch key={c} color={c} active={customColor === c} onClick={() => applyColor(c)} />
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Custom</span>
          <input type="color" value={customColor} onChange={(e) => applyColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        </label>
      </Section>

      <Section title="Flooring">
        <div className="grid grid-cols-3 gap-2">
          {FLOOR_MATERIALS.map((m) => (
            <button
              key={m.id}
              onClick={() => setFloorMaterial(m.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 ${
                room.floorMaterial === m.id ? "border-blue-500" : "border-transparent"
              }`}
            >
              <span className="w-full aspect-square rounded-md block" style={{ backgroundColor: m.swatch }} />
              <span className="text-[10px] text-neutral-600 leading-tight text-center">{m.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Backsplash">
        <label className="flex items-center gap-2 text-xs mb-2.5">
          <input
            type="checkbox"
            checked={room.backsplash.enabled}
            onChange={(e) => setBacksplash({ enabled: e.target.checked })}
          />
          Show kitchen backsplash accent
        </label>
        {room.backsplash.enabled && (
          <>
            <div className="flex gap-1.5 mb-2.5 flex-wrap">
              {(["back", "left", "right"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setBacksplash({ wall: w })}
                  className={`text-[11px] px-2 py-1 rounded-full border ${
                    room.backsplash.wall === w ? "bg-blue-500 text-white border-blue-500" : "border-neutral-200 text-neutral-600"
                  }`}
                >
                  {WALL_LABELS[w]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {BACKSPLASH_MATERIALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setBacksplash({ material: m.id })}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 ${
                    room.backsplash.material === m.id ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <span className="w-full aspect-square rounded-md block" style={{ backgroundColor: m.swatch }} />
                  <span className="text-[10px] text-neutral-600 leading-tight text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </Section>

      <Section title="Windows">
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          {(["back", "left", "right"] as const).map((w) => (
            <button
              key={w}
              onClick={() => addWindow(w)}
              className="text-[11px] px-2 py-1 rounded-full border border-neutral-200 hover:bg-neutral-100 flex items-center gap-1"
            >
              <Plus size={12} /> {WALL_LABELS[w]}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {room.windows.map((w) => (
            <WindowRow key={w.id} win={w} />
          ))}
          {room.windows.length === 0 && <p className="text-xs text-neutral-400">No windows yet — add one above.</p>}
        </div>
      </Section>
    </div>
  );
}
