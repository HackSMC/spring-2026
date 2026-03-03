"use client";

import { Button, Frame } from "@react95/core";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "FAQ", href: "#faq" },
  { label: "Register", href: "#register", primary: true },
];

export function NavBar() {
  return (
    <nav className="top-0 right-0 z-[100] fixed flex m-4">
      <Frame bgColor="$material" boxShadow="$out" padding="$2">
        {LINKS.map((link) => (
          <Button
            key={link.label}
            onClick={() => (window.location.href = link.href)}
          >
            <div className="text-lg">{link.label}</div>
          </Button>
        ))}
      </Frame>
    </nav>
  );
}
