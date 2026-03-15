import { Header } from "@/components/header";
import { New } from "@react95/icons";
import { RegistrationForm } from "./components/registration-form";
import { delay } from "@/lib/use-delay";

export default async function RegistrationPage() {
  return (
    <div className="place-content-center grid py-16 w-full h-full">
      <div className="grid grid-cols-1 grid-rows-[auto,1fr]">
        <div className="w-full">
          <Header
            icon={<New className="w-8 h-8" />}
            subtitle="Create your account to start your application."
          >
            Hacker Registration
          </Header>
        </div>
        <RegistrationForm />
      </div>
    </div>
  );
}
