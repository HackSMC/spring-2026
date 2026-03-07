"use client";

import { Frame, Button } from "@react95/core";
import { Timedate } from "@react95/icons";
import { sunProgressToTimeString } from "../hooks/use-sun-cycle";

interface TaskbarClockProps {
  currentTime: Date;
  realSunProgress: number;
  effectiveSunProgress: number;
  overrideProgress: number | null;
  setOverrideProgress: (v: number | null) => void;
}

export function TaskbarClock({
  currentTime,
  realSunProgress,
  effectiveSunProgress,
  overrideProgress,
  setOverrideProgress,
}: TaskbarClockProps) {
  const timeString = currentTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  // When not overridden, use the real clock time directly to avoid
  // rounding errors from the progress → time conversion.
  const simulatedTime =
    overrideProgress !== null
      ? sunProgressToTimeString(effectiveSunProgress)
      : timeString;
  const isOverride = overrideProgress !== null;
  const sliderValue = Math.round(effectiveSunProgress * 1000);

  return (
    <Frame
      boxShadow="$out"
      style={{
        position: "fixed",
        bottom: 4,
        right: 4,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        padding: "2px 6px",
        backgroundColor: "#c0c0c0",
        height: "32px",
        gap: "6px",
      }}
    >
      {/* Simulated time label */}
      <Frame
        boxShadow="$in"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "1px 6px",
          fontSize: "11px",
          fontFamily: "Arial, sans-serif",
          height: "22px",
          color: isOverride ? "#0000aa" : undefined,
        }}
      >
        <Timedate variant="16x16_4" />
        {simulatedTime}
      </Frame>

      {/* Slider container */}
      <div
        style={{
          position: "relative",
          width: "160px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="range"
          className="win95-slider"
          min={0}
          max={1000}
          step={1}
          value={sliderValue}
          onChange={(e) =>
            setOverrideProgress(parseInt(e.target.value) / 1000)
          }
          style={{ width: "100%" }}
        />

        {/* "Now" marker — triangle on the slider track showing real time position */}
        {isOverride && (
          <div
            style={{
              position: "absolute",
              left: `${realSunProgress * 100}%`,
              transform: "translateX(-50%)",
              bottom: "-2px",
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: "4px solid #aa0000",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* "Now" button — snaps back to live mode */}
      {isOverride && (
        <Button
          onClick={() => setOverrideProgress(null)}
          style={{ fontSize: "11px", padding: "1px 6px", height: "22px" }}
        >
          Now
        </Button>
      )}

      {/* Real clock — always shows actual current time */}
      <Frame
        boxShadow="$in"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1px 6px",
          fontSize: "11px",
          fontFamily: "Arial, sans-serif",
          height: "22px",
        }}
      >
        {timeString}
      </Frame>
    </Frame>
  );
}
