import { Header } from "@/components/header";
import { Mail } from "@react95/icons";
import { AuthErrorModal } from "./components/auth-error-modal";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason ?? "unknown";
  return (
    <div className="place-content-center grid py-16 w-full h-full">
      <div className="grid grid-cols-1 grid-rows-[auto,1fr]">
        <div className="w-full">
          <Header
            icon={<Mail className="w-8 h-8" />}
            subtitle="Something went wrong with your confirmation link."
          >
            Auth Error
          </Header>
        </div>
        <AuthErrorModal reason={reason} />
      </div>
    </div>
  );
}
