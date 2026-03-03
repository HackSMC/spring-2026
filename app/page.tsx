"use client";
import { Frame, Modal, TitleBar } from "@react95/core";
import { Computer } from "@react95/icons";
import Image from "next/image";

export default function Home() {
  return <Hero />;
}

function Hero() {
  return (
    <div className="crt-root">
      <style>{`
        /* ── Base ── */
        .crt-root {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #004d4d;
        }

        /* ── Teal grid (CSS-only, no gradient image) ── */
        .crt-root::before {
          content: "";
          position: absolute;
          inset: 0;
          background-color: #008080;
          background-image:
            linear-gradient(to right,  #008b8b 1px, transparent 1px),
            linear-gradient(to bottom, #008b8b 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }

        /* ── CRT scanlines ── */
        .crt-scanlines {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0, 0, 0, 0.13) 3px,
            rgba(0, 0, 0, 0.13) 4px
          );
        }

        /* ── CRT phosphor glow vignette ── */
        .crt-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(
            ellipse at center,
            transparent 55%,
            rgba(0, 0, 0, 0.55) 100%
          );
        }

        /* ── Slow scanline sweep ── */
        .crt-sweep {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 255, 255, 0.03) 50%,
            transparent 100%
          );
          background-size: 100% 200%;
          animation: sweep 8s linear infinite;
        }

        @keyframes sweep {
          0%   { background-position: 0 -100%; }
          100% { background-position: 0 200%;  }
        }

        /* ── Flicker ── */
        .crt-root {
          animation: flicker 0.15s infinite;
        }

        @keyframes flicker {
          0%   { opacity: 1;    }
          92%  { opacity: 1;    }
          93%  { opacity: 0.97; }
          94%  { opacity: 1;    }
          96%  { opacity: 0.98; }
          100% { opacity: 1;    }
        }

        /* ── Content layer ── */
        .crt-content {
          position: absolute;
          inset: 0;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Layers */}
      <div className="crt-scanlines" aria-hidden />
      <div className="crt-vignette" aria-hidden />
      <div className="crt-sweep" aria-hidden />

      {/* Modal */}
      <div className="crt-content">
        <Modal
          title="hackathon.exe"
          icon={<Computer variant="16x16_4" />}
          dragOptions={{ disabled: true }}
          style={{
            position: "relative",
            translate: "none",
            left: "auto",
            top: "auto",
            minWidth: 320,
          }}
          titleBarOptions={[
            <TitleBar.Help
              key="help"
              onClick={() => {
                alert("Hello!");
              }}
            />,
            <TitleBar.Close key="close" />,
          ]}
        >
          <Modal.Content boxShadow="$in" bgColor="$material">
            <div className="flex pr-4 pl-2">
              <Image
                src="logo-main.svg"
                width={180}
                height={180}
                alt="hackSMC logo"
              />
              <div className="place-content-center grid">
                <div className="font-bold text-6xl">Bundy Campus</div>
                <div className="mt-6 text-4xl text-center">May 9–10, 2026</div>
              </div>
            </div>
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
}
