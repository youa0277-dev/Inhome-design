export interface MaterialMeta {
  id: string;
  label: string;
  swatch: string;
}

export const FLOOR_MATERIALS: MaterialMeta[] = [
  { id: "oak-light", label: "Light Oak", swatch: "#d9bd93" },
  { id: "oak-dark", label: "Walnut", swatch: "#6b4a34" },
  { id: "herringbone", label: "Herringbone", swatch: "#b58a5c" },
  { id: "gray-tile", label: "Gray Tile", swatch: "#a9adb0" },
  { id: "checker-tile", label: "Checkerboard", swatch: "#e7e4dc" },
  { id: "concrete", label: "Polished Concrete", swatch: "#b8b7b2" },
  { id: "carpet", label: "Soft Carpet", swatch: "#cfc3b0" },
];

export const BACKSPLASH_MATERIALS: MaterialMeta[] = [
  { id: "subway-white", label: "White Subway", swatch: "#f4f2ee" },
  { id: "subway-black", label: "Black Subway", swatch: "#2b2b2b" },
  { id: "hex-white", label: "White Hex", swatch: "#efece5" },
  { id: "marble", label: "Marble", swatch: "#e9e6e0" },
  { id: "terracotta", label: "Terracotta", swatch: "#c1693f" },
];

export const WALL_PAINTS: string[] = [
  "#f2ede3",
  "#ffffff",
  "#e7e0d4",
  "#d9d2c1",
  "#c9d3c8",
  "#a9bfb4",
  "#8fa6a0",
  "#b7c4d6",
  "#7c94ad",
  "#d9c3b0",
  "#c98a6b",
  "#8a5a44",
  "#e0b0b8",
  "#c96b7c",
  "#3f3f46",
  "#1f2937",
];

function drawWoodPlanks(ctx: CanvasRenderingContext2D, size: number, base: string, dark: string, plankH: number, herringbone = false) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  if (herringbone) {
    const tile = plankH * 2;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2;
    for (let y = -size; y < size * 2; y += tile) {
      for (let x = -size; x < size * 2; x += tile) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-tile / 2, -tile / 4, tile, tile / 2);
        ctx.restore();
      }
    }
    return;
  }
  const rows = Math.round(size / plankH);
  for (let r = 0; r < rows; r++) {
    const y = r * plankH;
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
    const offset = (r % 2) * 60;
    const plankW = 90;
    for (let x = -offset; x < size; x += plankW) {
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + plankH);
      ctx.stroke();
      const shade = Math.random() * 14 - 7;
      ctx.fillStyle = shadeColor(base, shade);
      ctx.fillRect(x, y, plankW, plankH);
      // grain lines
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      for (let g = 0; g < 3; g++) {
        const gy = y + 6 + g * (plankH / 4);
        ctx.beginPath();
        ctx.moveTo(x + 4, gy + Math.random() * 4);
        ctx.lineTo(x + plankW - 4, gy + Math.random() * 4);
        ctx.stroke();
      }
    }
  }
}

function shadeColor(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}

function drawTiles(ctx: CanvasRenderingContext2D, size: number, base: string, grout: string, cols: number, checker = false, altColor?: string) {
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, size, size);
  const tile = size / cols;
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const isAlt = checker && (x + y) % 2 === 0;
      ctx.fillStyle = isAlt ? altColor ?? base : base;
      ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
    }
  }
}

function drawConcrete(ctx: CanvasRenderingContext2D, size: number, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = Math.random() * 20 - 10;
    ctx.fillStyle = shadeColor(base, shade);
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawCarpet(ctx: CanvasRenderingContext2D, size: number, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = Math.random() * 16 - 8;
    ctx.fillStyle = shadeColor(base, shade);
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

function drawSubwayBrick(ctx: CanvasRenderingContext2D, size: number, base: string, grout: string) {
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, size, size);
  const th = size / 6;
  const tw = th * 2;
  let row = 0;
  for (let y = 0; y < size; y += th) {
    const offset = row % 2 === 0 ? 0 : tw / 2;
    for (let x = -tw; x < size + tw; x += tw) {
      ctx.fillStyle = shadeColor(base, Math.random() * 8 - 4);
      ctx.fillRect(x + offset + 2, y + 2, tw - 4, th - 4);
    }
    row++;
  }
}

function drawHex(ctx: CanvasRenderingContext2D, size: number, base: string, grout: string) {
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, size, size);
  const r = size / 12;
  const hexH = r * 1.75;
  for (let row = -1; row < 14; row++) {
    for (let col = -1; col < 8; col++) {
      const x = col * r * 3 + (row % 2 === 0 ? 0 : r * 1.5);
      const y = row * hexH;
      drawHexagon(ctx, x, y, r - 2, shadeColor(base, Math.random() * 10 - 5));
    }
  }
}

function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawMarble(ctx: CanvasRenderingContext2D, size: number, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(150,150,150,0.25)";
  for (let i = 0; i < 10; i++) {
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    let x = Math.random() * size;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      x += Math.random() * 40 - 20;
      y += 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

export function drawFloorMaterial(canvas: HTMLCanvasElement, materialId: string) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  switch (materialId) {
    case "oak-light":
      drawWoodPlanks(ctx, size, "#d9bd93", "#a3805a", size / 12);
      break;
    case "oak-dark":
      drawWoodPlanks(ctx, size, "#6b4a34", "#3d2a1c", size / 12);
      break;
    case "herringbone":
      drawWoodPlanks(ctx, size, "#b58a5c", "#7a5636", size / 16, true);
      break;
    case "gray-tile":
      drawTiles(ctx, size, "#a9adb0", "#8b8e91", 6);
      break;
    case "checker-tile":
      drawTiles(ctx, size, "#f2efe8", "#c9c4b8", 8, true, "#2b2b2b");
      break;
    case "concrete":
      drawConcrete(ctx, size, "#b8b7b2");
      break;
    case "carpet":
      drawCarpet(ctx, size, "#cfc3b0");
      break;
    default:
      drawWoodPlanks(ctx, size, "#d9bd93", "#a3805a", size / 12);
  }
}

export function drawBacksplashMaterial(canvas: HTMLCanvasElement, materialId: string) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  switch (materialId) {
    case "subway-white":
      drawSubwayBrick(ctx, size, "#f4f2ee", "#c9c4b8");
      break;
    case "subway-black":
      drawSubwayBrick(ctx, size, "#2b2b2b", "#111111");
      break;
    case "hex-white":
      drawHex(ctx, size, "#efece5", "#c9c4b8");
      break;
    case "marble":
      drawMarble(ctx, size, "#e9e6e0");
      break;
    case "terracotta":
      drawTiles(ctx, size, "#c1693f", "#8f4a2b", 6);
      break;
    default:
      drawSubwayBrick(ctx, size, "#f4f2ee", "#c9c4b8");
  }
}
