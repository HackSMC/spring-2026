"use client";

import { Button } from "@react95/core";

export function NavBar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="top-4 right-4 z-[100] fixed flex gap-2">
      <Button onClick={() => scrollTo("about")}>About</Button>
      <Button onClick={() => scrollTo("faq")}>FAQ</Button>
    </nav>
  );
}
