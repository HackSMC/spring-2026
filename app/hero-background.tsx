import { useEffect, useRef } from "react";

const PIXEL = 4;

const PALETTE = {
  sky: "#008080",
  skyLight: "#00a898",
  sun: "#ffff55",
  sunGlow: "#ffcc00",
  mountain: "#005a5a",
  ocean: "#005555",
  oceanWave: "#006868",
  shallows: "#004d4d",
  wetSand: "#004848",
  sand: "#004444",
  foam: "#c0e8e8",
  cloudLight: "#c0e8e8",
  cloudDark: "#80c8c8",
  cloudShadow: "#40a8a8",
  star: "#aaffee",
  // Pier colors
  pierDeck: "#cc7722", // warm orange-brown planks
  pierPlank: "#aa5500", // darker plank gap
  pierPylon: "#884400", // dark support pylons
  pierRail: "#ffaa33", // bright railing highlight
  pierLight: "#ffee88", // lamp glow
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
interface AnimState {
  clouds: Cloud[];
  birds: Bird[];
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

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  const s = PIXEL * scale;
  ctx.fillStyle = PALETTE.cloudShadow;
  ctx.fillRect(snap(x + s), snap(y + s * 2), snap(s * 5), snap(s));
  ctx.fillStyle = PALETTE.cloudDark;
  ctx.fillRect(snap(x), snap(y + s * 2), snap(s * 5), snap(s));
  ctx.fillRect(snap(x + s), snap(y + s), snap(s * 3), snap(s));
  ctx.fillStyle = PALETTE.cloudLight;
  ctx.fillRect(snap(x + s), snap(y), snap(s * 3), snap(s));
  ctx.fillRect(snap(x), snap(y + s), snap(s * 5), snap(s));
  ctx.fillRect(snap(x + s * 0.5), snap(y + s * 2), snap(s * 4), snap(s));
}

function drawSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): void {
  for (let i = 3; i >= 0; i--) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.sunGlow : PALETTE.sky;
    const rr = snap(r + i * PIXEL * 2);
    ctx.beginPath();
    ctx.arc(snap(x), snap(y), rr, 0, Math.PI * 2);
    ctx.fill();
  }
  drawPixelRect(ctx, x - r, y - r, r * 2, r * 2, PALETTE.sun);
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
): void {
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137 + 50) % W;
    const sy = (i * 73 + 20) % (H * 0.45);
    if (Math.sin(t * 0.002 + i * 1.3) > 0.3) {
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
    // Left edge: abrupt hard cutoff — no fade-in, just starts at a low flat height
    // Right side: fuller peaks that grow naturally
    const leftFlat = Math.min(1, nx / (rangeW * 0.15)); // ramps from 0→1 over first 15%
    const height =
      leftFlat *
        (Math.abs(Math.sin(nx * 0.003)) * MOUNTAIN_HEIGHT +
          Math.sin(nx * 0.004) * (MOUNTAIN_HEIGHT * 0.2)) +
      4; // always at least 6px tall so it terminates as a flat line, not a spike
    const top = snap(horizonY - height);
    drawPixelRect(ctx, x, top, PIXEL, horizonY - top, PALETTE.mountain);
  }
}

function drawOcean(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
  t: number,
): void {
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
      // Each wave oscillates left-right
      const waveX = snap(
        ((i * 193 + t * speed + Math.sin(t * 0.01 + i) * 20) % (W + 120)) - 20,
      );
      const waveW = snap(minW + ((i * 37) % (maxW - minW)));
      drawPixelRect(ctx, waveX, snap(baseY), waveW, PIXEL * 1, color);
      // Second segment of same wave slightly offset for a broken look
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
  // wingPhase oscillates: 0=flat, 1=up, -1=down
  const flapY = Math.round(wingPhase * PIXEL * s * 0.8);

  ctx.fillStyle = PALETTE.star;
  // Left wing: two pixels angling up-left
  ctx.fillRect(snap(x - s * PIXEL * 2), snap(y + flapY), s * PIXEL, PIXEL);
  ctx.fillRect(snap(x - s * PIXEL), snap(y + flapY - PIXEL), s * PIXEL, PIXEL);
  // Body center dot
  ctx.fillRect(snap(x), snap(y), PIXEL, PIXEL);
  // Right wing mirror
  ctx.fillRect(snap(x + PIXEL), snap(y + flapY - PIXEL), s * PIXEL, PIXEL);
  ctx.fillRect(snap(x + PIXEL + s * PIXEL), snap(y + flapY), s * PIXEL, PIXEL);
}

function drawBirds(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
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
  const tc = (y - horizonY) / (H - horizonY); // 0 at horizon, 1 at bottom
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

  // Two overlapping sine waves — different frequencies/amplitudes for organic feel
  // Amplitude grows as we go down the screen (wider waves near bottom)
  const amp = W * 0.018 * (0.3 + tc * 0.7);
  const wiggle =
    Math.sin(y * 0.018) * amp + // slow broad wave
    Math.sin(y * 0.045 + 1.2) * amp * 0.5; // faster smaller ripple

  return base + wiggle;
}

function drawBeach(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  horizonY: number,
): void {
  for (let y = horizonY; y <= H; y += PIXEL) {
    const rawEdgeX = beachEdgeX(y, W, H, horizonY);

    // progress: 0 at horizon, 1 at bottom
    let progress = (y - horizonY) / (H - horizonY);

    // 1. Move the effect lower: we subtract a small amount so the
    // "inward curve" doesn't start until about 20% down the beach.
    const startOffset = 0.2;
    const adjustedProgress = Math.max(
      0,
      (progress - startOffset) / (1 - startOffset),
    );

    // 2. Curve inward: use Math.pow for an accelerating shift
    // Increase '0.4' to make the curve pull further to the left.
    const shift = Math.pow(adjustedProgress, 2) * W * 0.4;

    const edgeX = snap(rawEdgeX - shift);

    // Dry sand
    drawPixelRect(ctx, edgeX, y, W - edgeX, PIXEL, PALETTE.sand);

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

interface HeroBackgroundProps {
  children: React.ReactNode;
}

export function HeroBackground({ children }: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AnimState>({
    clouds: [],
    birds: [],
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
      stateRef.current.clouds = Array.from(
        { length: 7 },
        (_, i): Cloud => ({
          x: (i / 7) * canvas.width + ((i * 113) % 200),
          y: 40 + ((i * 53) % (canvas.height * 0.3)),
          speed: 0.15 + ((i * 0.07) % 0.3),
          scale: 1.5 + ((i * 0.4) % 2),
        }),
      );
      stateRef.current.birds = Array.from(
        { length: 6 },
        (_, i): Bird => ({
          x: (i / 6) * canvas.width + ((i * 97) % 300),
          y: canvas.height * 0.2 + ((i * 61) % (canvas.height * 0.2)),
          speed: 0.4 + ((i * 0.13) % 0.5),
          wingPhase: i * 1.1, // offset flap timing per bird
          scale: 1 + ((i * 0.3) % 1),
        }),
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (): void => {
      const { clouds, birds, t } = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = snap(H * 0.55);

      // 1. SKY
      const bandCount = 16;
      for (let b = 0; b < bandCount; b++) {
        const ratio = b / bandCount;
        const g = Math.round(128 + ratio * 24);
        const bv = Math.round(128 + ratio * 16);
        ctx.fillStyle = `rgb(0,${g},${bv})`;
        ctx.fillRect(
          0,
          snap((b / bandCount) * horizonY),
          W,
          snap(horizonY / bandCount) + PIXEL,
        );
      }

      // 2. STARS & SUN
      drawStars(ctx, W, H, t);
      drawSun(ctx, W * 0.15, H * 0.18, 24);

      // 3. CLOUDS
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > W + 200) cloud.x = -200;
        drawCloud(ctx, cloud.x, cloud.y, cloud.scale);
      });

      // 3b. BIRDS
      drawBirds(ctx, W, H, birds, t);

      // 4. MOUNTAINS (right side)
      drawMountains(ctx, W, horizonY);

      // 5. OCEAN
      drawOcean(ctx, W, H, horizonY, t);

      // 6. BEACH
      drawBeach(ctx, W, H, horizonY);

      stateRef.current.t = t + 1;
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
    <div className="relative h-screen overflow-hidden">
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
