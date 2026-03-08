import { Frame, Modal, Button, TitleBar } from "@react95/core";
import { Computer, McmEarth, Network3, Qfecheck111 } from "@react95/icons";
import { HeroBackground } from "./hero-background";
import Image from "next/image";
import { useState, useEffect } from "react";

export function HeroSection({ sunProgress }: { sunProgress: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HeroBackground sunProgress={sunProgress}>
      <div
        className="flex flex-col items-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <HeroModal />
        <div className="justify-items-center place-content-center gap-4 grid mt-4">
          <Button
            className="flex items-center gap-2 cursor-pointer"
            style={{ fontSize: "1.5rem" }}
          >
            <McmEarth className="w-6 h-6" />
            Apply Now
          </Button>

          <div className="flex gap-8">
            <Button
              className="flex items-center gap-2 cursor-pointer"
              style={{ fontSize: "1.25rem" }}
            >
              <Network3 className="w-5 h-5" />
              Apply as a Volunteer/Organizer
            </Button>

            <Button
              className="flex items-center gap-2 cursor-pointer"
              style={{ fontSize: "1.25rem" }}
            >
              <Qfecheck111 className="w-5 h-5" />
              Apply as a Judge
            </Button>
          </div>
        </div>
      </div>
    </HeroBackground>
  );
}

function HeroModal() {
  return (
    <Modal
      title="Welcome"
      icon={<Computer variant="16x16_4" />}
      dragOptions={{ disabled: true }}
      style={{
        position: "relative",
        translate: "none",
        left: "auto",
        top: "auto",
      }}
      titleBarOptions={[
        <TitleBar.Help key="help" onClick={() => alert("Hello!")} />,
      ]}
    >
      <Modal.Content boxShadow="$in" bgColor="$material">
        <div className="flex flex-row gap-8 p-2 w-full">
          <Frame bgColor="$material" boxShadow="$out">
            <Frame
              h="100%"
              boxShadow="$in"
              padding="$8"
              style={{
                backgroundColor: "#e8ed8f",
                backgroundImage:
                  "radial-gradient(circle, #ffffff 2px, transparent 2px)",
                backgroundSize: "4px 4px",
              }}
            >
              <Image
                src="/logo-main.png"
                width={180}
                height={180}
                alt="hackSMC logo"
              />
            </Frame>
          </Frame>
          <div className="flex-1 place-content-center grid">
            <div className="font-bold text-6xl">May 9–10, 2026</div>
            <div className="mt-8 text-4xl text-center">Bundy Campus</div>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}
