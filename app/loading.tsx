"use client";

import { TealBackground } from "@/components/teal-background";
import { Frame, ProgressBar } from "@react95/core";
import { useEffect, useState } from "react";
import { SolidDitheredOverlay } from "../components/dithered-overlay";

const MESSAGES = [
  "Initializing...",
  "Loading resources...",
  "Applying settings...",
  "Almost there...",
];

export default function Loading() {
  const [percent, setPercent] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((p) => {
        if (p >= 85) {
          clearInterval(interval);
          return 85;
        }
        return p + Math.random() * 6;
      });
    }, 10);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const idx = Math.floor((percent / 85) * MESSAGES.length);
    setMsgIndex(Math.min(idx, MESSAGES.length - 1));
  }, [percent]);

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <TealBackground />
      <SolidDitheredOverlay />
      <Frame style={{ zIndex: 20, width: 400 }} bgColor="$material">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <p className="font-sans text-black text-sm">
              Loading, please wait.
            </p>
          </div>
          <ProgressBar percent={Math.floor(percent)} width="100%" />
          <p className="font-sans text-black text-gray-600 text-xs">
            {MESSAGES[msgIndex]}
          </p>
        </div>
      </Frame>
    </div>
  );
}
