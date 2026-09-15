"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { Box, Camera, ChevronDown, FolderOpen, Save, Trash2 } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { deleteProject, listProjects, loadProject, saveProject } from "@/lib/persistence";

export function Toolbar() {
  const mode = useStudioStore((s) => s.mode);
  const setMode = useStudioStore((s) => s.setMode);
  const room = useStudioStore((s) => s.room);
  const items = useStudioStore((s) => s.items);
  const importedCatalog = useStudioStore((s) => s.importedCatalog);
  const photoItems = useStudioStore((s) => s.photoItems);
  const photo = useStudioStore((s) => s.photo);
  const loadSnapshot = useStudioStore((s) => s.loadSnapshot);
  const setPhoto = useStudioStore((s) => s.setPhoto);
  const resetScene = useStudioStore((s) => s.resetScene);

  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("My Design");
  const [savedFlash, setSavedFlash] = useState(false);

  const toggleMenu = () => {
    if (!menuOpen) setProjects(listProjects());
    setMenuOpen(!menuOpen);
  };

  const handleSave = () => {
    const name = projectName.trim() || "My Design";
    saveProject({ name, updatedAt: Date.now(), room, items, importedCatalog, photoItems, photo });
    setProjects(listProjects());
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleLoad = (name: string) => {
    const snap = loadProject(name);
    if (!snap) return;
    loadSnapshot({ room: snap.room, items: snap.items, importedCatalog: snap.importedCatalog, photoItems: snap.photoItems });
    setPhoto(snap.photo);
    setProjectName(snap.name);
    setMenuOpen(false);
  };

  const handleDelete = (name: string, e: MouseEvent) => {
    e.stopPropagation();
    deleteProject(name);
    setProjects(listProjects());
  };

  return (
    <header className="h-14 shrink-0 border-b border-neutral-200 bg-white flex items-center px-4 gap-4 relative z-20">
      <Link href="/" className="font-semibold text-neutral-800 shrink-0">
        Inhome<span className="text-blue-500">Design</span>
      </Link>

      <div className="flex bg-neutral-100 rounded-lg p-1 gap-1 shrink-0">
        <button
          onClick={() => setMode("studio")}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md ${
            mode === "studio" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
          }`}
        >
          <Box size={14} /> 3D Studio
        </button>
        <button
          onClick={() => setMode("photo")}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md ${
            mode === "photo" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
          }`}
        >
          <Camera size={14} /> Photo Mode
        </button>
      </div>

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={toggleMenu}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50"
        >
          <FolderOpen size={14} /> Projects <ChevronDown size={12} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-10 w-72 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 p-3 space-y-3">
              <div className="flex gap-2">
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200"
                  placeholder="Project name"
                />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-blue-500 text-white"
                >
                  <Save size={13} /> {savedFlash ? "Saved!" : "Save"}
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto panel-scroll space-y-1">
                {projects.length === 0 && <p className="text-xs text-neutral-400">No saved designs yet.</p>}
                {projects.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLoad(name)}
                    className="w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 text-left"
                  >
                    <span className="truncate">{name}</span>
                    <Trash2
                      size={13}
                      className="text-neutral-400 hover:text-red-500 shrink-0 ml-2"
                      onClick={(e) => handleDelete(name, e)}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (confirm("Start a new design? Unsaved changes will be lost.")) {
                    resetScene();
                    setPhoto(null);
                    setMenuOpen(false);
                  }
                }}
                className="w-full text-xs text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-left"
              >
                Start a new blank design
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
