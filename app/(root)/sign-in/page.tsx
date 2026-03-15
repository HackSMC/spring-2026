import { Header } from "@/components/header";
import { Keys } from "@react95/icons";
import { LoginForm } from "./components/login-form";
import { delay } from "@/lib/use-delay";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <div className="place-content-center grid py-16 w-full h-full">
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
