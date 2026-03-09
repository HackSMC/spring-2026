"use client";

import { useState, useEffect, useCallback } from "react";

// Santa Monica, CA — used for sunrise/sunset calculation
const LAT = 34.0195;
const LNG = -118.4912;

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export type SkyPhase =
  | "night"
  | "dawn"
  | "sunrise"
  | "morning"
  | "midday"
  | "afternoon"
  | "sunset"
  | "dusk";

/**
 * Calculates sunrise and sunset times for a given location and date
 * using the NOAA solar calculator algorithm.
 */
function getSunTimes(
  lat: number,
  lng: number,
  date: Date,
): { sunrise: Date; sunset: Date } {
  const zenith = 90.833;
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  const lngHour = lng / 15;

  function calc(isRise: boolean): Date {
    const t = dayOfYear + ((isRise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;

    let L =
      M +
      1.916 * Math.sin(M * D2R) +
      0.02 * Math.sin(2 * M * D2R) +
      282.634;
    L = ((L % 360) + 360) % 360;

    let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
    RA = ((RA % 360) + 360) % 360;
    RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
    RA /= 15;

    const sinDec = 0.39782 * Math.sin(L * D2R);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos(zenith * D2R) - sinDec * Math.sin(lat * D2R)) /
      (cosDec * Math.cos(lat * D2R));

    // Extreme latitude edge case — sun never rises or never sets
    if (cosH > 1 || cosH < -1) {
      const result = new Date(date);
      result.setHours(isRise ? 6 : 18, 0, 0, 0);
      return result;
    }

    const H =
      (isRise ? 360 - R2D * Math.acos(cosH) : R2D * Math.acos(cosH)) / 15;
    const localT = H + RA - 0.06571 * t - 6.622;
    const utcHours = ((localT - lngHour) % 24 + 24) % 24;
    const tzOffset = -date.getTimezoneOffset() / 60;
    const localHours = ((utcHours + tzOffset) % 24 + 24) % 24;

    const result = new Date(date);
    result.setHours(
      Math.floor(localHours),
      Math.round((localHours % 1) * 60),
      0,
      0,
    );
    return result;
  }

  return { sunrise: calc(true), sunset: calc(false) };
}

interface SunBreakpoints {
  dawnStart: number;
  sunriseHour: number;
  solarNoon: number;
  sunsetHour: number;
  duskEnd: number;
}

function getSunBreakpoints(lat: number, lng: number, date: Date): SunBreakpoints {
  const { sunrise, sunset } = getSunTimes(lat, lng, date);
  const sunriseHour = sunrise.getHours() + sunrise.getMinutes() / 60;
  const sunsetHour = sunset.getHours() + sunset.getMinutes() / 60;
  const twilightDuration = 0.75; // hours
  const dawnStart = sunriseHour - twilightDuration;
  const duskEnd = sunsetHour + twilightDuration;
  const solarNoon = (sunriseHour + sunsetHour) / 2;
  return { dawnStart, sunriseHour, solarNoon, sunsetHour, duskEnd };
}

/**
 * Maps the current time onto a 0.0–1.0 sun progress scale.
 *
 * 0.0 = midnight, 0.25 = sunrise, 0.50 = solar noon, 0.75 = sunset, 1.0 = midnight again.
 *
 * Civil twilight (~45 min) is used for dawn/dusk transitions.
 */
function computeSunProgress(lat: number, lng: number): number {
  const now = new Date();
  const { dawnStart, sunriseHour, solarNoon, sunsetHour, duskEnd } =
    getSunBreakpoints(lat, lng, now);

  // Get hours as a decimal (0–24)
  const currentHour =
    now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  // Map to 0.0–1.0 scale
  // midnight(0h) = 0.0, dawn = ~0.20, sunrise = 0.25, noon = 0.50, sunset = 0.75, dusk = ~0.80, midnight(24h) = 1.0

  let progress: number;

  if (currentHour <= dawnStart) {
    // Before dawn: midnight (0.0) to dawn start (0.20)
    progress = (currentHour / dawnStart) * 0.20;
  } else if (currentHour <= sunriseHour) {
    // Dawn: dawn start (0.20) to sunrise (0.25)
    const t = (currentHour - dawnStart) / (sunriseHour - dawnStart);
    progress = 0.20 + t * 0.05;
  } else if (currentHour <= solarNoon) {
    // Morning: sunrise (0.25) to solar noon (0.50)
    const t = (currentHour - sunriseHour) / (solarNoon - sunriseHour);
    progress = 0.25 + t * 0.25;
  } else if (currentHour <= sunsetHour) {
    // Afternoon: solar noon (0.50) to sunset (0.75)
    const t = (currentHour - solarNoon) / (sunsetHour - solarNoon);
    progress = 0.50 + t * 0.25;
  } else if (currentHour <= duskEnd) {
    // Dusk: sunset (0.75) to dusk end (0.80)
    const t = (currentHour - sunsetHour) / (duskEnd - sunsetHour);
    progress = 0.75 + t * 0.05;
  } else {
    // After dusk: dusk end (0.80) to midnight (1.0)
    const t = (currentHour - duskEnd) / (24 - duskEnd);
    progress = 0.80 + t * 0.20;
  }

  return Math.max(0, Math.min(1, progress));
}

/**
 * Converts a sun progress value (0.0–1.0) back into a time string like "6:30 AM".
 * Inverts the piecewise mapping used by computeSunProgress.
 */
export function sunProgressToTimeString(progress: number): string {
  const bp = getSunBreakpoints(LAT, LNG, new Date());

  let hour: number;

  if (progress <= 0.20) {
    hour = (progress / 0.20) * bp.dawnStart;
  } else if (progress <= 0.25) {
    const t = (progress - 0.20) / 0.05;
    hour = bp.dawnStart + t * (bp.sunriseHour - bp.dawnStart);
  } else if (progress <= 0.50) {
    const t = (progress - 0.25) / 0.25;
    hour = bp.sunriseHour + t * (bp.solarNoon - bp.sunriseHour);
  } else if (progress <= 0.75) {
    const t = (progress - 0.50) / 0.25;
    hour = bp.solarNoon + t * (bp.sunsetHour - bp.solarNoon);
  } else if (progress <= 0.80) {
    const t = (progress - 0.75) / 0.05;
    hour = bp.sunsetHour + t * (bp.duskEnd - bp.sunsetHour);
  } else {
    const t = (progress - 0.80) / 0.20;
    hour = bp.duskEnd + t * (24 - bp.duskEnd);
  }

  // Convert decimal hour to total minutes, handling edge cases
  let totalMinutes = Math.round(hour * 60);
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;

  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getPhase(sunProgress: number): SkyPhase {
  if (sunProgress < 0.18) return "night";
  if (sunProgress < 0.22) return "dawn";
  if (sunProgress < 0.27) return "sunrise";
  if (sunProgress < 0.40) return "morning";
  if (sunProgress < 0.60) return "midday";
  if (sunProgress < 0.73) return "afternoon";
  if (sunProgress < 0.77) return "sunset";
  if (sunProgress < 0.82) return "dusk";
  return "night";
}

export function useSunCycle() {
  const [realSunProgress, setRealSunProgress] = useState(
    () => computeSunProgress(LAT, LNG),
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [overrideProgress, setOverrideProgress] = useState<number | null>(null);

  const effectiveSunProgress = overrideProgress ?? realSunProgress;
  const phase = getPhase(effectiveSunProgress);
  const isNight = effectiveSunProgress < 0.20 || effectiveSunProgress > 0.80;

  const updateSunState = useCallback(() => {
    setRealSunProgress(computeSunProgress(LAT, LNG));
  }, []);

  useEffect(() => {
    // Update the clock every second
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Re-check sun progress every minute
    const sunInterval = setInterval(updateSunState, 60000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(sunInterval);
    };
  }, [updateSunState]);

  return {
    realSunProgress,
    effectiveSunProgress,
    phase,
    isNight,
    currentTime,
    overrideProgress,
    setOverrideProgress,
  };
}
