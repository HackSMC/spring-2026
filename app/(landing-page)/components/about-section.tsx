import { useState, useEffect, useRef } from "react";
import { Frame } from "@react95/core";
import { ReadmeModal, SMCCampusModal } from "./modals";

const stats = [
  { label: "Hackers", value: "100", suffix: "+" },
  { label: "Days", value: "2", suffix: "" },
  { label: "Tracks", value: "5", suffix: "" },
  { label: "Prizes", value: "2", prefix: "$", suffix: "k+" },
];

function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);
  return count;
}

function StatBox({
  label,
  value,
  prefix = "",
  suffix = "",
  animate,
}: {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  animate: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const count = useCountUp(parseInt(value), 1200, animate);

  return (
    <Frame
      bgColor="$material"
      boxShadow={pressed ? "$in" : "$out"}
      className="flex flex-col items-center py-3 md:py-4 transition-none cursor-default select-none"
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <span
        className="font-bold text-[#000080] text-xl md:text-2xl leading-none"
        style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
      >
        {prefix}
        {animate ? count : value}
        {suffix}
      </span>
      <span
        className="mt-1 text-[#444] text-xs md:text-sm"
        style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
      >
        {label}
      </span>
    </Frame>
  );
}

export function AboutSection() {
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Frame className="z-10 relative mt-[-1px] w-full" boxShadow="none">
      <div
        id="about"
        ref={sectionRef}
        className="flex justify-center items-center px-4 md:px-6 py-16 md:py-36"
      >
        <div className="flex flex-col gap-6 w-full max-w-xl">
          <p
            className="text-white text-base md:text-xl text-center leading-relaxed"
            style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
          >
            HackSMC is Santa Monica College's hackathon, organized by community
            college students, for community college students. Over two
            exhilarating days, we bring together builders to collaborate,
            innovate, and turn ambitious ideas into reality. Participants get
            the chance to tackle multiple tracks, connect with industry leaders,
            and showcase their skills in a high-energy environment built
            specifically for our community.
          </p>

          {/* Stats */}
          <div className="gap-2 md:gap-3 grid grid-cols-4">
            {stats.map(({ label, value, prefix, suffix }) => (
              <StatBox
                key={label}
                label={label}
                value={value}
                prefix={prefix}
                suffix={suffix}
                animate={animate}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals: tablet (md) and up only */}
      <div className="hidden md:block">
        <SMCCampusModal style={{ top: "20%", left: "5vw" }} />
        <ReadmeModal style={{ bottom: -64, right: "3vw", zIndex: 10 }} />
      </div>
    </Frame>
  );
}

export default AboutSection;
