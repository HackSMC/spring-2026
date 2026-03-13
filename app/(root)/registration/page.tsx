"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { New } from "@react95/icons";
import { RegistrationForm } from "./components/registration-form";
import { RegistrationLoading } from "./components/registration-loading";

export default function RegistrationPage() {
  const [percent, setPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) {
      return;
    }

    const timer = setInterval(() => {
      setPercent((previousPercent) => {
        if (previousPercent >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }

        const diff = Math.random() * 18;
        const nextPercent = Math.min(previousPercent + diff, 100);

        if (nextPercent >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }

        return nextPercent;
      });
    }, 120);

    return () => {
      clearInterval(timer);
    };
  }, [isReady]);

  return (
    <div className="relative z-20 grid min-h-screen w-full place-content-center overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(220,255,255,0.28) 0%, rgba(220,255,255,0.16) 32%, rgba(220,255,255,0.08) 52%, rgba(220,255,255,0) 74%)",
          filter: "blur(10px)",
        }}
      />
      <div className="relative grid grid-cols-1 grid-rows-[auto,1fr]">
        <div className="z-20 w-full">
          <Header
            icon={<New />}
            subtitle="Create your account to get started"
          >
            Hacker Registration
          </Header>
        </div>
        {isReady ? (
          <RegistrationForm />
        ) : (
          <RegistrationLoading percent={Math.floor(percent)} />
        )}
      </div>
    </div>
  );
}
