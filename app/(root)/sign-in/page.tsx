"use client";
import { Header } from "@/components/header";
import { Keys } from "@react95/icons";
import { LoginForm } from "./components/login-form";
import { delay } from "@/lib/use-delay";

export default function LoginPage() {
  delay();
  return (
    <div className="z-20 relative place-content-center grid px-4 py-16 w-full min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="top-1/2 left-1/2 absolute rounded-full w-[28rem] h-[28rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(220,255,255,0.28) 0%, rgba(220,255,255,0.16) 32%, rgba(220,255,255,0.08) 52%, rgba(220,255,255,0) 74%)",
          filter: "blur(10px)",
        }}
      />
      <div className="relative grid grid-cols-1 grid-rows-[auto,1fr]">
        <div className="z-20 w-full">
          <Header icon={<Keys />} subtitle="Login to your account">
            Login
          </Header>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
