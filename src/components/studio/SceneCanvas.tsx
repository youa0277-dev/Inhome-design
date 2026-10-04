"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, OrthographicCamera, PerspectiveCamera, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Download, LayoutGrid, Move3d } from "lucide-react";
import { useStudioStore } from "@/lib/store";
import { getCatalogEntry } from "@/lib/catalog";
import { Room } from "./Room";
import { SceneItemMesh } from "./SceneItemMesh";

function CatalogDropTarget() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const catalogId = e.dataTransfer?.getData("text/plain");
      if (!catalogId) return;
      const { importedCatalog, addItem } = useStudioStore.getState();
      const entry = getCatalogEntry(catalogId) ?? importedCatalog.find((c) => c.id === catalogId);
      if (!entry) return;
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(floorPlane, hit)) {
        addItem(entry.id, [hit.x, 0, hit.z]);
      } else {
        addItem(entry.id);
      }
    };
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("drop", onDrop);
    };
  }, [camera, gl]);

  return null;
}

function CanvasRefBridge({ onReady }: { onReady: (el: HTMLCanvasElement) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onReady(gl.domElement);
  }, [gl, onReady]);
  return null;
}

export function SceneCanvas() {
  const room = useStudioStore((s) => s.room);
  const items = useStudioStore((s) => s.items);
  const selectedId = useStudioStore((s) => s.selectedId);
  const selectItem = useStudioStore((s) => s.selectItem);
  const removeItem = useStudioStore((s) => s.removeItem);
  const duplicateItem = useStudioStore((s) => s.duplicateItem);
  const updateItem = useStudioStore((s) => s.updateItem);
  const transformMode = useStudioStore((s) => s.transformMode);

  const objectRefs = useRef<Map<string, THREE.Group>>(new Map());
  const [attached, setAttached] = useState<THREE.Group | null>(null);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [topView, setTopView] = useState(false);

  useEffect(() => {
    if (selectedId) {
      setAttached(objectRefs.current.get(selectedId) ?? null);
    } else {
      setAttached(null);
    }
  }, [selectedId, items]);

  // Keyboard shortcuts: Delete/Backspace removes, Escape deselects,
  // Ctrl/Cmd+D duplicates, arrow keys nudge the selected item.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      const current = useStudioStore.getState().selectedId;
      if (!current) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeItem(current);
      } else if (e.key === "Escape") {
        selectItem(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateItem(current);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const item = useStudioStore.getState().items.find((i) => i.id === current);
        if (!item) return;
        const step = e.shiftKey ? 0.2 : 0.05;
        const y = item.position[1];
        let [x, , z] = item.position;
        if (e.key === "ArrowLeft") x -= step;
        if (e.key === "ArrowRight") x += step;
        if (e.key === "ArrowUp") z -= step;
        if (e.key === "ArrowDown") z += step;
        updateItem(current, { position: [x, y, z] });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [removeItem, selectItem, duplicateItem, updateItem]);

  const handleObjectChange = () => {
    if (!selectedId) return;
    const obj = objectRefs.current.get(selectedId);
    if (!obj) return;
    if (transformMode === "scale") {
      const s = Math.max(obj.scale.x, obj.scale.y, obj.scale.z);
      obj.scale.setScalar(s);
    }
    if (transformMode === "translate") {
      obj.position.y = 0;
    }
    updateItem(selectedId, {
      position: [obj.position.x, obj.position.y, obj.position.z],
      rotation: obj.rotation.y,
      scale: obj.scale.x,
    });
  };

  const handleExport = () => {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-room-design.png";
    a.click();
  };

  return (
    <div className="relative flex-1 min-h-0">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        className="!touch-none"
      >
        <color attach="background" args={["#e9edf1"]} />
        {topView ? (
          <OrthographicCamera makeDefault position={[0, 12, 0.01]} up={[0, 0, -1]} zoom={70} near={0.1} far={50} />
        ) : (
          <PerspectiveCamera makeDefault position={[4.5, 4, 5.5]} fov={45} />
        )}

        <hemisphereLight intensity={0.6} groundColor="#4b4b4b" />
        <directionalLight
          position={[6, 10, 5]}
          intensity={1.15}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-bias={-0.0015}
        />
        <pointLight position={[-4, 3, -2]} intensity={0.2} />

        <group onPointerMissed={() => selectItem(null)}>
          <Room room={room} />
          {items.map((item) => (
            <SceneItemMesh
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={selectItem}
              ref={(obj) => {
                if (obj) objectRefs.current.set(item.id, obj);
                else objectRefs.current.delete(item.id);
              }}
            />
          ))}
        </group>

        <ContactShadows position={[0, 0.002, 0]} opacity={0.4} scale={20} blur={2.2} far={4} />
        <CatalogDropTarget />
        <CanvasRefBridge onReady={(el) => (canvasElRef.current = el)} />

        {attached && (
          <TransformControls
            object={attached}
            mode={transformMode}
            showY={transformMode !== "translate"}
            showX={transformMode !== "rotate"}
            showZ={transformMode !== "rotate"}
            onObjectChange={handleObjectChange}
            onMouseDown={() => {
              if (orbitRef.current) orbitRef.current.enabled = false;
            }}
            onMouseUp={() => {
              if (orbitRef.current) orbitRef.current.enabled = true;
            }}
          />
        )}

        <OrbitControls
          ref={orbitRef}
          makeDefault
          enableRotate={!topView}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={1.5}
          maxDistance={20}
          minZoom={25}
          maxZoom={220}
          target={[0, topView ? 0 : 0.9, 0]}
        />
      </Canvas>

      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => setTopView((v) => !v)}
          title={topView ? "Switch to 3D view" : "Switch to floor plan view"}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border shadow-sm backdrop-blur ${
            topView ? "bg-blue-500 text-white border-blue-500" : "bg-white/90 border-neutral-200 text-neutral-600 hover:bg-white"
          }`}
        >
          {topView ? <Move3d size={14} /> : <LayoutGrid size={14} />}
          {topView ? "3D View" : "Floor Plan"}
        </button>
        <button
          onClick={handleExport}
          title="Download a PNG of the current view"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 bg-white/90 text-neutral-600 hover:bg-white shadow-sm backdrop-blur"
        >
          <Download size={14} />
          Export
        </button>
      </div>
    </div>
  );
}
