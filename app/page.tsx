"use client";
import { useState } from "react";
import { Frame, Modal, Button, TitleBar } from "@react95/core";
import { Computer, McmEarth, Network3, Qfecheck111 } from "@react95/icons";
import Image from "next/image";
import { HeroBackground, PALETTE } from "./hero-background";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
    </>
  );
}

function Hero() {
  const [nightMode, setNightMode] = useState(false);
  return (
    <HeroBackground nightMode={nightMode}>
      <div>
        <HeroModal nightMode={nightMode} onToggleNight={() => setNightMode((n) => !n)} />
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

function HeroModal({ nightMode, onToggleNight }: { nightMode: boolean; onToggleNight: () => void }) {
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
        <TitleBar.Help
          key="help"
          onClick={() => {
            alert("Hello!");
          }}
        />,
        <button
          key="theme"
          onClick={onToggleNight}
          style={{
            height: 14,
            padding: "0 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#c0c0c0",
            borderTop: "1px solid #ffffff",
            borderLeft: "1px solid #ffffff",
            borderRight: "1px solid #808080",
            borderBottom: "1px solid #808080",
            cursor: "pointer",
            fontSize: "9px",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            color: "#000000",
          }}
        >
          {nightMode ? "Light Mode" : "Dark Mode"}
        </button>,
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

function About() {
  return (
    <div
      style={{ background: PALETTE.sand }}
      className="place-content-center grid pt-8 pb-24 w-full text-white"
    >
      <div className="w-200 text-xl text-center container">
        HackSMC is Santa Monica College’s hackathon, organized by community
        college students, for community college students. Over two exhilarating
        days, we bring together builders to collaborate, innovate, and turn
        ambitious ideas into reality. Participants get the chance to tackle
        multiple tracks, connect with industry leaders, and showcase their
        skills in a high-energy environment built specifically for our
        community.
      </div>
    </div>
  );
}

function Faq() {
  return (
    <Frame
      bgColor="$material"
      boxShadow="$out"
      style={{ height: "400px" }}
    ></Frame>
  );
}
