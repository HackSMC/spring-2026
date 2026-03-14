"use client"; // ← can actually remove this too if you drop all hooks

import { TealBackground } from "@/components/teal-background";
import { SolidDitheredOverlay } from "../components/dithered-overlay";

const MESSAGES = [
  "Initializing...",
  "Loading resources...",
  "Applying settings...",
  "Checking system integrity...",
  "Finalizing configurations...",
  "Almost there...",
];

const DURATION = MESSAGES.length * 0.15;

export default function Loading() {
  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <TealBackground />
      <SolidDitheredOverlay />
      <div className="z-20 bg-[#d4d0c8] shadow-[2px_2px_0px_#000] border-2 border-white border-r-[#808080] border-b-[#808080] w-[400px]">
        <div className="flex items-center bg-[#000080] px-2 py-1">
          <span className="font-sans font-bold text-white text-xs">
            System Startup
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="bg-[#808080] border border-[#404040] w-full h-4 overflow-hidden">
            <div
              className="bg-[#000080] h-full"
              style={{ animation: "loading-bar 1s ease-out forwards" }}
            />
          </div>

          <div className="relative min-h-[1rem]">
            {MESSAGES.map((msg, i) => (
              <p
                key={i}
                className="absolute inset-0 opacity-0 font-sans text-gray-700 text-xs"
                style={{
                  animation: `msg-step ${DURATION}s steps(1) forwards`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {msg}
              </p>
            ))}
          </div>

          <style>{`
            @keyframes loading-bar {
              0%   { width: 0% }
              100% { width: 95% }
            }
            @keyframes msg-step {
              0%   { opacity: 1; }
              /* Stay visible for one step, then hide */
              ${100 / MESSAGES.length}% { opacity: 0; }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
