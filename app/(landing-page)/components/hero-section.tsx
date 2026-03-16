import { Frame, Button, TitleBar } from "@react95/core";
import { Computer, McmEarth, Network3, Qfecheck111 } from "@react95/icons";
import { HeroBackground } from "./hero-background";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Win95Modal, Win95ModalContent } from "@/components/modal";

export function HeroSection({ sunProgress }: { sunProgress: number }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HeroBackground sunProgress={sunProgress}>
      <div
        className={`flex flex-col items-center mb-[15vh] sm:mb-[20vh] transition-all duration-600 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <HeroModal />
        <div className="place-items-center gap-3 sm:gap-4 grid mt-4">
          <Button
            className="flex items-center gap-2 px-4 py-2 text-lg! sm:text-xl! lg:text-2xl! cursor-pointer"
            onClick={() => router.push("/apply")}
          >
            <McmEarth className="w-5 sm:w-6 h-5 sm:h-6" />
            Apply Now
          </Button>

          <div className="flex sm:flex-row flex-col items-center md:items-baseline gap-2 sm:gap-8">
            <Button className="flex items-center gap-2 px-3 py-1.5 text-base! sm:text-lg! lg:text-xl! cursor-pointer">
              <Network3 className="w-4 sm:w-5 h-4 sm:h-5" />
              Become an Organizer
            </Button>

            <Button className="flex items-center gap-2 px-3 py-1.5 text-base! sm:text-lg! lg:text-xl! cursor-pointer">
              <Qfecheck111 className="w-4 sm:w-5 h-4 sm:h-5" />
              Become a Judge
            </Button>
          </div>
        </div>
      </div>
    </HeroBackground>
  );
}

function HeroModal() {
  return (
    <Win95Modal
      title="Welcome"
      icon={<Computer variant="16x16_4" />}
      titleBarOptions={<TitleBar.Help onClick={() => alert("Hello!")} />}
    >
      <Win95ModalContent>
        <div className="flex flex-row gap-4 sm:gap-6 lg:gap-8 p-1.5 sm:p-2 w-full">
          {/* Logo panel */}
          <Frame bgColor="$material" boxShadow="$out" className="shrink-0">
            <Frame
              boxShadow="$in"
              className="flex justify-center items-center bg-[#f0ede0] p-2 sm:p-4 [background-image:radial-gradient(circle,#d8d4c4_1.5px,transparent_1.5px)] [background-size:4px_4px]"
            >
              <Image
                src="/logo-main.png"
                width={140}
                height={140}
                alt="hackSMC logo"
                className="w-[80px] md:w-[130px] lg:w-[140px] h-auto"
              />
            </Frame>
          </Frame>

          {/* Date + location */}
          <div className="flex flex-col flex-1 justify-center items-center gap-1 sm:gap-3 min-w-0">
            <div className="font-bold text-3xl sm:text-5xl md:text-6xl text-center leading-tight">
              May 9–10, 2026
            </div>
            <div className="text-[#444] text-xl sm:text-3xl md:text-4xl">
              Bundy Campus
            </div>
          </div>
        </div>
      </Win95ModalContent>
    </Win95Modal>
  );
}
