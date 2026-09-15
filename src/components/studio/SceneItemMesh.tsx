"use client";

import { forwardRef, Suspense } from "react";
import * as THREE from "three";
import { SceneItem } from "@/lib/types";
import { FurnitureModel } from "./furniture/Models";
import { CutoutBillboard } from "./furniture/Cutout";

interface Props {
  item: SceneItem;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const SceneItemMesh = forwardRef<THREE.Group, Props>(({ item, selected, onSelect }, ref) => {
  return (
    <group
      ref={ref}
      position={item.position}
      rotation={[0, item.rotation, 0]}
      scale={item.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <Suspense fallback={null}>
        {item.kind === "cutout" && item.imageUrl ? (
          <CutoutBillboard imageUrl={item.imageUrl} aspect={item.aspect ?? 1} laidFlat={item.laidFlat} />
        ) : (
          <FurnitureModel catalogId={item.catalogId} color={item.color} />
        )}
      </Suspense>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.42, 0.48, 32]} />
          <meshBasicMaterial color="#4f8cff" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
});
SceneItemMesh.displayName = "SceneItemMesh";
