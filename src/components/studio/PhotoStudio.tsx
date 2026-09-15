"use client";

import { useCallback, useRef, useState, type DragEvent, type PointerEvent, type RefObject } from "react";
import { ImageUp, RotateCw, Trash2, FlipHorizontal, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { PhotoItem } from "@/lib/types";
import { getCatalogEntry } from "@/lib/catalog";

const BASE_SIZE = 16; // percent width at scale=1 for a square-ish item

function useContainerRect(ref: RefObject<HTMLDivElement | null>) {
  return useCallback(() => ref.current?.getBoundingClientRect() ?? null, [ref]);
}

function ItemLayer({ item, containerRef }: { item: PhotoItem; containerRef: RefObject<HTMLDivElement | null> }) {
  const selected = useStudioStore((s) => s.selectedPhotoItemId === item.id);
  const selectPhotoItem = useStudioStore((s) => s.selectPhotoItem);
  const updatePhotoItem = useStudioStore((s) => s.updatePhotoItem);
  const getRect = useContainerRect(containerRef);
  const dragState = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const width = BASE_SIZE * item.aspect * item.scale;
  const height = BASE_SIZE * item.scale;

  const onDragStart = (e: PointerEvent) => {
    e.stopPropagation();
    selectPhotoItem(item.id);
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, ox: item.x, oy: item.y };
  };

  const onDragMove = (e: PointerEvent) => {
    if (!dragState.current) return;
    const rect = getRect();
    if (!rect) return;
    const dx = ((e.clientX - dragState.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragState.current.startY) / rect.height) * 100;
    updatePhotoItem(item.id, {
      x: Math.min(100, Math.max(0, dragState.current.ox + dx)),
      y: Math.min(100, Math.max(0, dragState.current.oy + dy)),
    });
  };

  const onDragEnd = () => {
    dragState.current = null;
  };

  const rotateState = useRef<{ cx: number; cy: number; startAngle: number; startRot: number } | null>(null);

  const onRotateStart = (e: PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = getRect();
    if (!rect) return;
    const cx = rect.left + (item.x / 100) * rect.width;
    const cy = rect.top + (item.y / 100) * rect.height;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotateState.current = { cx, cy, startAngle, startRot: item.rotation };
  };

  const onRotateMove = (e: PointerEvent) => {
    if (!rotateState.current) return;
    const { cx, cy, startAngle, startRot } = rotateState.current;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    updatePhotoItem(item.id, { rotation: startRot + (angle - startAngle) });
  };

  const onRotateEnd = () => {
    rotateState.current = null;
  };

  const resizeState = useRef<{ cx: number; cy: number; startDist: number; startScale: number } | null>(null);

  const onResizeStart = (e: PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = getRect();
    if (!rect) return;
    const cx = rect.left + (item.x / 100) * rect.width;
    const cy = rect.top + (item.y / 100) * rect.height;
    const startDist = Math.hypot(e.clientX - cx, e.clientY - cy);
    resizeState.current = { cx, cy, startDist, startScale: item.scale };
  };

  const onResizeMove = (e: PointerEvent) => {
    if (!resizeState.current) return;
    const { cx, cy, startDist, startScale } = resizeState.current;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const next = Math.max(0.2, Math.min(6, startScale * (dist / Math.max(1, startDist))));
    updatePhotoItem(item.id, { scale: next });
  };

  const onResizeEnd = () => {
    resizeState.current = null;
  };

  return (
    <div
      className="absolute select-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        width: `${width}%`,
        height: `${height}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scaleX(${item.flipped ? -1 : 1})`,
        zIndex: 100 + item.z,
        touchAction: "none",
      }}
      onPointerDown={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain drop-shadow-lg pointer-events-none" draggable={false} />
      {selected && (
        <div className="absolute inset-0 outline outline-2 outline-blue-500/80 rounded-sm">
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-alias touch-none"
            onPointerDown={onRotateStart}
            onPointerMove={onRotateMove}
            onPointerUp={onRotateEnd}
          />
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize touch-none"
            onPointerDown={onResizeStart}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeEnd}
          />
        </div>
      )}
    </div>
  );
}

export function PhotoStudio() {
  const photo = useStudioStore((s) => s.photo);
  const setPhoto = useStudioStore((s) => s.setPhoto);
  const photoItems = useStudioStore((s) => s.photoItems);
  const selectPhotoItem = useStudioStore((s) => s.selectPhotoItem);
  const selectedId = useStudioStore((s) => s.selectedPhotoItemId);
  const updatePhotoItem = useStudioStore((s) => s.updatePhotoItem);
  const removePhotoItem = useStudioStore((s) => s.removePhotoItem);
  const bringForward = useStudioStore((s) => s.bringPhotoItemForward);
  const sendBackward = useStudioStore((s) => s.sendPhotoItemBackward);
  const addPhotoItem = useStudioStore((s) => s.addPhotoItem);
  const importedCatalog = useStudioStore((s) => s.importedCatalog);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleCatalogDrop = (e: DragEvent) => {
    e.preventDefault();
    const catalogId = e.dataTransfer.getData("text/plain");
    if (!catalogId) return;
    const entry = getCatalogEntry(catalogId) ?? importedCatalog.find((c) => c.id === catalogId);
    if (!entry) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const id = addPhotoItem(entry);
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      updatePhotoItem(id, { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!photo) {
    return (
      <div
        className={`flex-1 flex items-center justify-center m-4 rounded-2xl border-2 border-dashed transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-neutral-300 bg-neutral-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <label className="flex flex-col items-center gap-3 cursor-pointer text-neutral-500 px-8 py-12">
          <ImageUp size={40} />
          <span className="font-medium text-neutral-700">Upload a photo of your room</span>
          <span className="text-sm text-center max-w-xs">
            Drop an image here, or click to browse. Then drag furniture from the left panel straight onto the photo.
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>
    );
  }

  const selected = photoItems.find((p) => p.id === selectedId);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-neutral-500">
          Drag items to move them. Use the top handle to rotate and the corner handle to resize.
        </p>
        <div className="flex gap-2">
          <label className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 cursor-pointer">
            Replace photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
          <button
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100"
            onClick={() => setPhoto(null)}
          >
            Remove photo
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 bg-black/5 rounded-2xl overflow-hidden"
        onPointerDown={() => selectPhotoItem(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCatalogDrop}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="Your room" className="w-full h-full object-contain pointer-events-none" />
        {photoItems.map((item) => (
          <ItemLayer key={item.id} item={item} containerRef={containerRef} />
        ))}
      </div>

      {selected && (
        <div className="flex items-center gap-2 flex-wrap bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm">
          <span className="font-medium mr-2">{selected.name}</span>
          <button className="icon-btn" title="Rotate 15°" onClick={() => updatePhotoItem(selected.id, { rotation: selected.rotation + 15 })}>
            <RotateCw size={16} />
          </button>
          <button className="icon-btn" title="Flip" onClick={() => updatePhotoItem(selected.id, { flipped: !selected.flipped })}>
            <FlipHorizontal size={16} />
          </button>
          <button className="icon-btn" title="Bring forward" onClick={() => bringForward(selected.id)}>
            <ArrowUpToLine size={16} />
          </button>
          <button className="icon-btn" title="Send backward" onClick={() => sendBackward(selected.id)}>
            <ArrowDownToLine size={16} />
          </button>
          <button
            className="icon-btn text-red-600 ml-auto"
            title="Delete"
            onClick={() => removePhotoItem(selected.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
