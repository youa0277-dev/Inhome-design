"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
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

export function SceneCanvas() {
  const room = useStudioStore((s) => s.room);
  const items = useStudioStore((s) => s.items);
  const selectedId = useStudioStore((s) => s.selectedId);
  const selectItem = useStudioStore((s) => s.selectItem);
  const updateItem = useStudioStore((s) => s.updateItem);
  const transformMode = useStudioStore((s) => s.transformMode);

  const objectRefs = useRef<Map<string, THREE.Group>>(new Map());
  const [attached, setAttached] = useState<THREE.Group | null>(null);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    if (selectedId) {
      setAttached(objectRefs.current.get(selectedId) ?? null);
    } else {
      setAttached(null);
    }
  }, [selectedId, items]);

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

  return (
    <Canvas shadows camera={{ position: [4.5, 4, 5.5], fov: 45 }} className="!touch-none">
      <color attach="background" args={["#e9edf1"]} />
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
        maxPolarAngle={Math.PI / 2.05}
        minDistance={1.5}
        maxDistance={20}
        target={[0, 0.9, 0]}
      />
    </Canvas>
  );
}
