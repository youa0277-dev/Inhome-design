"use client";

import { JSX, useMemo } from "react";
import * as THREE from "three";

type ModelProps = { color: string };

function shade(hex: string, amt: number) {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

const WOOD = "#6b4a34";
const METAL = "#3a3a3a";

function Leg({ x, z, h = 0.4, r = 0.03, color = WOOD }: { x: number; z: number; h?: number; r?: number; color?: string }) {
  return (
    <mesh position={[x, h / 2, z]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r * 0.85, h, 10]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

function Sofa({ color }: ModelProps) {
  const w = 2.0, d = 0.9, seatH = 0.42;
  return (
    <group>
      <mesh position={[0, seatH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, seatH, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, seatH + 0.22, -d / 2 + 0.09]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.44, 0.18]} />
        <meshStandardMaterial color={shade(color, -12)} roughness={0.85} />
      </mesh>
      <mesh position={[-w / 2 + 0.09, seatH + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.36, d]} />
        <meshStandardMaterial color={shade(color, -18)} roughness={0.85} />
      </mesh>
      <mesh position={[w / 2 - 0.09, seatH + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.36, d]} />
        <meshStandardMaterial color={shade(color, -18)} roughness={0.85} />
      </mesh>
      {[-0.35, 0, 0.35].map((cx, i) => (
        <mesh key={i} position={[cx * (w / 2), seatH + 0.06, 0.06]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.14, d - 0.2]} />
          <meshStandardMaterial color={shade(color, 8)} roughness={0.9} />
        </mesh>
      ))}
      {[[-w / 2 + 0.12, -d / 2 + 0.12], [w / 2 - 0.12, -d / 2 + 0.12], [-w / 2 + 0.12, d / 2 - 0.12], [w / 2 - 0.12, d / 2 - 0.12]].map(
        ([x, z], i) => (
          <Leg key={i} x={x} z={z} h={0.14} r={0.03} color={METAL} />
        )
      )}
    </group>
  );
}

function Armchair({ color }: ModelProps) {
  const w = 0.8, d = 0.85, seatH = 0.42;
  return (
    <group>
      <mesh position={[0, seatH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, seatH, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, seatH + 0.24, -d / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.48, 0.2]} />
        <meshStandardMaterial color={shade(color, -12)} roughness={0.85} />
      </mesh>
      <mesh position={[-w / 2 + 0.09, seatH + 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.4, d]} />
        <meshStandardMaterial color={shade(color, -18)} roughness={0.85} />
      </mesh>
      <mesh position={[w / 2 - 0.09, seatH + 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.4, d]} />
        <meshStandardMaterial color={shade(color, -18)} roughness={0.85} />
      </mesh>
      {[[-w / 2 + 0.12, -d / 2 + 0.12], [w / 2 - 0.12, -d / 2 + 0.12], [-w / 2 + 0.12, d / 2 - 0.12], [w / 2 - 0.12, d / 2 - 0.12]].map(
        ([x, z], i) => (
          <Leg key={i} x={x} z={z} h={0.16} r={0.03} color={WOOD} />
        )
      )}
    </group>
  );
}

function DiningChair({ color }: ModelProps) {
  const seatH = 0.46;
  return (
    <group>
      <mesh position={[0, seatH, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, seatH + 0.28, -0.19]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.56, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => (
        <Leg key={i} x={x} z={z} h={seatH} r={0.02} color={shade(color, -20)} />
      ))}
    </group>
  );
}

function TableBase({ w, d, h, color, legColor }: { w: number; d: number; h: number; color: string; legColor: string }) {
  return (
    <group>
      <mesh position={[0, h, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.05, d]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[[-w / 2 + 0.06, -d / 2 + 0.06], [w / 2 - 0.06, -d / 2 + 0.06], [-w / 2 + 0.06, d / 2 - 0.06], [w / 2 - 0.06, d / 2 - 0.06]].map(
        ([x, z], i) => (
          <Leg key={i} x={x} z={z} h={h} r={0.03} color={legColor} />
        )
      )}
    </group>
  );
}

function CoffeeTable({ color }: ModelProps) {
  return <TableBase w={1.1} d={0.6} h={0.4} color={color} legColor={shade(color, -25)} />;
}

function DiningTable({ color }: ModelProps) {
  return <TableBase w={1.6} d={0.9} h={0.75} color={color} legColor={shade(color, -25)} />;
}

function SideTable({ color }: ModelProps) {
  return <TableBase w={0.45} d={0.45} h={0.55} color={color} legColor={shade(color, -25)} />;
}

function Bookshelf({ color }: ModelProps) {
  const w = 0.9, d = 0.32, h = 1.8;
  const shelves = 4;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {Array.from({ length: shelves }).map((_, i) => (
        <mesh key={i} position={[0, (h / (shelves + 1)) * (i + 1), 0.01]} castShadow receiveShadow>
          <boxGeometry args={[w - 0.06, 0.03, d - 0.06]} />
          <meshStandardMaterial color={shade(color, -15)} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function TvStand({ color }: ModelProps) {
  const w = 1.5, d = 0.4, h = 0.45;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, h + 0.38, -d / 2 + 0.03]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.75, 0.46, 0.05]} />
        <meshStandardMaterial color="#111318" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Wardrobe({ color }: ModelProps) {
  const w = 1.2, d = 0.6, h = 2.0;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, h / 2, d / 2 + 0.001]} castShadow receiveShadow>
        <boxGeometry args={[0.02, h - 0.1, 0.02]} />
        <meshStandardMaterial color={shade(color, -40)} />
      </mesh>
      {[-0.13, 0.13].map((x, i) => (
        <mesh key={i} position={[x, h * 0.55, d / 2 + 0.01]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color="#c9a24b" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Bed({ color }: ModelProps) {
  const w = 1.6, d = 2.05, frameH = 0.28;
  return (
    <group>
      <mesh position={[0, frameH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, frameH, d]} />
        <meshStandardMaterial color={shade(color, -35)} roughness={0.8} />
      </mesh>
      <mesh position={[0, frameH + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.06, 0.2, d - 0.1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, frameH + 0.45, -d / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.7, 0.08]} />
        <meshStandardMaterial color={shade(color, -20)} roughness={0.8} />
      </mesh>
      {[-w / 2 + 0.3, w / 2 - 0.3].map((x, i) => (
        <mesh key={i} position={[x, frameH + 0.24, -d / 2 + 0.28]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.16, 0.35]} />
          <meshStandardMaterial color="#ffffff" roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, frameH + 0.2, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.1, 0.06, d - 0.7]} />
        <meshStandardMaterial color={shade(color, 20)} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Nightstand({ color }: ModelProps) {
  const w = 0.45, d = 0.4, h = 0.5;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, h * 0.55, d / 2 + 0.001]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.08, h * 0.3, 0.02]} />
        <meshStandardMaterial color={shade(color, -15)} roughness={0.6} />
      </mesh>
    </group>
  );
}

function FloorLamp({ color }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.5, 10]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.22, 0.32, 20, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PendantLamp({ color }: ModelProps) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.3, 8]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, -0.08, 0]} intensity={0.6} color="#ffdca8" distance={3} />
    </group>
  );
}

function Plant({ color }: ModelProps) {
  const foliage = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => {
        const angle = i * 2.399963; // golden angle spread, deterministic
        const r = 0.05 + (i % 3) * 0.045;
        return {
          x: Math.cos(angle) * r,
          z: Math.sin(angle) * r,
          y: 0.55 + (i % 4) * 0.085,
          s: 0.16 + (i % 3) * 0.04,
        };
      }),
    []
  );
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.19, 0.15, 0.36, 16]} />
        <meshStandardMaterial color="#a3532f" roughness={0.9} />
      </mesh>
      {foliage.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]} castShadow receiveShadow>
          <sphereGeometry args={[f.s, 10, 10]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Rug({ color }: ModelProps) {
  return (
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2.2, 1.5]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

function Desk({ color }: ModelProps) {
  const w = 1.2, d = 0.6, h = 0.73;
  return (
    <group>
      <TableBase w={w} d={d} h={h} color={color} legColor={shade(color, -25)} />
      <mesh position={[w / 2 - 0.22, h - 0.14, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.28, d - 0.08]} />
        <meshStandardMaterial color={shade(color, -20)} roughness={0.7} />
      </mesh>
    </group>
  );
}

function OfficeChair({ color }: ModelProps) {
  const seatH = 0.48;
  return (
    <group>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 24]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, seatH * 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.025, seatH * 0.95, 10]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, seatH, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.08, 0.44]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, seatH + 0.3, -0.19]} rotation={[-0.12, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.56, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} position={[x, seatH + 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 0.2, 0.3]} />
          <meshStandardMaterial color={shade(color, -20)} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Ottoman({ color }: ModelProps) {
  const h = 0.4;
  return (
    <group>
      <mesh position={[0, h / 2 + 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, h, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map(([x, z], i) => (
        <Leg key={i} x={x} z={z} h={0.08} r={0.025} color={shade(color, -30)} />
      ))}
    </group>
  );
}

function ConsoleTable({ color }: ModelProps) {
  const w = 1.1, d = 0.35, h = 0.78;
  return (
    <group>
      <TableBase w={w} d={d} h={h} color={color} legColor={shade(color, -25)} />
      <mesh position={[0, h * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.14, 0.03, d - 0.1]} />
        <meshStandardMaterial color={shade(color, -10)} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Mirror({ color }: ModelProps) {
  const w = 0.55, h = 1.5;
  return (
    <group>
      <mesh position={[0, h / 2 + 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, h / 2 + 0.06, 0.023]} castShadow>
        <boxGeometry args={[w - 0.08, h - 0.08, 0.01]} />
        <meshStandardMaterial color="#c7d6de" roughness={0.05} metalness={0.6} />
      </mesh>
      <Leg x={-w / 2 + 0.08} z={0.12} h={0.12} r={0.02} color={shade(color, -25)} />
      <Leg x={w / 2 - 0.08} z={0.12} h={0.12} r={0.02} color={shade(color, -25)} />
    </group>
  );
}

function Dresser({ color }: ModelProps) {
  const w = 1.0, d = 0.5, h = 0.85;
  const drawers = 3;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      {Array.from({ length: drawers }).map((_, i) => {
        const drawerH = (h - 0.1) / drawers;
        const y = 0.05 + drawerH * i + drawerH / 2;
        return (
          <group key={i}>
            <mesh position={[0, y, d / 2 + 0.001]} castShadow receiveShadow>
              <boxGeometry args={[w - 0.08, drawerH - 0.04, 0.02]} />
              <meshStandardMaterial color={shade(color, -12)} roughness={0.65} />
            </mesh>
            <mesh position={[0, y, d / 2 + 0.015]} castShadow>
              <boxGeometry args={[0.14, 0.025, 0.025]} />
              <meshStandardMaterial color="#c9a24b" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const REGISTRY: Record<string, (p: ModelProps) => JSX.Element> = {
  "sofa-3seat": Sofa,
  armchair: Armchair,
  "dining-chair": DiningChair,
  "coffee-table": CoffeeTable,
  "dining-table": DiningTable,
  "side-table": SideTable,
  bookshelf: Bookshelf,
  "tv-stand": TvStand,
  wardrobe: Wardrobe,
  "bed-queen": Bed,
  nightstand: Nightstand,
  "floor-lamp": FloorLamp,
  "pendant-lamp": PendantLamp,
  plant: Plant,
  rug: Rug,
  desk: Desk,
  "office-chair": OfficeChair,
  ottoman: Ottoman,
  "console-table": ConsoleTable,
  mirror: Mirror,
  dresser: Dresser,
};

export function FurnitureModel({ catalogId, color }: { catalogId: string; color: string }) {
  const Cmp = REGISTRY[catalogId];
  if (!Cmp) {
    return (
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  return <Cmp color={color} />;
}
