"use client";

import { useAuthUser } from "@/features/auth/hooks/get-auth-user";
import { createClient } from "@/features/auth/lib/client";
import { Button } from "@react95/core";
import { useRouter } from "next/navigation";

export function NavBar() {
  const { data: claims, isLoading } = useAuthUser();
  const router = useRouter();
  const supabase = createClient();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="top-4 right-4 z-[100] fixed flex gap-2">
      <Button onClick={() => scrollTo("about")}>About</Button>
      <Button onClick={() => scrollTo("faq")}>FAQ</Button>
      {!isLoading && (
        <>
          <Button onClick={() => router.push(claims ? "/apply" : "/sign-up")}>
            {claims ? "Apply" : "Register"}
          </Button>
          {claims && <Button onClick={signOut}>Sign Out</Button>}
        </>
      )}
    </nav>
  );
}
