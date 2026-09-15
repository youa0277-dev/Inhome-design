"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { Layers, Palette, Link2, SlidersHorizontal } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { Toolbar } from "./Toolbar";
import { Catalog } from "./Catalog";
import { MaterialsPanel } from "./MaterialsPanel";
import { ImportUrlPanel } from "./ImportUrlPanel";
import { InspectorPanel } from "./InspectorPanel";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { PhotoStudio } from "./PhotoStudio";

const SceneCanvas = dynamic(() => import("./SceneCanvas").then((m) => m.SceneCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">Loading 3D studio…</div>
  ),
});

type LeftTab = "furniture" | "materials" | "import";

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-2 text-[11px] font-medium border-b-2 transition-colors ${
        active ? "border-blue-500 text-blue-600" : "border-transparent text-neutral-400 hover:text-neutral-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function StudioShell() {
  const mode = useStudioStore((s) => s.mode);
  const [leftTab, setLeftTab] = useState<LeftTab>("furniture");
  const effectiveLeftTab = leftTab === "materials" && mode !== "studio" ? "furniture" : leftTab;

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        <aside className="w-72 shrink-0 border-r border-neutral-200 bg-white flex flex-col min-h-0">
          <div className="flex border-b border-neutral-200 shrink-0">
            <TabButton active={effectiveLeftTab === "furniture"} onClick={() => setLeftTab("furniture")} icon={<Layers size={16} />} label="Furniture" />
            {mode === "studio" && (
              <TabButton active={effectiveLeftTab === "materials"} onClick={() => setLeftTab("materials")} icon={<Palette size={16} />} label="Materials" />
            )}
            <TabButton active={effectiveLeftTab === "import"} onClick={() => setLeftTab("import")} icon={<Link2 size={16} />} label="Import" />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {effectiveLeftTab === "furniture" && <Catalog />}
            {effectiveLeftTab === "materials" && mode === "studio" && <MaterialsPanel />}
            {effectiveLeftTab === "import" && <ImportUrlPanel />}
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          {mode === "studio" ? <SceneCanvas /> : <PhotoStudio />}
        </main>

        <aside className="w-80 shrink-0 border-l border-neutral-200 bg-white flex flex-col min-h-0">
          <div className="shrink-0 max-h-[46%] overflow-y-auto panel-scroll border-b border-neutral-200">
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <SlidersHorizontal size={14} /> Properties
            </div>
            {mode === "studio" ? (
              <InspectorPanel />
            ) : (
              <div className="p-4 text-sm text-neutral-400">
                Select an item on your photo, then use the toolbar below it to rotate, flip, resize, or reorder.
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <AiAssistantPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
