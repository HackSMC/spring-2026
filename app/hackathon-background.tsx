"use client";
import { useEffect, useRef, useState } from "react";

// Pre-build the character set as an array once
const CHARS = Array.from(
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ",
);
const CHAR_COUNT = CHARS.length;
const TAIL_LENGTH = 18;
const MIN_SIZE = 18;
const MAX_SIZE = 26;

// Pre-allocate a random char lookup — refresh periodically instead of per-frame
const randChar = () => CHARS[(Math.random() * CHAR_COUNT) | 0];

type Column = {
  x: number;
  fontSize: number;
  colGap: number;
  drop: number;
  speed: number;
  tail: string[]; // just chars, not objects
  fontStr: string; // cache font string
  depthT: number; // cached 0..1 depth
};

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!; // alpha:false = faster compositing
    if (!ctx) return;

    let rafId: number;
    let columns: Column[] = [];

    const buildColumns = () => {
      columns = [];
      let x = 0;
      while (x < canvas.width) {
        const fontSize = (MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE)) | 0;
        const colGap = (fontSize * 1.6) | 0;
        const t = (fontSize - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
        const speed = 0.03 + t * 0.06;
        columns.push({
          x,
          fontSize,
          colGap,
          drop: Math.pow(Math.random(), 2.5) * ((canvas.height / fontSize) | 0),
          speed,
          tail: [],
          fontStr: `bold ${fontSize}px "Courier New",monospace`,
          depthT: t,
        });
        x += colGap;
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildColumns();
      }, 100); // debounce rebuilds
    };

    // Initial setup — skip debounce for first load
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildColumns();
    window.addEventListener("resize", resize);

    // Shared fade rect — reuse the same fill each frame
    const BG_FILL = "rgba(0,45,45,0.32)";

    // Track last font used to avoid redundant ctx.font assignments
    let lastFont = "";

    const draw = () => {
      ctx.fillStyle = BG_FILL;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const len = columns.length;
      for (let i = 0; i < len; i++) {
        const col = columns[i];
        const { fontSize, tail, speed, fontStr, depthT } = col;

        // Only set font if it changed
        if (fontStr !== lastFont) {
          ctx.font = fontStr;
          lastFont = fontStr;
        }

        const currentRow = col.drop | 0;
        const prevRow = (col.drop - speed) | 0;
        if (currentRow !== prevRow) {
          tail.unshift(randChar());
          if (tail.length > TAIL_LENGTH) tail.length = TAIL_LENGTH;
        }

        // Rare tail flicker — use a cheaper random check
        if (Math.random() < 0.003 && tail.length > 1) {
          tail[1 + ((Math.random() * (tail.length - 1)) | 0)] = randChar();
        }

        const headY = col.drop * fontSize;
        const tailLen = tail.length;

        for (let t = tailLen - 1; t >= 0; t--) {
          const ty = headY - t * fontSize;
          if (ty < -fontSize || ty > canvas.height) continue;

          if (t === 0) {
            ctx.shadowColor = "#00ff88";
            ctx.shadowBlur = 10 + depthT * 8;
            ctx.fillStyle = "#e8fff2";
          } else {
            const fade = 1 - t / TAIL_LENGTH;
            const green = (160 + depthT * 30 + fade * 65) | 0;
            const alpha = Math.max(0.06, fade * (0.7 + depthT * 0.25));
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            // Avoid template literal allocation in hot path
            ctx.fillStyle =
              "rgba(0," +
              (green > 255 ? 255 : green) +
              "," +
              ((60 + depthT * 20) | 0) +
              "," +
              alpha.toFixed(2) +
              ")";
          }

          ctx.fillText(tail[t], col.x, ty);
        }

        ctx.shadowBlur = 0;
        col.drop += speed;

        if (col.drop * fontSize > canvas.height && Math.random() > 0.985) {
          col.drop =
            Math.pow(Math.random(), 2.5) * ((canvas.height / fontSize / 3) | 0);
          col.tail = [];
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
        // Promote canvas to its own compositor layer — avoids repaints from siblings
        willChange: "transform",
      }}
    />
  );
}

// ─── Konami / BSOD ──────────────────────────────────────────────────────────

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const KONAMI_STR = KONAMI.join(",");

function useBSOD() {
  const [active, setActive] = useState(false);
  const seq = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      seq.current.push(e.key);
      if (seq.current.length > KONAMI.length) seq.current.shift(); // mutate in place, no slice
      if (seq.current.join(",") === KONAMI_STR) {
        setActive(true);
        setTimeout(() => setActive(false), 5000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return active;
}

function BSOD() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0000aa",
        color: "#aaaaaa",
        fontFamily: '"Courier New", monospace',
        fontSize: 16,
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <style>{`
        .bsod-title { background:#aaaaaa; color:#0000aa; padding:2px 8px; display:inline-block; font-weight:bold; font-size:18px; }
        .bsod-body  { color:#ffffff; line-height:1.8; max-width:640px; }
        .bsod-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity:0 } }
      `}</style>
      <div className="bsod-title">Windows 95</div>
      <br />
      <div className="bsod-body">
        A fatal exception <strong style={{ color: "#fff" }}>0E</strong> has
        occurred at <strong style={{ color: "#fff" }}>hackathon.exe</strong>.
        The current application will be terminated.
      </div>
      <div className="bsod-body">
        * Press any key to terminate the current application.
        <br />
        * Press CTRL+ALT+DEL to restart your computer. You will
        <br />
        &nbsp;&nbsp;lose any unsaved information in all applications.
      </div>
      <br />
      <div className="bsod-body">
        Press any key to continue <span className="bsod-blink">_</span>
      </div>
      <br />
      <div style={{ color: "#aaaaaa", fontSize: 13 }}>
        hackSMC Hackathon · Bundy Campus · May 9–10, 2026
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function HackathonBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const bsod = useBSOD();

  return (
    <div className="crt-root">
      <style>{`
        .crt-root {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #004d4d;
        }
        .crt-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-color: #004d4d;
          background-image:
            linear-gradient(to right,  rgba(0,139,139,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,139,139,0.4) 1px, transparent 1px);
          background-size: 40px 40px;
          /* Isolate grid to its own layer */
          will-change: transform;
        }

        /* Scanlines: use a pseudo-element so it's a single layer, no DOM node */
        .crt-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          /* Scanlines + vignette in one pass — fewer layers */
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 3px,
              rgba(0,0,0,0.13) 3px,
              rgba(0,0,0,0.13) 4px
            ),
            radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%);
        }

        /* Sweep: isolated to its own composited layer */
        .crt-sweep {
          position: absolute;
          inset: 0;
          z-index: 11;
          pointer-events: none;
          will-change: background-position;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255,255,255,0.025) 50%,
            transparent 100%
          );
          background-size: 100% 200%;
          animation: sweep 8s linear infinite;
        }
        @keyframes sweep {
          from { background-position: 0 -100%; }
          to   { background-position: 0  200%; }
        }

        /*
          Flicker: moved off the root to a dedicated pseudo-element overlay.
          This avoids invalidating the entire subtree on every flicker tick.
          The overlay uses opacity only (GPU-composited, no repaint).
        */
        .crt-flicker {
          position: absolute;
          inset: 0;
          z-index: 12;
          pointer-events: none;
          background: transparent;
          animation: flicker 0.15s steps(1) infinite;
        }
        @keyframes flicker {
          0%,91%,95%,100% { opacity: 0; }
          92%,93%          { opacity: 0.04; }
          94%              { opacity: 0.02; }
        }

        .crt-content {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .easter-hint {
          position: absolute;
          bottom: 12px;
          right: 16px;
          z-index: 21;
          font-family: "Courier New", monospace;
          font-size: 11px;
          color: rgba(0,255,136,0.25);
          pointer-events: none;
          letter-spacing: 0.05em;
        }
      `}</style>

      {bsod && <BSOD />}

      <div className="crt-grid" />
      <MatrixRain />

      {/* Combined scanlines + vignette in one element = one fewer layer */}
      <div className="crt-overlay" aria-hidden />
      <div className="crt-sweep" aria-hidden />
      {/* Flicker as isolated overlay — doesn't repaint canvas or children */}
      <div className="crt-flicker" aria-hidden />

      <div className="crt-content">{children}</div>
      <div className="easter-hint">↑↑↓↓←→←→BA</div>
    </div>
  );
}
