"use client";

import { useAuthUser } from "@/features/auth/hooks/get-auth-user";
import { createClient } from "@/features/auth/lib/client";
import { Button } from "@react95/core";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function NavBar() {
  const { data: claims, isLoading } = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await queryClient.invalidateQueries({ queryKey: ["auth", "claims"] });
    router.push("/");
  };

  return (
    <nav className="top-4 right-4 z-[100] fixed flex gap-2">
      <Button onClick={() => scrollTo("about")}>About</Button>
      <Button onClick={() => scrollTo("faq")}>FAQ</Button>
      <Button onClick={() => router.push("apply")}>Apply</Button>
      {!isLoading && (
        <>{claims && <Button onClick={signOut}>Sign Out</Button>}</>
      )}
    </nav>
  );
}
