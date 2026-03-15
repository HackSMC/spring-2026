import { Header } from "@/components/header";
import { HackerApplicationForm } from "./components/hacker-apply-form";
import { Awfxcg321303 } from "@react95/icons";

export default async function Apply() {
  return (
    <div className="place-content-center grid py-16 w-full">
      <div className="grid grid-cols-1 grid-rows-[auto,1fr]">
        <div className="w-full">
          <Header
            icon={<Awfxcg321303 />}
            subtitle="Submit your hacker application"
          >
            Hacker Application
          </Header>
        </div>
        <HackerApplicationForm />
      </div>
    </div>
  );
}
