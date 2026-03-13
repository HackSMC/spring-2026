import { Header } from "@/components/header";
import { Keys } from "@react95/icons";
import { LoginForm } from "./components/login-form";

export default function LoginPage() {
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
            icon={<Keys />}
            subtitle="Sign in to continue your hacker journey"
          >
            Hacker Login
          </Header>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
