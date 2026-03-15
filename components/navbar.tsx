"use client";

import { useAuthUser } from "@/features/auth/hooks/get-auth-user";
import { createClient } from "@/features/auth/lib/client";
import { Button, List, Modal } from "@react95/core";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function NavBar() {
  const { data: claims, isLoading } = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await queryClient.invalidateQueries({ queryKey: ["auth", "claims"] });
    router.push("/");
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="hidden top-4 right-4 z-[100] fixed md:flex gap-2">
        <Button onClick={() => scrollTo("about")}>About</Button>
        <Button onClick={() => scrollTo("faq")}>FAQ</Button>
        <Button onClick={() => router.push("apply")}>Apply</Button>
        {!isLoading && claims && <Button onClick={signOut}>Sign Out</Button>}
      </nav>

      <div className="md:hidden top-4 right-4 z-[100] fixed">
        <Button onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </Button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden z-[99] fixed"
          style={{ top: "4rem", right: "1rem" }}
        >
          <List style={{ width: 120 }}>
            <List.Item onClick={() => scrollTo("about")}>About</List.Item>
            <List.Divider />
            <List.Item onClick={() => scrollTo("faq")}>FAQ</List.Item>
            <List.Divider />
            <List.Item
              onClick={() => {
                router.push("apply");
                setMenuOpen(false);
              }}
            >
              Apply
            </List.Item>
            {!isLoading && claims && (
              <>
                <List.Divider />
                <List.Item onClick={signOut}>Sign Out</List.Item>
              </>
            )}
          </List>
        </div>
      )}
    </>
  );
}
