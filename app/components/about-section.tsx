import { useState, useEffect, useRef } from "react";
import { Frame } from "@react95/core";

const stats = [
  { label: "Hackers", value: "100", suffix: "+" },
  { label: "Hours", value: "48", suffix: "" },
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
      // ease out quad
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
      className="flex flex-col items-center py-4 transition-none cursor-default select-none"
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <span
        className="font-bold text-[#000080] text-2xl leading-none"
        style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
      >
        {prefix}
        {animate ? count : value}
        {suffix}
      </span>
      <span
        className="mt-1 text-[#444] text-sm"
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

  // Trigger count-up when section scrolls into view
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
    <Frame bgColor="$material" className="relative w-full">
      <div
        id="about"
        ref={sectionRef}
        className="flex justify-center items-center p-12"
      >
        <div className="flex flex-col gap-6 w-full max-w-2xl">
          {/* Description — inset panel */}
          <Frame boxShadow="$in" bgColor="$headerBackground" className="p-8">
            <p
              className="text-white text-lg text-center leading-relaxed"
              style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
            >
              HackSMC is Santa Monica College's hackathon, organized by
              community college students, for community college students. Over
              two exhilarating days, we bring together builders to collaborate,
              innovate, and turn ambitious ideas into reality. Participants get
              the chance to tackle multiple tracks, connect with industry
              leaders, and showcase their skills in a high-energy environment
              built specifically for our community.
              {/* Blinking cursor */}
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "1.1em",
                  background: "white",
                  marginLeft: "3px",
                  verticalAlign: "text-bottom",
                  animation: "blink 1.1s step-end infinite",
                }}
              />
            </p>
          </Frame>

          {/* Stats */}
          <div className="gap-3 grid grid-cols-4">
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

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </Frame>
  );
}

export default AboutSection;
