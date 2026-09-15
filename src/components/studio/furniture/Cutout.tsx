"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

function useCutoutTexture(url: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (loaded) => {
      if (cancelled) return;
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.needsUpdate = true;
      setTexture(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}

export function CutoutBillboard({
  imageUrl,
  aspect,
  laidFlat,
}: {
  imageUrl: string;
  aspect: number;
  laidFlat?: boolean;
}) {
  const texture = useCutoutTexture(imageUrl);
  if (!texture) return null;

  const targetHeight = 0.95;
  const height = targetHeight;
  const width = targetHeight * aspect;

  if (laidFlat) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      <mesh position={[0, height / 2, -0.008]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.3} side={THREE.DoubleSide} roughness={0.7} opacity={0.92} />
      </mesh>
    </group>
  );
}
