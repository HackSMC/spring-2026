import { useEffect, useRef } from "react";

const PIXEL = 4;

// Seeded PRNG (mulberry32) — produces the same "random" sequence for a given
// seed so star positions stay consistent frame-to-frame, but look scattered at
// every window size (unlike modular arithmetic which creates lattice patterns).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── SKY COLOR KEYFRAMES ─────────────────────────────────────────────────────
// Each entry defines a progress value (0.0–1.0) and the RGB colors for the
// top of the sky and the horizon. The draw loop interpolates between these.
interface SkyKeyframe {
  progress: number;
  top: [number, number, number];
  bottom: [number, number, number];
}
const SKY_KEYFRAMES: SkyKeyframe[] = [
  { progress: 0.0, top: [5, 8, 25], bottom: [15, 25, 55] },
  { progress: 0.18, top: [5, 8, 25], bottom: [15, 25, 55] },
  { progress: 0.22, top: [25, 30, 80], bottom: [180, 100, 80] },
  { progress: 0.25, top: [60, 120, 200], bottom: [240, 160, 100] },
  { progress: 0.4, top: [80, 160, 235], bottom: [135, 210, 250] },
  { progress: 0.5, top: [80, 160, 235], bottom: [135, 210, 250] },
  { progress: 0.73, top: [80, 155, 230], bottom: [130, 200, 240] },
  { progress: 0.75, top: [60, 80, 160], bottom: [240, 120, 60] },
  { progress: 0.78, top: [15, 18, 50], bottom: [50, 25, 45] },
  { progress: 0.82, top: [5, 8, 25], bottom: [15, 25, 55] },
  { progress: 1.0, top: [5, 8, 25], bottom: [15, 25, 55] },
];

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const c = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * c),
    Math.round(a[1] + (b[1] - a[1]) * c),
    Math.round(a[2] + (b[2] - a[2]) * c),
  ];
}

function getSkyColors(sunProgress: number): {
  top: [number, number, number];
  bottom: [number, number, number];
} {
  const p = Math.max(0, Math.min(1, sunProgress));
  // Find the two surrounding keyframes
  let lo = SKY_KEYFRAMES[0];
  let hi = SKY_KEYFRAMES[1];
  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    if (p >= SKY_KEYFRAMES[i].progress && p <= SKY_KEYFRAMES[i + 1].progress) {
      lo = SKY_KEYFRAMES[i];
      hi = SKY_KEYFRAMES[i + 1];
      break;
    }
  }
  const range = hi.progress - lo.progress;
  const t = range > 0 ? (p - lo.progress) / range : 0;
  return {
    top: lerpColor(lo.top, hi.top, t),
    bottom: lerpColor(lo.bottom, hi.bottom, t),
  };
}

// Compute continuous opacity values from sunProgress
function getStarOpacity(sunProgress: number): number {
  // Stars fade in during dusk (0.73 -> 0.82) and fade out during dawn (0.18 -> 0.27)
  if (sunProgress >= 0.82 || sunProgress <= 0.18) return 1;
  if (sunProgress >= 0.73 && sunProgress < 0.82)
    return (sunProgress - 0.73) / 0.09;
  if (sunProgress > 0.18 && sunProgress <= 0.27)
    return 1 - (sunProgress - 0.18) / 0.09;
  return 0;
}

function getBoatOpacity(sunProgress: number): number {
  // Boats visible during day, fade during dusk/dawn
  if (sunProgress >= 0.25 && sunProgress <= 0.73) return 1;
  if (sunProgress >= 0.2 && sunProgress < 0.25)
    return (sunProgress - 0.2) / 0.05;
  if (sunProgress > 0.73 && sunProgress <= 0.78)
    return 1 - (sunProgress - 0.73) / 0.05;
  return 0;
}

function getOverlayIntensity(sunProgress: number): number {
  // 0 = no overlay (full day), 1 = full night overlay
  if (sunProgress >= 0.27 && sunProgress <= 0.73) return 0;
  if (sunProgress >= 0.82 || sunProgress <= 0.18) return 1;
  if (sunProgress > 0.73 && sunProgress < 0.82)
    return (sunProgress - 0.73) / 0.09;
  if (sunProgress > 0.18 && sunProgress < 0.27)
    return 1 - (sunProgress - 0.18) / 0.09;
  return 0;
}

// Sun arc: visible between sunProgress 0.22 and 0.78
// At 0.25 (sunrise): right side (east/mountains). At 0.50 (noon): top center. At 0.75 (sunset): left side (west/ocean).
function getSunPosition(
  sunProgress: number,
  W: number,
  H: number,
): { x: number; y: number; visible: boolean; color: string } {
  if (sunProgress < 0.22 || sunProgress > 0.78) {
    return { x: 0, y: 0, visible: false, color: PALETTE.sun };
  }
  // Map 0.22–0.78 to 0–1
  const t = (sunProgress - 0.22) / 0.56;
  // x: right (east) to left (west) — reversed because in Santa Monica, east is inland (right), west is ocean (left)
  const x = W * (0.85 - t * 0.7);
  // y: parabolic arc — lowest at edges, highest at center (t=0.5)
  const peakY = H * 0.12;
  const horizonY = H * 0.5;
  const y = horizonY - (horizonY - peakY) * (1 - Math.pow(2 * t - 1, 2));

  // Sun color: yellow at midday, orange/red near sunrise/sunset
  const edgeDist = Math.min(t, 1 - t); // 0 at edges, 0.5 at center
  const redness = 1 - Math.min(1, edgeDist * 4); // 1 at edges, 0 by 0.25
  const r = 255;
  const g = Math.round(238 - redness * 100);
  const b = Math.round(68 - redness * 40);
  const color = `rgb(${r},${g},${b})`;

  return { x, y, visible: true, color };
}

// Moon arc: visible during night phases, peaks at midnight
function getMoonPosition(
  sunProgress: number,
  W: number,
  H: number,
): { x: number; y: number; visible: boolean } {
  // Moon visible when sun is not: progress < 0.22 or > 0.78
  if (sunProgress >= 0.22 && sunProgress <= 0.78) {
    return { x: 0, y: 0, visible: false };
  }
  // Normalize night progress: 0.78 -> 0, 1.0/0.0 -> 0.5, 0.22 -> 1
  let nightT: number;
  if (sunProgress >= 0.78) {
    nightT = (sunProgress - 0.78) / 0.44; // 0.78->0, 1.0->0.5
  } else {
    nightT = (sunProgress + 0.22) / 0.44; // 0.0->0.5, 0.22->1.0
  }
  // x: moves right to left across the sky (east to west)
  const x = W * (0.85 - nightT * 0.7);
  // y: parabolic arc peaking at midnight (nightT=0.5)
  const peakY = H * 0.15;
  const horizonY = H * 0.5;
  const y = horizonY - (horizonY - peakY) * (1 - Math.pow(2 * nightT - 1, 2));

  return { x, y, visible: true };
}

const PALETTE = {
  sky: "#4a90d9",
  skyLight: "#6aace6",
  sun: "#ffee44",
  sunGlow: "#ffdd33",
  mountain: "#5b8a5b",
  ocean: "#2277aa",
  oceanWave: "#3399bb",
  shallows: "#55bbcc",
  wetSand: "#c2a878",
  sand: "#dcc898",
  cloudLight: "#f0f4f8",
  cloudDark: "#d0dce8",
  cloudShadow: "#b0c0d0",
  star: "#ffffff",
  // Pier colors
  pierDeck: "#cc7722",
  pierPlank: "#aa5500",
  pierPylon: "#884400",
  pierRail: "#ffaa33",
  pierLight: "#ffee88",
  // Building colors
  buildingSilhouette: "#8a8a8a",
  buildingDark: "#6a6a6a",
  buildingWindow: "#aaddee",
  buildingWindowDim: "#778899",
  // Ferris wheel colors
  ferrisFrame: "#cc6600",
  ferrisRim: "#ee8833",
  ferrisHub: "#ffaa44",
  ferrisGondola: "#ff4444",
  ferrisGondola2: "#4488ff",
  ferrisCable: "#aa5500",
  // Palm tree colors
  trunkDark: "#6b4423",
  trunkLight: "#8b6533",
  frondDark: "#2d8b4a",
  frondLight: "#44bb66",
  // Bike path
  bikePath: "#aab8b8",
  bikePathEdge: "#889898",
  bikePathDash: "#e8f0f0",
  // Venice arch
  veniceArch: "#bb7733",
  veniceArchLight: "#dd9955",
  veniceText: "#ffeecc",
  // Building variety
  buildingWindowWarm: "#ffcc77",
  buildingWindowCool: "#88bbdd",
  rooftopBeacon: "#ff3333",
  rooftopBeaconDim: "#992222",
  // Roads
  road: "#555555",
  roadLine: "#cccc88",
  // Lifeguard tower
  lifeguardBase: "#dd5555",
  lifeguardRoof: "#eeeeee",
  // Boats
  boatHull: "#884422",
  boatSail: "#f0f0f0",
  // Street vegetation
  streetTreeTrunk: "#5a3a1a",
  streetTreeCanopy: "#3a9a3a",
  streetTreeLight: "#55cc55",
  grassPatch: "#4aaa4a",
  // Beach life
  umbrellaRed: "#dd3333",
  umbrellaBlue: "#3366cc",
  umbrellaYellow: "#ddcc33",
  towel: "#cc6688",
  towelBlue: "#5588cc",
  volleyballPole: "#aa8844",
  volleyballNet: "#ccccaa",
  surfboard: "#ee7733",
  // Extra beach life
  skinTone: "#e8b88a",
  skinToneDark: "#c4956a",
  swimTrunk: "#2255aa",
  bikini: "#ee4488",
  muscleBar: "#888888",
  muscleFrame: "#777777",
  bonfireEmber: "#cc4400",
} as const;

// ─── TWEAK THESE TO ADJUST THE SCENE ───────────────────────────────────────
const MOUNTAIN_START_X = 0.75; // 0–1: how far right mountains begin (higher = more right)
const MOUNTAIN_END_X = 1.0; // 0–1: right edge of mountain range
const MOUNTAIN_HEIGHT = 70; // max peak height in px
const BEACH_BOTTOM_X = 0.25; // beach bottom-left anchor — higher = more sand bottom-left
const BEACH_HORIZON_X = 0.9; // where beach meets horizon (right side)
const BEACH_CTRL_X = 0.55; // bezier control — pulls the mid-curve left for a sweeping arc
// ───────────────────────────────────────────────────────────────────────────

export { PALETTE };

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
}
interface Bird {
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  scale: number;
}
interface PalmTree {
  x: number;
  y: number;
  height: number;
  swayPhase: number;
  scale: number;
}
interface Airliner {
  x: number;
  y: number;
  speed: number;
}
interface AnimState {
  clouds: Cloud[];
  birds: Bird[];
  palmTrees: PalmTree[];
  airliner: Airliner;
  ferrisAngle: number;
  t: number;
  animId: number | null;
}

function snap(v: number): number {
  return Math.round(v / PIXEL) * PIXEL;
}

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(snap(x), snap(y), snap(w), snap(h));
}

// Replicates the exact shift logic from drawBeach() so new elements
// placed along the shore use the true visual beach edge.
function getActualBeachEdge(
  y: number,
  W: number,
  H: number,
  horizonY: number,
): number {
  const oceanH = H - horizonY;
  if (oceanH <= 0) return W; // no beach visible
  const rawEdgeX = beachEdgeX(y, W, H, horizonY);
  const progress = (y - horizonY) / oceanH;
  const startOffset = 0.2;
  const adjustedProgress = Math.max(
    0,
    (progress - startOffset) / (1 - startOffset),
  );
  const shift = Math.pow(adjustedProgress, 2) * W * 0.4;
  return snap(rawEdgeX - shift);
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  const s = Math.round(PIXEL * scale);
  // Snap origin ONCE so all parts move as one unit
  const ox = snap(x);
  const oy = snap(y);

  // Shadow layer (offset down-right)
  ctx.fillStyle = PALETTE.cloudShadow;
  ctx.fillRect(ox + s * 2, oy + s * 5, s * 8, s);
  ctx.fillRect(ox + s, oy + s * 4, s * 9, s);

  // Dark mid-tone (bottom bulk)
  ctx.fillStyle = PALETTE.cloudDark;
  ctx.fillRect(ox, oy + s * 3, s * 10, s);
  ctx.fillRect(ox + s, oy + s * 4, s * 8, s);

  // Main body (bright white)
  ctx.fillStyle = PALETTE.cloudLight;
  ctx.fillRect(ox, oy + s * 2, s * 10, s);
  ctx.fillRect(ox + s, oy + s, s * 8, s);
  // Top puffs — uneven bumps for cumulus look
  ctx.fillRect(ox + s, oy, s * 4, s);
  ctx.fillRect(ox + s * 5, oy, s * 3, s);
  ctx.fillRect(ox + s * 3, oy - s, s * 3, s);
}

function drawSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  const cx = snap(x);
  const cy = snap(y);

  // Animated rays — 12 rays that rotate slowly and pulse in length
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + t * 0.002;
    const pulse = Math.sin(t * 0.01 + i * 0.8) * 0.3 + 1;
    const innerR = r + PIXEL * 2;
    const outerR = innerR + PIXEL * (3 + pulse * 2);
    // Draw ray as a series of pixel dots along the line
    for (let s = 0; s <= 1; s += 0.25) {
      const dist = innerR + (outerR - innerR) * s;
      const rx = snap(cx + Math.cos(angle) * dist);
      const ry = snap(cy + Math.sin(angle) * dist);
      const color = s < 0.5 ? PALETTE.sun : PALETTE.sunGlow;
      drawPixelRect(ctx, rx, ry, PIXEL, PIXEL, color);
    }
  }

  // Outer glow ring — pulsing
  const glowR = r + PIXEL + Math.sin(t * 0.008) * PIXEL;
  for (let a = 0; a < Math.PI * 2; a += 0.18) {
    const gx = snap(cx + Math.cos(a) * glowR);
    const gy = snap(cy + Math.sin(a) * glowR);
    drawPixelRect(ctx, gx, gy, PIXEL, PIXEL, PALETTE.sunGlow);
  }

  // Sun body — pixel circle (filled)
  for (let dy = -r; dy <= r; dy += PIXEL) {
    for (let dx = -r; dx <= r; dx += PIXEL) {
      if (dx * dx + dy * dy <= r * r) {
        drawPixelRect(ctx, cx + dx, cy + dy, PIXEL, PIXEL, PALETTE.sun);
      }
    }
  }

  // Bright highlight spot
  drawPixelRect(
    ctx,
    cx - PIXEL * 2,
    cy - PIXEL * 2,
    PIXEL * 2,
    PIXEL * 2,
    "#ffffaa",
  );
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
): void {
  const rng = mulberry32(42);
  for (let i = 0; i < 30; i++) {
    const sx = snap(rng() * W);
    const sy = snap(rng() * H * 0.45);
    if (Math.sin(t * 0.0005 + i * 1.3) > 0.3) {
      drawPixelRect(ctx, sx, sy, PIXEL, PIXEL, PALETTE.star);
    }
  }
}

function drawMountains(
  ctx: CanvasRenderingContext2D,
  W: number,
  horizonY: number,
): void {
  const startX = W * MOUNTAIN_START_X;
  const endX = W * MOUNTAIN_END_X;
  for (let x = startX; x <= endX; x += PIXEL) {
    const nx = x - startX;
    const rangeW = endX - startX;
    const leftFlat = Math.min(1, nx / (rangeW * 0.15));
    const height =
      leftFlat *
        (Math.abs(Math.sin(nx * 0.003)) * MOUNTAIN_HEIGHT +
          Math.sin(nx * 0.004) * (MOUNTAIN_HEIGHT * 0.2)) +
      4;
    const top = snap(horizonY - height);
    drawPixelRect(ctx, x, top, PIXEL, horizonY - top, PALETTE.mountain);
  }
}

function drawSmallTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  // 1px trunk, 3px tall
  drawPixelRect(
    ctx,
    x,
    y - PIXEL * 3,
    PIXEL,
    PIXEL * 3,
    PALETTE.streetTreeTrunk,
  );
  // 3x2 canopy
  drawPixelRect(
    ctx,
    x - PIXEL,
    y - PIXEL * 5,
    PIXEL * 3,
    PIXEL * 2,
    PALETTE.streetTreeCanopy,
  );
  // Light highlight
  drawPixelRect(ctx, x, y - PIXEL * 5, PIXEL, PIXEL, PALETTE.streetTreeLight);
}

function drawCoastalBuildings(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
  t: number,
  lightsOnly = false,
): void {
  const oceanH = H - horizonY;
  if (oceanH <= 0) return;

  const roadPositions = [0.38, 0.6, 0.8];

  // Helper: compute smooth edge + sandWidth for a given y
  function getSmoothEdge(y: number) {
    const rawBase = beachBaseX(y, W, H, horizonY);
    const progress = (y - horizonY) / oceanH;
    const startOffset = 0.2;
    const adjustedProgress = Math.max(
      0,
      (progress - startOffset) / (1 - startOffset),
    );
    const shift = Math.pow(adjustedProgress, 2) * W * 0.4;
    const smoothEdge = snap(rawBase - shift);
    const sandWidth = W - smoothEdge;
    return { smoothEdge, sandWidth, progress };
  }

  // --- 1) DRAW ALL PARALLEL ROADS ---
  if (!lightsOnly) {
    for (let y = horizonY; y <= H; y += PIXEL) {
      const { smoothEdge, sandWidth, progress } = getSmoothEdge(y);
      if (sandWidth < PIXEL * 12) continue;
      const yPct = progress;

      for (const rPos of roadPositions) {
        const roadX = snap(smoothEdge + sandWidth * rPos);
        if (roadX < smoothEdge + PIXEL * 4) continue; // skip if too close to shore
        if (roadX > W - PIXEL * 4) continue; // skip if off screen
        const roadW = snap(Math.max(PIXEL * 4, PIXEL * 5 * (1 + yPct * 0.5)));
        drawPixelRect(ctx, roadX, y, roadW, PIXEL, PALETTE.road);
        if (Math.floor(y / (PIXEL * 3)) % 2 === 0) {
          drawPixelRect(
            ctx,
            roadX + Math.floor(roadW / 2),
            y,
            PIXEL,
            PIXEL,
            PALETTE.roadLine,
          );
        }
      }

      // Street trees along roads (every ~14 pixels along Y)
      if (Math.floor(y / (PIXEL * 14)) % 1 === 0 && y % (PIXEL * 14) === 0) {
        for (let ri = 0; ri < roadPositions.length; ri++) {
          const rPos = roadPositions[ri];
          const roadX = snap(smoothEdge + sandWidth * rPos);
          if (roadX < smoothEdge + PIXEL * 4 || roadX > W - PIXEL * 6) continue;
          const roadW = snap(Math.max(PIXEL * 4, PIXEL * 5 * (1 + yPct * 0.5)));
          // Alternate which side of the road the tree is on
          const side =
            (Math.floor(y / (PIXEL * 14)) + ri) % 2 === 0
              ? -PIXEL * 2
              : roadW + PIXEL;
          drawSmallTree(ctx, roadX + side, y);
        }
      }
    }
  }

  // --- 2) ANGLED CROSS STREETS + BUILDING CLUSTERS ---
  const blockCount = 8;
  let buildingIdx = 0;
  for (let block = 0; block < blockCount; block++) {
    const yPct = 0.02 + (block / blockCount) * 1.05;
    const blockTopY = snap(horizonY + oceanH * yPct);
    const blockBotY = snap(horizonY + oceanH * (yPct + 0.95 / blockCount));
    const blockH = blockBotY - blockTopY;
    const midY = snap((blockTopY + blockBotY) / 2);

    const { smoothEdge, sandWidth } = getSmoothEdge(midY);
    if (sandWidth < PIXEL * 14) continue;

    const depthScale = 1.2 + yPct * 0.8;

    // Horizontal cross street — spans from first road to screen edge
    const crossInfo = getSmoothEdge(blockTopY);
    const crossRoadX = snap(
      crossInfo.smoothEdge + crossInfo.sandWidth * roadPositions[0],
    );
    const crossW = snap(Math.max(PIXEL * 2, PIXEL * 2 * depthScale));
    if (!lightsOnly) {
      drawPixelRect(
        ctx,
        crossRoadX,
        blockTopY,
        W - crossRoadX,
        crossW,
        PALETTE.road,
      );
      // Center dashes on horizontal cross street (2px wide strips with 3px gaps)
      const dashY = snap(blockTopY + Math.floor(crossW / 2));
      for (let dx = crossRoadX; dx < W; dx += PIXEL * 5) {
        drawPixelRect(ctx, snap(dx), dashY, PIXEL * 2, PIXEL, PALETTE.roadLine);
      }
    }

    // --- BUILDING COLUMNS: fill gaps between consecutive roads ---
    const halfBlock = Math.floor(blockH / 2);
    const maxRowH = snap(blockH * 0.7);

    // Compute road X positions and widths at midY for column boundaries
    const roadXs: number[] = [];
    const roadWs: number[] = [];
    for (const rPos of roadPositions) {
      const rx = snap(smoothEdge + sandWidth * rPos);
      const rw = snap(Math.max(PIXEL * 4, PIXEL * 5 * (1 + yPct * 0.5)));
      roadXs.push(rx);
      roadWs.push(rw);
    }

    // Columns: between road[i] right edge and road[i+1] left edge, plus last road to screen edge
    const columns: { startX: number; endX: number }[] = [];
    for (let i = 0; i < roadXs.length; i++) {
      const colStart = roadXs[i] + roadWs[i] + PIXEL;
      const colEnd =
        i < roadXs.length - 1 ? roadXs[i + 1] - PIXEL : W - PIXEL * 2;
      if (colEnd - colStart >= PIXEL * 8) {
        columns.push({ startX: colStart, endX: colEnd });
      }
    }

    // Two rows per block, buildings fill each column
    for (let row = 0; row < 2; row++) {
      const baseY =
        row === 0 ? blockTopY + crossW + halfBlock - PIXEL * 2 : blockBotY;

      for (const col of columns) {
        let cursor = col.startX;
        let bIdx = 0;
        while (cursor < col.endX) {
          let seed = buildingIdx * 137 + block * 53 + bIdx * 71 + row * 999;
          seed = (((seed >>> 0) ^ ((seed >>> 16) | 0)) * 2654435769) >>> 0;
          const personality = seed % 10;
          bIdx++;

          if (bIdx > 1) cursor += PIXEL * (1 + (seed % 2));

          // ~10% wider gap — draw a tree in the gap
          if ((seed + 17) % 10 === 0) {
            if (!lightsOnly) drawSmallTree(ctx, snap(cursor + PIXEL), baseY);
            cursor += PIXEL * 3;
            buildingIdx++;
            continue;
          }

          const bw = snap(PIXEL * (6 + (seed % 7)));
          if (cursor + bw > col.endX) break;

          let bh: number;
          const isTower = personality === 0;
          const isCondo = personality <= 2;
          if (isTower) {
            bh = Math.min(maxRowH, snap(PIXEL * (14 + (seed % 5))));
          } else if (isCondo) {
            bh = Math.min(maxRowH, snap(PIXEL * (9 + (seed % 4))));
          } else {
            bh = Math.min(maxRowH, snap(PIXEL * (5 + (seed % 4))));
          }

          const jitterY = snap(((seed * 31) % 3) * PIXEL - PIXEL);
          const buildingTop = baseY - bh + jitterY;

          const cx = snap(cursor);
          const winStep = PIXEL * 2;
          const winSize = PIXEL;

          if (!lightsOnly) {
            // Draw building body
            const color =
              buildingIdx % 2 === 0
                ? PALETTE.buildingSilhouette
                : PALETTE.buildingDark;
            drawPixelRect(ctx, cx, buildingTop, bw, bh - jitterY, color);

            // All windows as dark dots (daytime look)
            for (
              let wy = buildingTop + winStep;
              wy < baseY - winStep;
              wy += winStep
            ) {
              for (let wx = winSize; wx < bw - winSize; wx += winStep) {
                drawPixelRect(
                  ctx,
                  cx + wx,
                  wy,
                  winSize,
                  winSize,
                  PALETTE.buildingWindowDim,
                );
              }
            }
          } else {
            // lightsOnly — draw glowing windows and beacons on top of overlay
            const windowColors =
              personality <= 3
                ? [PALETTE.buildingWindow, PALETTE.buildingWindowDim]
                : personality <= 6
                  ? [PALETTE.buildingWindowWarm, PALETTE.buildingWindowDim]
                  : [PALETTE.buildingWindowCool, PALETTE.buildingWindowDim];

            const doesFlicker = seed % 20 === 0;
            const flickerSpeed = 0.003 + (seed % 13) * 0.0015;
            const flickerPhase = (seed % 97) * 0.37;

            for (
              let wy = buildingTop + winStep;
              wy < baseY - winStep;
              wy += winStep
            ) {
              for (let wx = winSize; wx < bw - winSize; wx += winStep) {
                const windowIdx = wy * 3 + wx;
                if (doesFlicker) {
                  const flicker = Math.sin(
                    t * flickerSpeed + flickerPhase + windowIdx * 1.1,
                  );
                  if (flicker > 0.4) {
                    drawPixelRect(
                      ctx,
                      cx + wx,
                      wy,
                      winSize,
                      winSize,
                      windowColors[0],
                    );
                  }
                } else {
                  const on = (windowIdx * 137 + buildingIdx * 53) % 10;
                  if (on < 4) {
                    drawPixelRect(
                      ctx,
                      cx + wx,
                      wy,
                      winSize,
                      winSize,
                      windowColors[0],
                    );
                  }
                }
              }
            }

            if (isTower) {
              const beaconOn = Math.sin(t * 0.012 + buildingIdx * 3.1) > 0;
              drawPixelRect(
                ctx,
                cx + Math.floor(bw / 2) - PIXEL / 2,
                buildingTop - PIXEL,
                PIXEL,
                PIXEL,
                beaconOn ? PALETTE.rooftopBeacon : PALETTE.rooftopBeaconDim,
              );
            }
          }

          cursor += bw;
          buildingIdx++;
        }
      }
    }
  }
}

function drawOcean(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
  t: number,
): void {
  if (H - horizonY <= 0) return;
  // Solid ocean fill
  drawPixelRect(ctx, 0, horizonY, W, H - horizonY, PALETTE.ocean);

  // Horizontal wave bands — varying speeds and offsets give depth
  const waveDefs = [
    {
      count: 8,
      speed: 0.4,
      minW: 24,
      maxW: 60,
      color: PALETTE.oceanWave,
      ySpread: 0.25,
    },
    {
      count: 12,
      speed: 0.25,
      minW: 16,
      maxW: 40,
      color: PALETTE.oceanWave,
      ySpread: 0.6,
    },
    {
      count: 6,
      speed: 0.6,
      minW: 32,
      maxW: 80,
      color: PALETTE.shallows,
      ySpread: 0.9,
    },
  ];
  waveDefs.forEach(({ count, speed, minW, maxW, color, ySpread }) => {
    for (let i = 0; i < count; i++) {
      const baseY = horizonY + ((i * 71 + 30) % ((H - horizonY) * ySpread));
      const waveX = snap(
        ((i * 193 + t * speed + Math.sin(t * 0.003 + i) * 20) % (W + 120)) - 20,
      );
      const waveW = snap(minW + ((i * 37) % (maxW - minW)));
      drawPixelRect(ctx, waveX, snap(baseY), waveW, PIXEL * 1, color);
      const waveX2 = snap(waveX + waveW + PIXEL * 3);
      if (waveX2 < W)
        drawPixelRect(
          ctx,
          waveX2,
          snap(baseY),
          snap(waveW * 0.4),
          PIXEL,
          color,
        );
    }
  });
}

// Bird drawn as two pixel-art wing arcs — M shape
function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wingPhase: number,
  scale: number,
): void {
  const s = Math.max(1, Math.round(scale));
  const flapY = Math.round(wingPhase * PIXEL * s * 0.8);

  ctx.fillStyle = PALETTE.star;
  ctx.fillRect(snap(x - s * PIXEL * 2), snap(y + flapY), s * PIXEL, PIXEL);
  ctx.fillRect(snap(x - s * PIXEL), snap(y + flapY - PIXEL), s * PIXEL, PIXEL);
  ctx.fillRect(snap(x), snap(y), PIXEL, PIXEL);
  ctx.fillRect(snap(x + PIXEL), snap(y + flapY - PIXEL), s * PIXEL, PIXEL);
  ctx.fillRect(snap(x + PIXEL + s * PIXEL), snap(y + flapY), s * PIXEL, PIXEL);
}

function drawBirds(
  ctx: CanvasRenderingContext2D,
  W: number,
  _H: number,
  birds: Bird[],
  t: number,
): void {
  birds.forEach((bird) => {
    bird.x += bird.speed;
    if (bird.x > W + 80) bird.x = -80;
    const wingPhase = Math.sin(t * 0.08 + bird.wingPhase);
    drawBird(ctx, bird.x, bird.y, wingPhase, bird.scale);
  });
}

// Base bezier curve: the "spine" of the shoreline
function beachBaseX(y: number, W: number, H: number, horizonY: number): number {
  const tc = (y - horizonY) / (H - horizonY);
  const p0 = W * BEACH_HORIZON_X;
  const p1 = W * BEACH_CTRL_X;
  const p2 = W * BEACH_BOTTOM_X;
  return (
    Math.pow(1 - tc, 2) * p0 + 2 * (1 - tc) * tc * p1 + Math.pow(tc, 2) * p2
  );
}

// Adds natural undulation on top of the base curve
function beachEdgeX(y: number, W: number, H: number, horizonY: number): number {
  const base = beachBaseX(y, W, H, horizonY);
  const tc = (y - horizonY) / (H - horizonY);
  const amp = W * 0.018 * (0.3 + tc * 0.7);
  const wiggle =
    Math.sin(y * 0.018) * amp + Math.sin(y * 0.045 + 1.2) * amp * 0.5;
  return base + wiggle;
}

function drawBeach(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  if (H - horizonY <= 0) return;
  for (let y = horizonY; y <= H; y += PIXEL) {
    const rawEdgeX = beachEdgeX(y, W, H, horizonY);
    const progress = (y - horizonY) / (H - horizonY);
    const startOffset = 0.2;
    const adjustedProgress = Math.max(
      0,
      (progress - startOffset) / (1 - startOffset),
    );
    const shift = Math.pow(adjustedProgress, 2) * W * 0.4;
    const edgeX = snap(rawEdgeX - shift);

    // Grass (urban area, right of the first road)
    const sandWidth = W - edgeX;
    const grassStartX = snap(edgeX + sandWidth * 0.37);
    drawPixelRect(
      ctx,
      grassStartX,
      y,
      W - grassStartX,
      PIXEL,
      PALETTE.grassPatch,
    );
    // Dry sand (beach strip, left of the first road)
    drawPixelRect(ctx, edgeX, y, grassStartX - edgeX, PIXEL, PALETTE.sand);
    // Wet sand
    drawPixelRect(ctx, edgeX, y, PIXEL * 2, PIXEL, PALETTE.wetSand);
    // Shallows
    drawPixelRect(
      ctx,
      edgeX - PIXEL * 4,
      y,
      PIXEL * 4,
      PIXEL,
      PALETTE.shallows,
    );
    // Ocean bleed
    drawPixelRect(ctx, edgeX - PIXEL * 8, y, PIXEL * 4, PIXEL, PALETTE.ocean);
  }
}

function drawPier(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): { deckY: number; pierLeftX: number; pierRightX: number } {
  const oceanH = H - horizonY;
  const pierYBase = snap(horizonY + oceanH * 0.18);
  const deckY = snap(pierYBase - PIXEL * 3);
  const pierLeftX = snap(W * 0.72);
  // Right end overlaps past beach edge so pylons sit on sand
  const shoreX = getActualBeachEdge(pierYBase, W, H, horizonY);
  const sandWidth = W - shoreX;
  const firstRoadX = snap(shoreX + sandWidth * 0.37);
  const pierRightX = snap(firstRoadX - PIXEL * 2);
  const deckH = PIXEL * 2;

  // Support pylons below deck
  for (let x = pierLeftX; x <= pierRightX; x += PIXEL * 10) {
    const xFraction = (x - pierLeftX) / (pierRightX - pierLeftX || 1);
    const maxDepth = PIXEL * 4;
    const minDepth = PIXEL * 1;
    const depth = maxDepth - xFraction * (maxDepth - minDepth);
    const pylonBottom = snap(pierYBase + depth);
    drawPixelRect(
      ctx,
      x,
      deckY + deckH,
      PIXEL,
      pylonBottom - (deckY + deckH),
      PALETTE.pierPylon,
    );
    drawPixelRect(
      ctx,
      x + PIXEL,
      deckY + deckH,
      PIXEL,
      pylonBottom - (deckY + deckH),
      PALETTE.pierPylon,
    );
  }

  // Deck surface
  for (let x = pierLeftX; x <= pierRightX; x += PIXEL) {
    const color =
      Math.floor((x - pierLeftX) / PIXEL) % 3 === 0
        ? PALETTE.pierPlank
        : PALETTE.pierDeck;
    drawPixelRect(ctx, x, deckY, PIXEL, deckH, color);
  }

  // Railing
  drawPixelRect(
    ctx,
    pierLeftX,
    deckY - PIXEL,
    pierRightX - pierLeftX,
    PIXEL,
    PALETTE.pierRail,
  );

  // Railing posts
  for (let x = pierLeftX; x <= pierRightX; x += PIXEL * 8) {
    drawPixelRect(
      ctx,
      x,
      deckY - PIXEL * 2,
      PIXEL,
      PIXEL * 2,
      PALETTE.pierRail,
    );
  }

  return { deckY, pierLeftX, pierRightX };
}

function drawFerrisWheel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  deckY: number,
  angle: number,
): void {
  const radius = PIXEL * 12;
  const hubY = deckY - radius - PIXEL * 4;

  // A-frame support base
  drawPixelRect(
    ctx,
    centerX - PIXEL * 3,
    hubY + radius,
    PIXEL,
    deckY - (hubY + radius),
    PALETTE.ferrisFrame,
  );
  drawPixelRect(
    ctx,
    centerX + PIXEL * 2,
    hubY + radius,
    PIXEL,
    deckY - (hubY + radius),
    PALETTE.ferrisFrame,
  );
  // Cross brace
  drawPixelRect(
    ctx,
    centerX - PIXEL * 2,
    hubY + radius - PIXEL * 2,
    PIXEL * 4,
    PIXEL,
    PALETTE.ferrisFrame,
  );

  // Outer rim — draw pixel dots around the circle
  for (let a = 0; a < Math.PI * 2; a += 0.12) {
    const rx = snap(centerX + Math.cos(a) * radius);
    const ry = snap(hubY + Math.sin(a) * radius);
    drawPixelRect(ctx, rx, ry, PIXEL, PIXEL, PALETTE.ferrisRim);
  }

  // Spokes and gondola cars
  const numSpokes = 8;
  for (let i = 0; i < numSpokes; i++) {
    const spokeAngle = angle + (i * Math.PI * 2) / numSpokes;
    const endX = centerX + Math.cos(spokeAngle) * radius;
    const endY = hubY + Math.sin(spokeAngle) * radius;

    // Spoke — draw a few pixel dots along the line
    for (let s = 0.2; s <= 1; s += 0.2) {
      const sx = snap(centerX + Math.cos(spokeAngle) * radius * s);
      const sy = snap(hubY + Math.sin(spokeAngle) * radius * s);
      drawPixelRect(ctx, sx, sy, PIXEL, PIXEL, PALETTE.ferrisCable);
    }

    // Gondola car at tip — alternating red/blue, always hanging down
    const gondolaColor =
      i % 2 === 0 ? PALETTE.ferrisGondola : PALETTE.ferrisGondola2;
    drawPixelRect(
      ctx,
      snap(endX) - PIXEL,
      snap(endY) + PIXEL,
      PIXEL * 3,
      PIXEL * 2,
      gondolaColor,
    );
  }

  // Center hub
  drawPixelRect(
    ctx,
    centerX - PIXEL,
    hubY - PIXEL,
    PIXEL * 2,
    PIXEL * 2,
    PALETTE.ferrisHub,
  );
}

function drawBoats(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
  t: number,
): void {
  const oceanH = H - horizonY;
  const P = PIXEL;

  // --- SAILBOATS ---
  const sailboats = [
    {
      xPct: 0.02,
      yPct: 0.1,
      bobSpeed: 0.008,
      sailColor: PALETTE.boatSail,
      small: false,
    },
    {
      xPct: 0.08,
      yPct: 0.3,
      bobSpeed: 0.006,
      sailColor: PALETTE.umbrellaRed,
      small: false,
    },
    {
      xPct: 0.62,
      yPct: 0.05,
      bobSpeed: 0.005,
      sailColor: PALETTE.boatSail,
      small: true,
    },
  ];

  sailboats.forEach((boat, i) => {
    const bx = snap(W * boat.xPct);
    const by = snap(
      horizonY + oceanH * boat.yPct + Math.sin(t * boat.bobSpeed + i * 1.7) * P,
    );
    const edgeX = getActualBeachEdge(by, W, H, horizonY);

    if (boat.small) {
      // Small boat near the pier
      const s = Math.round(P * 0.5);
      if (bx + s * 9 > edgeX) return;
      drawPixelRect(ctx, bx + s, by + s, s * 7, s, PALETTE.boatHull);
      drawPixelRect(ctx, bx, by + s * 2, s * 9, s, PALETTE.boatHull);
      drawPixelRect(ctx, bx + s, by + s * 3, s * 7, s, PALETTE.boatHull);
      drawPixelRect(ctx, bx + s * 2, by + s, s * 5, s, PALETTE.pierDeck);
      drawPixelRect(
        ctx,
        bx + s * 4,
        by - s * 4,
        Math.max(P, s),
        s * 5,
        PALETTE.pierPylon,
      );
      drawPixelRect(ctx, bx + s * 5, by - s * 3, s, s, boat.sailColor);
      drawPixelRect(ctx, bx + s * 5, by - s * 2, s * 2, s, boat.sailColor);
      drawPixelRect(ctx, bx + s * 5, by - s, s * 2, s, boat.sailColor);
      drawPixelRect(ctx, bx + s * 5, by, s * 3, s, boat.sailColor);
    } else {
      // Full-size boat
      if (bx + P * 18 > edgeX) return;
      drawPixelRect(
        ctx,
        bx + P * 2,
        by + P * 2,
        P * 14,
        P * 2,
        PALETTE.boatHull,
      );
      drawPixelRect(ctx, bx, by + P * 4, P * 18, P * 2, PALETTE.boatHull);
      drawPixelRect(
        ctx,
        bx + P * 2,
        by + P * 6,
        P * 14,
        P * 2,
        PALETTE.boatHull,
      );
      drawPixelRect(
        ctx,
        bx + P * 3,
        by + P * 2,
        P * 12,
        P * 2,
        PALETTE.pierDeck,
      );
      drawPixelRect(ctx, bx + P * 8, by - P * 10, P, P * 12, PALETTE.pierPylon);
      drawPixelRect(ctx, bx + P * 9, by - P * 9, P * 2, P * 2, boat.sailColor);
      drawPixelRect(ctx, bx + P * 9, by - P * 7, P * 3, P * 2, boat.sailColor);
      drawPixelRect(ctx, bx + P * 9, by - P * 5, P * 4, P * 2, boat.sailColor);
      drawPixelRect(ctx, bx + P * 9, by - P * 3, P * 5, P * 2, boat.sailColor);
      drawPixelRect(ctx, bx + P * 9, by - P * 1, P * 6, P * 2, boat.sailColor);
    }
  });

  // --- SPEEDBOAT (near pier, small for depth) ---
  {
    const bx = snap(W * 0.68);
    const by = snap(horizonY + oceanH * 0.08 + Math.sin(t * 0.01) * P);
    const edgeX = getActualBeachEdge(by, W, H, horizonY);
    const s = Math.round(P * 0.5);
    if (bx + s * 12 < edgeX) {
      drawPixelRect(ctx, bx, by + s, s * 12, s, PALETTE.boatHull);
      drawPixelRect(ctx, bx + s, by + s * 2, s * 10, s, PALETTE.boatHull);
      drawPixelRect(ctx, bx + s, by + s, s * 10, s, PALETTE.lifeguardRoof);
      drawPixelRect(ctx, bx + s * 4, by, s * 2, s, PALETTE.buildingWindowCool);
      drawPixelRect(ctx, bx - s, by + s, s, s, PALETTE.boatSail);
      drawPixelRect(ctx, bx - s * 2, by + s * 2, s, s, PALETTE.boatSail);
    }
  }

  // --- KAYAK (small, narrow, person paddling) ---
  {
    const bx = snap(W * 0.04);
    const by = snap(horizonY + oceanH * 0.55 + Math.sin(t * 0.009 + 2.5) * P);
    const edgeX = getActualBeachEdge(by, W, H, horizonY);
    if (bx + P * 14 < edgeX) {
      // Kayak body — long and narrow
      drawPixelRect(
        ctx,
        bx + P * 2,
        by + P * 2,
        P * 10,
        P * 2,
        PALETTE.umbrellaYellow,
      );
      drawPixelRect(ctx, bx, by + P * 3, P * 14, P, PALETTE.umbrellaYellow);
      // Person
      drawPixelRect(ctx, bx + P * 6, by, P * 2, P * 2, PALETTE.skinTone);
      // Paddle
      const paddleSide = Math.sin(t * 0.015) > 0 ? -P * 2 : P * 10;
      drawPixelRect(ctx, bx + paddleSide, by + P, P * 2, P, PALETTE.pierPylon);
    }
  }
}

function drawMarineLife(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
  t: number,
): void {
  const oceanH = H - horizonY;
  if (oceanH <= 0) return;
  const P = PIXEL;

  // --- DOLPHIN (single, rare appearance) ---
  {
    const baseX = snap(W * 0.15);
    const baseY = snap(horizonY + oceanH * 0.22);
    const edgeX = getActualBeachEdge(baseY, W, H, horizonY);
    if (baseX + P * 14 < edgeX) {
      // Very slow cycle — only visible ~15% of the time
      const raw = Math.sin(t * 0.003);
      const cycle = raw > 0.7 ? (raw - 0.7) / 0.3 : -1; // -1 = hidden

      // Splash when entering/exiting
      if (cycle > -0.1 && cycle < 0.3 && raw > 0.65) {
        const centerX = baseX + P * 6;
        const splashT = (raw - 0.65) / 0.35;
        // V-shaped water spray
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 1; i <= 4; i++) {
            const sx = snap(centerX + side * P * (i * 2 + 1));
            const sy = snap(baseY - P * i * splashT * 2);
            drawPixelRect(ctx, sx, sy, P, P, PALETTE.boatSail);
          }
        }
        // Foam at waterline
        drawPixelRect(ctx, centerX - P * 4, baseY, P * 8, P, PALETTE.shallows);
        drawPixelRect(
          ctx,
          centerX - P * 6,
          baseY + P,
          P * 3,
          P,
          PALETTE.shallows,
        );
        drawPixelRect(
          ctx,
          centerX + P * 4,
          baseY + P,
          P * 3,
          P,
          PALETTE.shallows,
        );
      }

      if (cycle > 0) {
        const jumpHeight = cycle * P * 8;
        const dy = snap(baseY - jumpHeight);

        // Body — sleek curved shape, bigger
        drawPixelRect(ctx, baseX + P * 4, dy, P * 6, P, PALETTE.buildingDark); // top line
        drawPixelRect(
          ctx,
          baseX + P * 2,
          dy + P,
          P * 10,
          P,
          PALETTE.buildingDark,
        ); // upper body
        drawPixelRect(
          ctx,
          baseX + P,
          dy + P * 2,
          P * 12,
          P,
          PALETTE.buildingWindowDim,
        ); // mid body
        drawPixelRect(
          ctx,
          baseX + P * 2,
          dy + P * 3,
          P * 10,
          P,
          PALETTE.buildingWindowDim,
        ); // lower body
        drawPixelRect(
          ctx,
          baseX + P * 4,
          dy + P * 4,
          P * 6,
          P,
          PALETTE.cloudDark,
        ); // belly
        // Snout
        drawPixelRect(
          ctx,
          baseX + P * 13,
          dy + P * 2,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 14,
          dy + P * 3,
          P,
          P,
          PALETTE.buildingDark,
        );
        // Dorsal fin
        drawPixelRect(
          ctx,
          baseX + P * 7,
          dy - P,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 8,
          dy - P * 2,
          P,
          P,
          PALETTE.buildingDark,
        );
        // Tail fluke
        drawPixelRect(ctx, baseX, dy + P, P * 2, P, PALETTE.buildingDark);
        drawPixelRect(ctx, baseX - P, dy, P * 2, P, PALETTE.buildingDark);
        drawPixelRect(
          ctx,
          baseX - P,
          dy + P * 3,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX - P * 2,
          dy + P * 4,
          P,
          P,
          PALETTE.buildingDark,
        );
        // Eye
        drawPixelRect(ctx, baseX + P * 11, dy + P * 2, P, P, PALETTE.boatSail);
        // Pectoral fin
        drawPixelRect(
          ctx,
          baseX + P * 6,
          dy + P * 4,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 5,
          dy + P * 5,
          P,
          P,
          PALETTE.buildingDark,
        );
      }
    }
  }

  // --- WHALE (single, very rare, big and detailed) ---
  {
    const baseX = snap(W * 0.45);
    const baseY = snap(horizonY + oceanH * 0.3);
    const edgeX = getActualBeachEdge(baseY, W, H, horizonY);
    if (baseX + P * 24 < edgeX) {
      // Very slow cycle — only surfaces ~10% of the time
      const raw = Math.sin(t * 0.002 + 2.0);
      const cycle = raw > 0.8 ? (raw - 0.8) / 0.2 : -1;

      // Splash — big wall of spray when breaching
      if (cycle > -0.1 && cycle < 0.4 && raw > 0.75) {
        const centerX = baseX + P * 10;
        const splashT = (raw - 0.75) / 0.25;
        // Curtain of spray droplets
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 1; i <= 6; i++) {
            const sx = snap(centerX + side * P * (i * 2));
            const sy = snap(baseY - P * (i * splashT * 1.5));
            drawPixelRect(ctx, sx, sy, P, P, PALETTE.boatSail);
            // Secondary smaller drops
            if (i % 2 === 0) {
              drawPixelRect(
                ctx,
                sx + side * P,
                snap(sy - P),
                P,
                P,
                PALETTE.boatSail,
              );
            }
          }
        }
        // Wide foam line
        drawPixelRect(ctx, centerX - P * 8, baseY, P * 16, P, PALETTE.shallows);
        drawPixelRect(
          ctx,
          centerX - P * 10,
          baseY + P,
          P * 5,
          P,
          PALETTE.shallows,
        );
        drawPixelRect(
          ctx,
          centerX + P * 6,
          baseY + P,
          P * 5,
          P,
          PALETTE.shallows,
        );
        drawPixelRect(
          ctx,
          centerX - P * 12,
          baseY + P * 2,
          P * 3,
          P,
          PALETTE.oceanWave,
        );
        drawPixelRect(
          ctx,
          centerX + P * 10,
          baseY + P * 2,
          P * 3,
          P,
          PALETTE.oceanWave,
        );
      }

      if (cycle > 0) {
        const jumpHeight = cycle * P * 4;
        const dy = snap(baseY - jumpHeight);

        // Body — massive rounded shape
        drawPixelRect(ctx, baseX + P * 4, dy, P * 14, P, PALETTE.buildingDark); // top
        drawPixelRect(
          ctx,
          baseX + P * 2,
          dy + P,
          P * 18,
          P * 2,
          PALETTE.buildingDark,
        ); // upper
        drawPixelRect(
          ctx,
          baseX,
          dy + P * 3,
          P * 22,
          P * 2,
          PALETTE.buildingDark,
        ); // widest
        drawPixelRect(
          ctx,
          baseX + P,
          dy + P * 5,
          P * 20,
          P,
          PALETTE.buildingWindowDim,
        ); // lower
        drawPixelRect(
          ctx,
          baseX + P * 2,
          dy + P * 6,
          P * 18,
          P,
          PALETTE.buildingWindowDim,
        );
        drawPixelRect(
          ctx,
          baseX + P * 4,
          dy + P * 7,
          P * 14,
          P,
          PALETTE.cloudDark,
        ); // belly
        // Head bump
        drawPixelRect(
          ctx,
          baseX + P * 20,
          dy + P,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 21,
          dy + P * 2,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        // Jaw line
        drawPixelRect(
          ctx,
          baseX + P * 18,
          dy + P * 6,
          P * 4,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 20,
          dy + P * 5,
          P * 2,
          P,
          PALETTE.buildingWindowDim,
        );
        // Eye
        drawPixelRect(ctx, baseX + P * 18, dy + P * 3, P, P, PALETTE.boatSail);
        // Pectoral fin
        drawPixelRect(
          ctx,
          baseX + P * 10,
          dy + P * 7,
          P * 3,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 9,
          dy + P * 8,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        // Tail fluke — wide and forked
        drawPixelRect(
          ctx,
          baseX - P * 2,
          dy + P * 2,
          P * 3,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX - P * 4,
          dy + P,
          P * 3,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(ctx, baseX - P * 5, dy, P * 2, P, PALETTE.buildingDark);
        drawPixelRect(
          ctx,
          baseX - P * 4,
          dy + P * 5,
          P * 3,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX - P * 5,
          dy + P * 6,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        // Dorsal fin
        drawPixelRect(
          ctx,
          baseX + P * 8,
          dy - P,
          P * 3,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 9,
          dy - P * 2,
          P * 2,
          P,
          PALETTE.buildingDark,
        );
        drawPixelRect(
          ctx,
          baseX + P * 10,
          dy - P * 3,
          P,
          P,
          PALETTE.buildingDark,
        );

        // Water spout — tall V-shaped spray
        if (cycle > 0.7) {
          const spoutX = baseX + P * 16;
          // Two angled streams
          for (let i = 1; i <= 6; i++) {
            drawPixelRect(
              ctx,
              spoutX - i,
              dy - P * (2 + i),
              P,
              P,
              PALETTE.boatSail,
            );
            drawPixelRect(
              ctx,
              spoutX + P + i,
              dy - P * (2 + i),
              P,
              P,
              PALETTE.boatSail,
            );
          }
          // Mist at top
          drawPixelRect(
            ctx,
            spoutX - P * 2,
            dy - P * 8,
            P,
            P,
            PALETTE.cloudLight,
          );
          drawPixelRect(
            ctx,
            spoutX + P * 2,
            dy - P * 8,
            P,
            P,
            PALETTE.cloudLight,
          );
          drawPixelRect(
            ctx,
            spoutX - P,
            dy - P * 9,
            P * 3,
            P,
            PALETTE.cloudLight,
          );
        }
      }
    }
  }
}

function drawBeachElements(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  const oceanH = H - horizonY;
  if (oceanH <= 0) return;

  // --- BEACH UMBRELLAS ---
  const umbrellas = [
    { yPct: 0.25, xPct: 0.1, color: PALETTE.umbrellaRed, towel: true },
    { yPct: 0.32, xPct: 0.22, color: PALETTE.umbrellaBlue, towel: false },
    { yPct: 0.38, xPct: 0.14, color: PALETTE.umbrellaYellow, towel: true },
    { yPct: 0.48, xPct: 0.08, color: PALETTE.umbrellaRed, towel: true },
    { yPct: 0.52, xPct: 0.25, color: PALETTE.umbrellaBlue, towel: false },
    { yPct: 0.6, xPct: 0.12, color: PALETTE.umbrellaYellow, towel: true },
    { yPct: 0.72, xPct: 0.2, color: PALETTE.umbrellaRed, towel: false },
    { yPct: 0.8, xPct: 0.15, color: PALETTE.umbrellaBlue, towel: true },
    { yPct: 0.88, xPct: 0.28, color: PALETTE.umbrellaYellow, towel: true },
  ];

  umbrellas.forEach((u) => {
    const uy = snap(horizonY + oceanH * u.yPct);
    const edgeX = getActualBeachEdge(uy, W, H, horizonY);
    const sandWidth = W - edgeX;
    if (sandWidth < PIXEL * 10) return;
    const ux = snap(edgeX + sandWidth * u.xPct);
    if (ux < edgeX + PIXEL * 2 || ux > W - PIXEL * 4) return;

    // Pole
    drawPixelRect(
      ctx,
      ux,
      uy - PIXEL * 3,
      PIXEL,
      PIXEL * 3,
      PALETTE.volleyballPole,
    );
    // Canopy (3px wide)
    drawPixelRect(ctx, ux - PIXEL, uy - PIXEL * 4, PIXEL * 3, PIXEL, u.color);
    // Towel next to some
    if (u.towel) {
      drawPixelRect(
        ctx,
        ux + PIXEL * 2,
        uy - PIXEL,
        PIXEL * 3,
        PIXEL * 2,
        PALETTE.towel,
      );
    }
  });

  // --- VOLLEYBALL NETS ---
  const nets = [
    { yPct: 0.4, xPct: 0.18 },
    { yPct: 0.65, xPct: 0.16 },
  ];

  nets.forEach((n) => {
    const ny = snap(horizonY + oceanH * n.yPct);
    const edgeX = getActualBeachEdge(ny, W, H, horizonY);
    const sandWidth = W - edgeX;
    if (sandWidth < PIXEL * 10) return;
    const nx = snap(edgeX + sandWidth * n.xPct);
    if (nx > W - PIXEL * 10) return;

    const poleH = PIXEL * 4;
    const netW = PIXEL * 8;
    // Left pole
    drawPixelRect(ctx, nx, ny - poleH, PIXEL, poleH, PALETTE.volleyballPole);
    // Right pole
    drawPixelRect(
      ctx,
      nx + netW,
      ny - poleH,
      PIXEL,
      poleH,
      PALETTE.volleyballPole,
    );
    // Net line (dotted)
    for (let dx = 0; dx <= netW; dx += PIXEL * 2) {
      drawPixelRect(
        ctx,
        nx + dx,
        ny - poleH + PIXEL,
        PIXEL,
        PIXEL,
        PALETTE.volleyballNet,
      );
    }
  });

  // --- SURFBOARDS (near lifeguard towers) ---
  const boards = [
    { yPct: 0.44, xPct: 0.33, color: PALETTE.surfboard },
    { yPct: 0.69, xPct: 0.34, color: PALETTE.umbrellaBlue },
    { yPct: 0.55, xPct: 0.3, color: PALETTE.umbrellaRed },
  ];

  boards.forEach((b) => {
    const by = snap(horizonY + oceanH * b.yPct);
    const edgeX = getActualBeachEdge(by, W, H, horizonY);
    const sandWidth = W - edgeX;
    if (sandWidth < PIXEL * 10) return;
    const bx = snap(edgeX + sandWidth * b.xPct);
    if (bx > W - PIXEL * 4) return;

    // Vertical surfboard
    drawPixelRect(ctx, bx, by - PIXEL * 3, PIXEL, PIXEL * 4, b.color);
  });
}

function drawExtraBeachLife(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  const oceanH = H - horizonY;
  if (oceanH <= 0) return;

  // Helper to position elements on the sand
  function pos(yPct: number, xPct: number) {
    const y = snap(horizonY + oceanH * yPct);
    const edgeX = getActualBeachEdge(y, W, H, horizonY);
    const sandWidth = W - edgeX;
    const x = snap(edgeX + sandWidth * xPct);
    return { x, y, edgeX, sandWidth };
  }

  // --- 2a. MUSCLE BEACH GYM ---
  {
    const { x, y, sandWidth } = pos(0.55, 0.2);
    if (sandWidth >= PIXEL * 10) {
      // Pull-up bar station: 2 uprights + top bar + base
      drawPixelRect(
        ctx,
        x,
        y - PIXEL * 5,
        PIXEL,
        PIXEL * 5,
        PALETTE.muscleFrame,
      );
      drawPixelRect(
        ctx,
        x + PIXEL * 4,
        y - PIXEL * 5,
        PIXEL,
        PIXEL * 5,
        PALETTE.muscleFrame,
      );
      drawPixelRect(ctx, x, y - PIXEL * 5, PIXEL * 5, PIXEL, PALETTE.muscleBar);
      drawPixelRect(ctx, x - PIXEL, y, PIXEL * 7, PIXEL, PALETTE.muscleFrame);

      // Bench press nearby
      drawPixelRect(
        ctx,
        x + PIXEL * 7,
        y - PIXEL,
        PIXEL * 4,
        PIXEL,
        PALETTE.muscleBar,
      ); // bench surface
      drawPixelRect(
        ctx,
        x + PIXEL * 7,
        y - PIXEL,
        PIXEL,
        PIXEL * 2,
        PALETTE.muscleFrame,
      ); // left leg
      drawPixelRect(
        ctx,
        x + PIXEL * 10,
        y - PIXEL,
        PIXEL,
        PIXEL * 2,
        PALETTE.muscleFrame,
      ); // right leg
      drawPixelRect(
        ctx,
        x + PIXEL * 7,
        y - PIXEL * 2,
        PIXEL * 5,
        PIXEL,
        PALETTE.muscleBar,
      ); // barbell
      drawPixelRect(
        ctx,
        x + PIXEL * 6,
        y - PIXEL * 3,
        PIXEL,
        PIXEL * 2,
        PALETTE.muscleFrame,
      ); // left plate
      drawPixelRect(
        ctx,
        x + PIXEL * 12,
        y - PIXEL * 3,
        PIXEL,
        PIXEL * 2,
        PALETTE.muscleFrame,
      ); // right plate

      // Tiny person doing a pull-up
      drawPixelRect(
        ctx,
        x + PIXEL * 2,
        y - PIXEL * 6,
        PIXEL,
        PIXEL,
        PALETTE.skinTone,
      ); // head
      drawPixelRect(
        ctx,
        x + PIXEL * 2,
        y - PIXEL * 5,
        PIXEL,
        PIXEL,
        PALETTE.swimTrunk,
      ); // torso
      drawPixelRect(
        ctx,
        x + PIXEL,
        y - PIXEL * 5,
        PIXEL,
        PIXEL,
        PALETTE.skinTone,
      ); // left arm
      drawPixelRect(
        ctx,
        x + PIXEL * 3,
        y - PIXEL * 5,
        PIXEL,
        PIXEL,
        PALETTE.skinTone,
      ); // right arm
      drawPixelRect(
        ctx,
        x + PIXEL * 2,
        y - PIXEL * 4,
        PIXEL,
        PIXEL,
        PALETTE.skinTone,
      ); // legs
    }
  }

  // --- 2b. SAND CASTLES ---
  const castles = [
    { yPct: 0.35, xPct: 0.16 },
    { yPct: 0.58, xPct: 0.06 },
    { yPct: 0.82, xPct: 0.24 },
  ];
  castles.forEach((c) => {
    const { x, y, sandWidth } = pos(c.yPct, c.xPct);
    if (sandWidth < PIXEL * 8) return;
    // Base
    drawPixelRect(ctx, x, y, PIXEL * 3, PIXEL, PALETTE.wetSand);
    // Wall
    drawPixelRect(ctx, x, y - PIXEL, PIXEL * 3, PIXEL, PALETTE.wetSand);
    // Left turret
    drawPixelRect(ctx, x, y - PIXEL * 2, PIXEL, PIXEL, PALETTE.wetSand);
    drawPixelRect(ctx, x, y - PIXEL * 3, PIXEL, PIXEL, PALETTE.veniceArch);
    // Right turret
    drawPixelRect(
      ctx,
      x + PIXEL * 2,
      y - PIXEL * 2,
      PIXEL,
      PIXEL,
      PALETTE.wetSand,
    );
    drawPixelRect(
      ctx,
      x + PIXEL * 2,
      y - PIXEL * 3,
      PIXEL,
      PIXEL,
      PALETTE.veniceArch,
    );
  });

  // --- 2c. BEACHGOERS / TINY PEOPLE ---
  // Standing people
  const standingPeople = [
    { yPct: 0.3, xPct: 0.12, skin: PALETTE.skinTone, suit: PALETTE.swimTrunk },
    { yPct: 0.5, xPct: 0.18, skin: PALETTE.skinToneDark, suit: PALETTE.bikini },
    { yPct: 0.75, xPct: 0.22, skin: PALETTE.skinTone, suit: PALETTE.bikini },
  ];
  standingPeople.forEach((p) => {
    const { x, y, sandWidth } = pos(p.yPct, p.xPct);
    if (sandWidth < PIXEL * 8) return;
    drawPixelRect(ctx, x, y - PIXEL * 2, PIXEL, PIXEL, p.skin); // head
    drawPixelRect(ctx, x, y - PIXEL, PIXEL, PIXEL, p.suit); // torso
    drawPixelRect(ctx, x, y, PIXEL, PIXEL, p.skin); // legs
  });

  // Lying people (on towels)
  const lyingPeople = [
    {
      yPct: 0.28,
      xPct: 0.08,
      skin: PALETTE.skinToneDark,
      towelColor: PALETTE.towelBlue,
    },
    {
      yPct: 0.62,
      xPct: 0.14,
      skin: PALETTE.skinTone,
      towelColor: PALETTE.towel,
    },
    {
      yPct: 0.85,
      xPct: 0.1,
      skin: PALETTE.skinToneDark,
      towelColor: PALETTE.towelBlue,
    },
  ];
  lyingPeople.forEach((p) => {
    const { x, y, sandWidth } = pos(p.yPct, p.xPct);
    if (sandWidth < PIXEL * 8) return;
    drawPixelRect(ctx, x, y, PIXEL * 3, PIXEL, p.towelColor); // towel
    drawPixelRect(ctx, x, y - PIXEL, PIXEL * 3, PIXEL, p.skin); // body lying
  });

  // --- 2d. SEAGULLS ON SAND ---
  const seagulls = [
    { yPct: 0.34, xPct: 0.02 },
    { yPct: 0.5, xPct: 0.04 },
    { yPct: 0.68, xPct: 0.03 },
    { yPct: 0.86, xPct: 0.05 },
  ];
  seagulls.forEach((s) => {
    const { x, y, sandWidth } = pos(s.yPct, s.xPct);
    if (sandWidth < PIXEL * 6) return;
    drawPixelRect(ctx, x, y - PIXEL, PIXEL * 2, PIXEL, PALETTE.boatSail); // body
    drawPixelRect(
      ctx,
      x + PIXEL * 2,
      y - PIXEL * 2,
      PIXEL,
      PIXEL,
      PALETTE.boatSail,
    ); // head
    drawPixelRect(ctx, x + PIXEL, y, PIXEL, PIXEL, PALETTE.pierPylon); // legs
  });

  // --- 2e. BEACH BONFIRE PITS ---
  const bonfires = [
    { yPct: 0.46, xPct: 0.07 },
    { yPct: 0.76, xPct: 0.1 },
  ];
  bonfires.forEach((b) => {
    const { x, y, sandWidth } = pos(b.yPct, b.xPct);
    if (sandWidth < PIXEL * 8) return;
    // Stone ring
    drawPixelRect(ctx, x, y, PIXEL * 5, PIXEL, PALETTE.buildingDark);
    drawPixelRect(
      ctx,
      x + PIXEL,
      y - PIXEL,
      PIXEL * 3,
      PIXEL,
      PALETTE.buildingDark,
    );
    // Embers
    drawPixelRect(
      ctx,
      x + PIXEL,
      y - PIXEL * 2,
      PIXEL * 3,
      PIXEL,
      PALETTE.bonfireEmber,
    );
    // Bright center
    drawPixelRect(
      ctx,
      x + PIXEL * 2,
      y - PIXEL * 3,
      PIXEL,
      PIXEL,
      PALETTE.umbrellaYellow,
    );
  });

  // --- 2f. ICE CREAM CART ---
  {
    const { x, y, sandWidth } = pos(0.58, 0.08);
    if (sandWidth >= PIXEL * 10) {
      // Awning (striped)
      drawPixelRect(
        ctx,
        x,
        y - PIXEL * 5,
        PIXEL * 2,
        PIXEL,
        PALETTE.lifeguardBase,
      );
      drawPixelRect(
        ctx,
        x + PIXEL * 2,
        y - PIXEL * 5,
        PIXEL * 2,
        PIXEL,
        PALETTE.boatSail,
      );
      // Support poles
      drawPixelRect(ctx, x, y - PIXEL * 4, PIXEL, PIXEL * 4, PALETTE.pierPylon);
      drawPixelRect(
        ctx,
        x + PIXEL * 3,
        y - PIXEL * 4,
        PIXEL,
        PIXEL * 4,
        PALETTE.pierPylon,
      );
      // Cart body
      drawPixelRect(
        ctx,
        x,
        y - PIXEL * 3,
        PIXEL * 4,
        PIXEL * 3,
        PALETTE.boatSail,
      );
      // Serving window
      drawPixelRect(
        ctx,
        x + PIXEL,
        y - PIXEL * 2,
        PIXEL * 2,
        PIXEL,
        PALETTE.buildingWindowWarm,
      );
      // Wheels
      drawPixelRect(ctx, x, y + PIXEL, PIXEL, PIXEL, PALETTE.road);
      drawPixelRect(ctx, x + PIXEL * 3, y + PIXEL, PIXEL, PIXEL, PALETTE.road);
      // Vendor person
      drawPixelRect(
        ctx,
        x + PIXEL * 5,
        y - PIXEL * 2,
        PIXEL,
        PIXEL,
        PALETTE.skinTone,
      ); // head
      drawPixelRect(
        ctx,
        x + PIXEL * 5,
        y - PIXEL,
        PIXEL,
        PIXEL,
        PALETTE.boatSail,
      ); // torso
      drawPixelRect(ctx, x + PIXEL * 5, y, PIXEL, PIXEL, PALETTE.skinTone); // legs
    }
  }

  // --- 2g. SURFERS IN WATER ---
  const surfers = [
    { yPct: 0.3, boardColor: PALETTE.surfboard, skin: PALETTE.skinTone },
    {
      yPct: 0.55,
      boardColor: PALETTE.umbrellaBlue,
      skin: PALETTE.skinToneDark,
    },
    { yPct: 0.78, boardColor: PALETTE.umbrellaRed, skin: PALETTE.skinTone },
  ];
  surfers.forEach((s) => {
    const y = snap(horizonY + oceanH * s.yPct);
    const edgeX = getActualBeachEdge(y, W, H, horizonY);
    // Place in the shallows (just left of beach edge)
    const sx = snap(edgeX - PIXEL * 6);
    if (sx < PIXEL * 2) return;
    // Surfboard
    drawPixelRect(ctx, sx, y, PIXEL * 3, PIXEL, s.boardColor);
    // Person on board
    drawPixelRect(ctx, sx + PIXEL, y - PIXEL, PIXEL, PIXEL, s.skin); // head
    drawPixelRect(ctx, sx, y - PIXEL, PIXEL, PIXEL, s.skin); // left arm
    drawPixelRect(ctx, sx + PIXEL * 2, y - PIXEL, PIXEL, PIXEL, s.skin); // right arm
  });

  // --- 2h. KITE IN SKY ---
  {
    const kiteX = snap(W * 0.45);
    const kiteY = snap(horizonY - PIXEL * 12);
    // Diamond shape
    drawPixelRect(ctx, kiteX, kiteY, PIXEL, PIXEL, PALETTE.lifeguardBase); // top
    drawPixelRect(
      ctx,
      kiteX - PIXEL,
      kiteY + PIXEL,
      PIXEL * 3,
      PIXEL,
      PALETTE.umbrellaYellow,
    ); // middle
    drawPixelRect(
      ctx,
      kiteX,
      kiteY + PIXEL * 2,
      PIXEL,
      PIXEL,
      PALETTE.lifeguardBase,
    ); // bottom
    // String
    drawPixelRect(
      ctx,
      kiteX,
      kiteY + PIXEL * 3,
      PIXEL,
      PIXEL * 3,
      PALETTE.muscleFrame,
    );
    // Tail bows
    drawPixelRect(
      ctx,
      kiteX - PIXEL,
      kiteY + PIXEL * 4,
      PIXEL,
      PIXEL,
      PALETTE.umbrellaBlue,
    );
    drawPixelRect(
      ctx,
      kiteX + PIXEL,
      kiteY + PIXEL * 5,
      PIXEL,
      PIXEL,
      PALETTE.umbrellaBlue,
    );
    drawPixelRect(
      ctx,
      kiteX - PIXEL,
      kiteY + PIXEL * 6,
      PIXEL,
      PIXEL,
      PALETTE.umbrellaBlue,
    );
  }
}

function drawBikePath(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  for (let y = horizonY; y <= H; y += PIXEL) {
    const edgeX = getActualBeachEdge(y, W, H, horizonY);
    const pathX = edgeX + PIXEL * 6;

    // Only draw if path is on-screen
    if (pathX > W - PIXEL * 2) continue;

    // Path borders
    drawPixelRect(ctx, pathX, y, PIXEL, PIXEL, PALETTE.bikePathEdge);
    drawPixelRect(
      ctx,
      pathX + PIXEL * 3,
      y,
      PIXEL,
      PIXEL,
      PALETTE.bikePathEdge,
    );
    // Path fill
    drawPixelRect(ctx, pathX + PIXEL, y, PIXEL * 2, PIXEL, PALETTE.bikePath);
    // Center dashes
    const dashIdx = Math.floor(y / (PIXEL * 3));
    if (dashIdx % 2 === 0) {
      drawPixelRect(
        ctx,
        pathX + PIXEL + PIXEL * 0.5,
        y,
        PIXEL,
        PIXEL,
        PALETTE.bikePathDash,
      );
    }
  }
}

function drawVeniceLandmark(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  const oceanH = H - horizonY;
  const landmarkY = snap(horizonY + oceanH * 0.35);
  const edgeX = getActualBeachEdge(landmarkY, W, H, horizonY);
  const sandWidth = W - edgeX;
  const centerX = snap(edgeX + sandWidth * 0.5);

  // Two columns
  const colH = PIXEL * 5;
  const archW = PIXEL * 10;
  drawPixelRect(
    ctx,
    centerX - archW / 2,
    landmarkY - colH,
    PIXEL,
    colH,
    PALETTE.veniceArch,
  );
  drawPixelRect(
    ctx,
    centerX + archW / 2 - PIXEL,
    landmarkY - colH,
    PIXEL,
    colH,
    PALETTE.veniceArch,
  );

  // Horizontal bar with slight bow
  for (let bx = centerX - archW / 2; bx <= centerX + archW / 2; bx += PIXEL) {
    const distFromCenter = Math.abs(bx - centerX) / (archW / 2);
    const bow = snap(distFromCenter * distFromCenter * PIXEL * 1.5);
    drawPixelRect(
      ctx,
      bx,
      landmarkY - colH - PIXEL + bow,
      PIXEL,
      PIXEL,
      PALETTE.veniceArchLight,
    );
  }

  // "VENICE" text dots — 6 dots across the bar
  for (let i = 0; i < 6; i++) {
    const tx = centerX - archW / 2 + PIXEL * 1.5 + i * PIXEL * 1.5;
    drawPixelRect(
      ctx,
      snap(tx),
      landmarkY - colH - PIXEL * 0.5,
      PIXEL,
      PIXEL,
      PALETTE.veniceText,
    );
  }
}

function drawLifeguardTowers(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  const oceanH = H - horizonY;
  const positions = [0.45, 0.7];

  positions.forEach((pct) => {
    const towerY = snap(horizonY + oceanH * pct);
    const edgeX = getActualBeachEdge(towerY, W, H, horizonY);
    const sandWidth = W - edgeX;
    const baseX = snap(edgeX + sandWidth * 0.35);

    // Skip if off-screen
    if (baseX > W - PIXEL * 4) return;

    // Two stilts
    drawPixelRect(
      ctx,
      baseX,
      towerY - PIXEL * 4,
      PIXEL,
      PIXEL * 5,
      PALETTE.pierPylon,
    );
    drawPixelRect(
      ctx,
      baseX + PIXEL * 3,
      towerY - PIXEL * 4,
      PIXEL,
      PIXEL * 5,
      PALETTE.pierPylon,
    );

    // Cabin
    drawPixelRect(
      ctx,
      baseX - PIXEL,
      towerY - PIXEL * 7,
      PIXEL * 6,
      PIXEL * 3,
      PALETTE.lifeguardBase,
    );

    // Roof
    drawPixelRect(
      ctx,
      baseX - PIXEL * 2,
      towerY - PIXEL * 8,
      PIXEL * 8,
      PIXEL,
      PALETTE.lifeguardRoof,
    );
  });
}

function drawPierLights(
  ctx: CanvasRenderingContext2D,
  deckY: number,
  pierLeftX: number,
  pierRightX: number,
  t: number,
): void {
  for (let x = pierLeftX; x <= pierRightX; x += PIXEL * 6) {
    const i = Math.round((x - pierLeftX) / (PIXEL * 6));
    // Light post — always visible, extends from deck to top
    drawPixelRect(
      ctx,
      x,
      deckY - PIXEL * 4,
      PIXEL,
      PIXEL * 4,
      PALETTE.pierRail,
    );
    // Light glow — flickers
    if (Math.sin(t * 0.01 + i * 2.1) > -0.2) {
      drawPixelRect(
        ctx,
        snap(x),
        deckY - PIXEL * 5,
        PIXEL * 2,
        PIXEL,
        PALETTE.pierLight,
      );
    }
  }
}

function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  height: number,
  swayOffset: number,
  scale: number,
): void {
  const s = scale;

  // Trunk — stacked blocks with sine bend
  const trunkSegments = Math.floor(height / PIXEL);
  for (let i = 0; i < trunkSegments; i++) {
    const t = i / trunkSegments;
    const bendX = Math.sin(t * 1.5) * PIXEL * 2 * s + swayOffset * t;
    const segX = snap(baseX + bendX);
    const segY = snap(baseY - i * PIXEL);
    const color = i % 3 === 0 ? PALETTE.trunkDark : PALETTE.trunkLight;
    drawPixelRect(ctx, segX, segY, PIXEL * s, PIXEL, color);
  }

  // Top position for fronds
  const topT = 1;
  const topBendX = Math.sin(topT * 1.5) * PIXEL * 2 * s + swayOffset;
  const topX = baseX + topBendX;
  const topY = baseY - height;

  // Fronds — 6 radiating lines that droop
  for (let f = 0; f < 6; f++) {
    const frondAngle = (f / 6) * Math.PI * 2;
    const frondLen = PIXEL * 5 * s;
    for (let p = 1; p <= 5; p++) {
      const t = p / 5;
      const fx = snap(
        topX + Math.cos(frondAngle) * frondLen * t + swayOffset * 0.5,
      );
      // Droop increases quadratically
      const droop = t * t * PIXEL * 3 * s;
      const fy = snap(topY + Math.sin(frondAngle) * frondLen * t * 0.3 + droop);
      const color = p > 3 ? PALETTE.frondLight : PALETTE.frondDark;
      drawPixelRect(ctx, fx, fy, PIXEL, PIXEL, color);
    }
  }
}

function drawPalmTrees(
  ctx: CanvasRenderingContext2D,
  palmTrees: PalmTree[],
  t: number,
): void {
  palmTrees.forEach((tree) => {
    const swayOffset = Math.sin(t * 0.005 + tree.swayPhase) * PIXEL * 1.5;
    drawPalmTree(ctx, tree.x, tree.y, tree.height, swayOffset, tree.scale);
  });
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  const cx = snap(x);
  const cy = snap(y);

  // Moon glow — subtle pulse
  const glowR = r + PIXEL * 3 + Math.sin(t * 0.005) * PIXEL;
  for (let a = 0; a < Math.PI * 2; a += 0.12) {
    const gx = snap(cx + Math.cos(a) * glowR);
    const gy = snap(cy + Math.sin(a) * glowR);
    ctx.fillStyle = "rgba(200, 220, 255, 0.15)";
    ctx.fillRect(gx, gy, PIXEL, PIXEL);
  }

  // Moon body — pixel circle
  for (let dy = -r; dy <= r; dy += PIXEL) {
    for (let dx = -r; dx <= r; dx += PIXEL) {
      if (dx * dx + dy * dy <= r * r) {
        drawPixelRect(ctx, cx + dx, cy + dy, PIXEL, PIXEL, "#e8e8f0");
      }
    }
  }

  // Crescent shadow — carve out part of the circle to create crescent shape
  const offsetX = PIXEL * 4;
  const offsetY = 0;
  const shadowR = r - PIXEL * 0.5;
  for (let dy = -r; dy <= r; dy += PIXEL) {
    for (let dx = -r; dx <= r; dx += PIXEL) {
      const distFromMoon = dx * dx + dy * dy;
      const sdx = dx - offsetX;
      const sdy = dy - offsetY;
      const distFromShadow = sdx * sdx + sdy * sdy;
      if (distFromMoon <= r * r && distFromShadow <= shadowR * shadowR) {
        drawPixelRect(ctx, cx + dx, cy + dy, PIXEL, PIXEL, "#0a1428");
      }
    }
  }

  // Bright highlight
  drawPixelRect(ctx, cx - PIXEL * 3, cy, PIXEL, PIXEL, "#ffffff");
}

function drawNightStars(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
): void {
  const rng = mulberry32(123);
  // Many stars with twinkling
  for (let i = 0; i < 80; i++) {
    const sx = snap(rng() * W);
    const sy = snap(rng() * H * 0.5);
    const twinkle = Math.sin(t * 0.008 + i * 1.7);
    if (twinkle > -0.3) {
      const brightness = Math.round(180 + twinkle * 75);
      ctx.fillStyle = `rgb(${brightness},${brightness},${Math.min(255, brightness + 30)})`;
      ctx.fillRect(sx, sy, PIXEL, PIXEL);
    }
  }
  // A few brighter stars with cross pattern
  for (let i = 0; i < 10; i++) {
    const sx = snap(rng() * W);
    const sy = snap(rng() * H * 0.45);
    const twinkle = Math.sin(t * 0.006 + i * 2.1);
    if (twinkle > 0) {
      drawPixelRect(ctx, sx, sy, PIXEL, PIXEL, "#ffffff");
      if (twinkle > 0.5) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(sx - PIXEL, sy, PIXEL, PIXEL);
        ctx.fillRect(sx + PIXEL, sy, PIXEL, PIXEL);
        ctx.fillRect(sx, sy - PIXEL, PIXEL, PIXEL);
        ctx.fillRect(sx, sy + PIXEL, PIXEL, PIXEL);
      }
    }
  }
}

interface HeroBackgroundProps {
  children: React.ReactNode;
  sunProgress?: number;
}

export function HeroBackground({
  children,
  sunProgress = 0.5,
}: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sunProgressRef = useRef(sunProgress);
  sunProgressRef.current = sunProgress;
  const stateRef = useRef<AnimState>({
    clouds: [],
    birds: [],
    palmTrees: [],
    airliner: { x: -200, y: 0, speed: 0.8 },
    ferrisAngle: 0,
    t: 0,
    animId: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = snap(H * 0.55);

      stateRef.current.clouds = Array.from(
        { length: 7 },
        (_, i): Cloud => ({
          x: (i / 7) * W + ((i * 113) % 200),
          y: 40 + ((i * 53) % (H * 0.3)),
          speed: 0.15 + ((i * 0.07) % 0.3),
          scale: 1.5 + ((i * 0.4) % 2),
        }),
      );
      stateRef.current.birds = Array.from(
        { length: 6 },
        (_, i): Bird => ({
          x: (i / 6) * W + ((i * 97) % 300),
          y: H * 0.2 + ((i * 61) % (H * 0.2)),
          speed: 0.4 + ((i * 0.13) % 0.5),
          wingPhase: i * 1.1,
          scale: 1 + ((i * 0.3) % 1),
        }),
      );

      // Palm trees positioned along the beach using beachEdgeX
      const oceanH = H - horizonY;
      const treeDefs = [
        { yPct: 0.14, heightMul: 1.1, phase: 4.2 },
        { yPct: 0.25, heightMul: 1.0, phase: 0.0 },
        { yPct: 0.35, heightMul: 1.2, phase: 1.3 },
        { yPct: 0.44, heightMul: 1.1, phase: 0.4 },
        { yPct: 0.53, heightMul: 0.7, phase: 4.8 },
        { yPct: 0.65, heightMul: 1.3, phase: 3.9 },
        { yPct: 0.75, heightMul: 1.0, phase: 4.4 },
        { yPct: 0.85, heightMul: 1.1, phase: 3.3 },
        { yPct: 0.92, heightMul: 1.5, phase: 0.7 },
        { yPct: 0.56, heightMul: 1.4, phase: 0.9 },
      ];
      stateRef.current.palmTrees = treeDefs.map((def): PalmTree => {
        const ty = horizonY + oceanH * def.yPct;
        const edgeX = getActualBeachEdge(ty, W, H, horizonY);
        const sandWidth = W - edgeX;
        // Scale slightly larger for trees closer to bottom (nearer to viewer)
        const sc = 0.8 + def.yPct * 0.5;
        return {
          x: edgeX + sandWidth * (0.05 + ((def.phase * 31) % 28) / 100),
          y: ty,
          height: PIXEL * 8 * def.heightMul * sc,
          swayPhase: def.phase,
          scale: sc,
        };
      });

      stateRef.current.airliner = { x: -200, y: H * 0.12, speed: 0.8 };
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (): void => {
      const { clouds, birds, palmTrees, t } = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = snap(H * 0.55);
      const sp = sunProgressRef.current;
      const starOpacity = getStarOpacity(sp);
      const boatOpacity = getBoatOpacity(sp);
      const overlayIntensity = getOverlayIntensity(sp);

      // 1. SKY — interpolated from keyframes
      const skyColors = getSkyColors(sp);
      const bandCount = 16;
      for (let b = 0; b < bandCount; b++) {
        const ratio = b / bandCount;
        const color = lerpColor(skyColors.top, skyColors.bottom, ratio);
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.fillRect(
          0,
          snap((b / bandCount) * horizonY),
          W,
          snap(horizonY / bandCount) + PIXEL,
        );
      }

      // 2. STARS & SUN/MOON — continuous
      if (starOpacity > 0) {
        ctx.globalAlpha = starOpacity;
        drawNightStars(ctx, W, H, t);
        ctx.globalAlpha = 1;
      }

      const sunPos = getSunPosition(sp, W, H);
      if (sunPos.visible) {
        drawSun(ctx, sunPos.x, sunPos.y, 24, t);
      }

      const moonPos = getMoonPosition(sp, W, H);
      if (moonPos.visible) {
        drawMoon(ctx, moonPos.x, moonPos.y, 24, t);
      }

      // 3. CLOUDS
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > W + 200) cloud.x = -200;
        drawCloud(ctx, cloud.x, cloud.y, cloud.scale);
      });

      // 3b. BIRDS
      drawBirds(ctx, W, H, birds, t);

      // 3c. AIRLINER with contrail
      {
        const plane = stateRef.current.airliner;
        plane.x += plane.speed;
        if (plane.x > W + 300) plane.x = -200;
        const px = snap(plane.x);
        const py = snap(plane.y);
        const P = PIXEL;

        // Contrail — fading white dots trailing behind
        for (let i = 1; i <= 40; i++) {
          const trailX = snap(px - i * P * 2);
          if (trailX < 0) break;
          const fade = 1 - i / 40;
          const alpha = Math.round(fade * 180);
          ctx.fillStyle = `rgba(240,244,248,${alpha / 255})`;
          ctx.fillRect(trailX, py + P * 2, P, P);
          ctx.fillRect(trailX, py + P * 3, P, P);
        }

        // Fuselage — long and narrow
        drawPixelRect(ctx, px + P * 2, py + P, P * 14, P, PALETTE.boatSail);
        drawPixelRect(
          ctx,
          px + P * 2,
          py + P * 2,
          P * 14,
          P,
          PALETTE.cloudDark,
        );
        // Nose cone
        drawPixelRect(ctx, px + P * 16, py + P, P * 2, P, PALETTE.cloudDark);
        drawPixelRect(ctx, px + P * 18, py + P, P, P, PALETTE.cloudShadow);
        // Tail fin — vertical stabilizer
        drawPixelRect(ctx, px + P, py, P, P, PALETTE.lifeguardBase);
        drawPixelRect(ctx, px, py - P, P * 2, P, PALETTE.lifeguardBase);
        drawPixelRect(ctx, px - P, py - P * 2, P * 2, P, PALETTE.lifeguardBase);
        // Wings — swept back
        drawPixelRect(ctx, px + P * 7, py, P * 5, P, PALETTE.cloudDark);
        drawPixelRect(ctx, px + P * 8, py - P, P * 3, P, PALETTE.cloudShadow);
        drawPixelRect(ctx, px + P * 7, py + P * 3, P * 5, P, PALETTE.cloudDark);
        drawPixelRect(
          ctx,
          px + P * 8,
          py + P * 4,
          P * 3,
          P,
          PALETTE.cloudShadow,
        );
        // Window line
        drawPixelRect(
          ctx,
          px + P * 4,
          py + P,
          P * 10,
          P,
          PALETTE.buildingWindowCool,
        );
      }

      // 4. MOUNTAINS (right side)
      drawMountains(ctx, W, horizonY);

      // 5. OCEAN
      drawOcean(ctx, W, H, horizonY, t);

      // 7. BOATS (on ocean) — fade with sun
      if (boatOpacity > 0) {
        ctx.globalAlpha = boatOpacity;
        drawBoats(ctx, W, H, horizonY, t);
        ctx.globalAlpha = 1;
      }

      // 7b. DOLPHINS & WHALES — fade with sun
      if (boatOpacity > 0) {
        ctx.globalAlpha = boatOpacity;
        drawMarineLife(ctx, W, H, horizonY, t);
        ctx.globalAlpha = 1;
      }

      // 10. BEACH
      drawBeach(ctx, W, H, horizonY);

      // 10.5 COASTAL BUILDINGS (on sand, along the coast)
      drawCoastalBuildings(ctx, W, H, horizonY, t);

      // 11. BIKE PATH
      drawBikePath(ctx, W, H, horizonY);

      // 8. PIER (drawn after beach so deck isn't covered by sand)
      const { deckY, pierLeftX, pierRightX } = drawPier(ctx, W, H, horizonY);

      // 9. FERRIS WHEEL — placed near left end of pier, clear of centered modal
      const ferrisCenterX = snap(pierLeftX + PIXEL * 14);
      drawFerrisWheel(ctx, ferrisCenterX, deckY, stateRef.current.ferrisAngle);

      // 11.5 BEACH LIFE (umbrellas, volleyball, surfboards)
      drawBeachElements(ctx, W, H, horizonY);

      // 11.6 EXTRA BEACH LIFE (gym, castles, people, seagulls, bonfires, cart, surfers, kite)
      drawExtraBeachLife(ctx, W, H, horizonY);

      // 12. VENICE LANDMARK
      drawVeniceLandmark(ctx, W, H, horizonY);

      // 13. LIFEGUARD TOWERS
      drawLifeguardTowers(ctx, W, H, horizonY);

      // 14. PIER LIGHTS
      drawPierLights(ctx, deckY, pierLeftX, pierRightX, t);

      // 15. PALM TREES (foreground, last)
      drawPalmTrees(ctx, palmTrees, t);

      // 16. NIGHT OVERLAY — continuous intensity
      if (overlayIntensity > 0) {
        // Darken clouds in sky
        ctx.fillStyle = `rgba(5, 10, 30, ${0.4 * overlayIntensity})`;
        ctx.fillRect(0, 0, W, horizonY);
        // Darken ocean, beach, buildings
        ctx.fillStyle = `rgba(5, 10, 30, ${0.55 * overlayIntensity})`;
        ctx.fillRect(0, horizonY, W, H - horizonY);
        // Redraw stars and moon on top of overlay
        if (starOpacity > 0) {
          ctx.globalAlpha = starOpacity;
          drawNightStars(ctx, W, H, t);
          ctx.globalAlpha = 1;
        }
        if (moonPos.visible) {
          drawMoon(ctx, moonPos.x, moonPos.y, 24, t);
        }
        // Redraw glowing windows & beacons with overlay intensity
        ctx.globalAlpha = overlayIntensity;
        drawCoastalBuildings(ctx, W, H, horizonY, t, true);
        drawPierLights(ctx, deckY, pierLeftX, pierRightX, t);
        ctx.globalAlpha = 1;
        // Aircraft navigation lights
        ctx.globalAlpha = overlayIntensity;
        const plane = stateRef.current.airliner;
        const px = snap(plane.x);
        const py = snap(plane.y);
        const P = PIXEL;
        // Port wing tip — red
        drawPixelRect(ctx, px + P * 7, py - P, P, P, "#ff0000");
        // Starboard wing tip — green
        drawPixelRect(ctx, px + P * 7, py + P * 4, P, P, "#00ff00");
        // Tail light — white
        drawPixelRect(ctx, px - P, py - P * 2, P, P, "#ffffff");
        // Anti-collision beacon — flashing red
        if (Math.sin(t * 0.04) > 0) {
          drawPixelRect(ctx, px + P * 9, py, P, P, "#ff3333");
          drawPixelRect(ctx, px + P * 9, py + P * 3, P, P, "#ff3333");
        }
        // Cabin windows — warm glow
        drawPixelRect(ctx, px + P * 4, py + P, P * 10, P, "#ffeeaa");
        ctx.globalAlpha = 1;
      }

      // Advance animation state
      stateRef.current.t = t + 1;
      stateRef.current.ferrisAngle += (2 * Math.PI) / (35 * 60);
      stateRef.current.animId = requestAnimationFrame(draw);
    };

    stateRef.current.animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (stateRef.current.animId !== null)
        cancelAnimationFrame(stateRef.current.animId);
    };
  }, []);

  return (
    <div className="relative h-[120vh] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 place-content-center grid">
        {children}
      </div>
    </div>
  );
}
