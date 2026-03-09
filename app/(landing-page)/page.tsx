"use client";

import { useEffect } from "react";
import { AboutSection } from "./components/about-section";
import { HeroSection } from "./components/hero-section";
import { TaskbarClock } from "./components/taskbar-clock";
import { useSunCycle } from "./hooks/use-sun-cycle";
import { FaqSection } from "./components/faq-section";
import { WaveTransition } from "./components/wave-transition";
import { DitheredOverlay } from "./components/dithered-overlay";

export default function Home() {
  const {
    realSunProgress,
    effectiveSunProgress,
    isNight,
    currentTime,
    overrideProgress,
    setOverrideProgress,
  } = useSunCycle();

  useEffect(() => {
    // Interpolate page background from day (rgb(85,170,170)) to night (#0a0a0a)
    const dayBg = [85, 170, 170];
    const nightBg = [10, 10, 10];
    // overlayIntensity: 0 during day, 1 during night, smooth transition
    let intensity: number;
    if (effectiveSunProgress >= 0.27 && effectiveSunProgress <= 0.73) {
      intensity = 0;
    } else if (effectiveSunProgress >= 0.82 || effectiveSunProgress <= 0.18) {
      intensity = 1;
    } else if (effectiveSunProgress > 0.73) {
      intensity = (effectiveSunProgress - 0.73) / 0.09;
    } else {
      intensity = 1 - (effectiveSunProgress - 0.18) / 0.09;
    }
    intensity = Math.max(0, Math.min(1, intensity));

    const r = Math.round(dayBg[0] + (nightBg[0] - dayBg[0]) * intensity);
    const g = Math.round(dayBg[1] + (nightBg[1] - dayBg[1]) * intensity);
    const b = Math.round(dayBg[2] + (nightBg[2] - dayBg[2]) * intensity);

    document.documentElement.style.setProperty(
      "--background",
      `rgb(${r},${g},${b})`,
    );
    document.documentElement.style.setProperty(
      "--foreground",
      isNight ? "#ededed" : "#171717",
    );
    document.documentElement.classList.toggle("night-mode", isNight);
  }, [effectiveSunProgress, isNight]);

  return (
    <>
      <HeroSection sunProgress={effectiveSunProgress} />
      <WaveTransition />
      <div className="relative bg-gradient-to-b from-[#008080] to-[#004C98]">
        <DitheredOverlay />
        <AboutSection />
        <FaqSection />
      </div>

      <TaskbarClock
        currentTime={currentTime}
        realSunProgress={realSunProgress}
        effectiveSunProgress={effectiveSunProgress}
        overrideProgress={overrideProgress}
        setOverrideProgress={setOverrideProgress}
      />
    </>
  );
}
