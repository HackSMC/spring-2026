import { useEffect, useRef } from "react";

const PIXEL = 4;
const TEAL_PALETTE = ["#005050", "#006060", "#007070", "#008080"];
const FOAM_COLOR = "#ffffff";

export function WaveTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store the "lifespan" of foam at each x-coordinate
  const foamMap = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snap = (v: number) => Math.floor(v / PIXEL) * PIXEL;

    let t = 0;
    let animationId: number;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < 4; i++) {
        const speed = 0.04 + i * 0.01;
        const baseAmp = 4 + i * 1.2;
        const freq = 0.025 + i * 0.008;
        const offset = i * 8;

        for (let x = 0; x < W; x += PIXEL) {
          const wave =
            Math.sin(x * freq + t * speed) * baseAmp +
            Math.sin(x * (freq * 2.5) + t * (speed * 1.8)) * (baseAmp * 0.3);

          const y = snap(H * 0.6 + wave + offset);

          // Draw the wave body
          ctx.fillStyle = TEAL_PALETTE[i];
          ctx.fillRect(snap(x), y, PIXEL, H - y);

          // Inside your render loop, where you handle foam:
          if (i >= 2) {
            // 1. Lower the probability of appearance to reduce "noise"
            if (wave < -baseAmp * 0.4 && Math.random() > 0.98) {
              foamMap.current.set(x, 15); // 2. Increase lifespan to 15 frames for smoother fading
            }

            const life = foamMap.current.get(x) || 0;
            if (life > 0) {
              ctx.fillStyle = FOAM_COLOR;
              // 3. Draw at 'y' instead of 'y - PIXEL' so it sits IN the wave
              ctx.fillRect(snap(x), y, PIXEL, PIXEL);
              foamMap.current.set(x, life - 1);
            }
          }
        }
      }

      t += 0.15;
      animationId = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = snap(canvas.offsetWidth);
      canvas.height = 100;
    };

    window.addEventListener("resize", resize);
    resize();
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="z-10 relative -mt-16 w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
