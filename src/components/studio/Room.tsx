"use client";

import { RoomState, WallId } from "@/lib/types";
import { useBacksplashTexture, useFloorTexture } from "./useMaterialTexture";

function wallColorFor(room: RoomState, wall: WallId) {
  return room.wallColors[wall] ?? room.wallColor;
}

function WindowFrame({
  width,
  height,
  style,
}: {
  width: number;
  height: number;
  style: "single" | "grid" | "arched" | "sliding";
}) {
  const frameT = 0.06;
  const mullions = style === "grid" ? 2 : style === "sliding" ? 1 : 0;
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial color="#dfeeff" transparent opacity={0.35} roughness={0.05} metalness={0.1} />
      </mesh>
      {/* frame border */}
      {[
        [0, height / 2, width, frameT],
        [0, -height / 2, width, frameT],
      ].map(([x, y, w, h], i) => (
        <mesh key={`h${i}`} position={[x, y, 0.01]}>
          <boxGeometry args={[w, h, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
      {[
        [width / 2, 0, frameT, height],
        [-width / 2, 0, frameT, height],
      ].map(([x, y, w, h], i) => (
        <mesh key={`v${i}`} position={[x, y, 0.01]}>
          <boxGeometry args={[w, h, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
      {style === "arched" && (
        <mesh position={[0, height / 2 + 0.15, 0.01]}>
          <torusGeometry args={[width / 2, frameT / 1.6, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      )}
      {Array.from({ length: mullions }).map((_, i) => {
        const t = (i + 1) / (mullions + 1);
        const x = -width / 2 + width * t;
        return (
          <mesh key={`m${i}`} position={[x, 0, 0.015]}>
            <boxGeometry args={[0.03, height, 0.03]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[width, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Wall({
  wall,
  room,
  color,
}: {
  wall: WallId;
  room: RoomState;
  color: string;
}) {
  const { width, depth, height } = room;
  let position: [number, number, number] = [0, height / 2, 0];
  let rotationY = 0;
  let span = width;
  if (wall === "back") {
    position = [0, height / 2, -depth / 2];
    rotationY = 0;
    span = width;
  } else if (wall === "left") {
    position = [-width / 2, height / 2, 0];
    rotationY = Math.PI / 2;
    span = depth;
  } else {
    position = [width / 2, height / 2, 0];
    rotationY = -Math.PI / 2;
    span = depth;
  }

  const windows = room.windows.filter((w) => w.wall === wall);
  const half = span / 2 - span * 0.06;
  const backsplashActive = room.backsplash.enabled && room.backsplash.wall === wall;
  const bsTexture = useBacksplashTexture(room.backsplash.material, [span / 0.6, (room.backsplash.heightTo - room.backsplash.heightFrom) / 0.3]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow>
        <planeGeometry args={[span, height]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      {backsplashActive && (
        <mesh position={[0, room.backsplash.heightFrom + (room.backsplash.heightTo - room.backsplash.heightFrom) / 2 - height / 2, 0.01]}>
          <planeGeometry args={[span * 0.94, room.backsplash.heightTo - room.backsplash.heightFrom]} />
          <meshStandardMaterial map={bsTexture} roughness={0.4} />
        </mesh>
      )}
      {windows.map((w) => (
        <group
          key={w.id}
          position={[w.offset * half, w.sill + w.height / 2 - height / 2, 0.03]}
        >
          <WindowFrame width={w.width} height={w.height} style={w.style} />
        </group>
      ))}
    </group>
  );
}

export function Room({ room }: { room: RoomState }) {
  const { width, depth } = room;
  const floorTex = useFloorTexture(room.floorMaterial, [width / 1.2, depth / 1.2]);

  const baseboardColor = "#ffffff";

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} />
      </mesh>

      <Wall wall="back" room={room} color={wallColorFor(room, "back")} />
      <Wall wall="left" room={room} color={wallColorFor(room, "left")} />
      <Wall wall="right" room={room} color={wallColorFor(room, "right")} />

      {/* baseboards */}
      <mesh position={[0, 0.045, -depth / 2 + 0.005]}>
        <boxGeometry args={[width, 0.09, 0.02]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.5} />
      </mesh>
      <mesh position={[-width / 2 + 0.005, 0.045, 0]}>
        <boxGeometry args={[0.02, 0.09, depth]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.5} />
      </mesh>
      <mesh position={[width / 2 - 0.005, 0.045, 0]}>
        <boxGeometry args={[0.02, 0.09, depth]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.5} />
      </mesh>

      {/* room bounds helper (subtle) */}
      <gridHelper args={[Math.max(width, depth) + 2, (Math.max(width, depth) + 2) * 2, "#00000010", "#00000008"]} position={[0, 0.001, 0]} />
    </group>
  );
}
