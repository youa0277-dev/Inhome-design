"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { drawBacksplashMaterial, drawFloorMaterial } from "@/lib/textures";

export function useFloorTexture(materialId: string, repeat: [number, number]) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    drawFloorMaterial(canvas, materialId);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId, repeat[0], repeat[1]]);
}

export function useBacksplashTexture(materialId: string, repeat: [number, number]) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    drawBacksplashMaterial(canvas, materialId);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId, repeat[0], repeat[1]]);
}
