"use client";

import { Notepad, QuestionBubble } from "@react95/icons";

export function NavBar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="top-0 right-0 z-[100] fixed flex gap-1 m-4">
      <button
        onClick={() => scrollTo("about")}
        className="flex flex-col items-center gap-1 bg-transparent px-3 py-2 border-none w-[72px] cursor-pointer select-none"
      >
        <Notepad variant="32x32_4" />
        <span
          className="px-[2px] text-[11px] text-white whitespace-nowrap"
          style={{ textShadow: "1px 1px 1px black" }}
        >
          About
        </span>
      </button>

      <button
        onClick={() => scrollTo("faq")}
        className="flex flex-col items-center gap-1 bg-transparent px-3 py-2 border-none w-[72px] cursor-pointer select-none"
      >
        <QuestionBubble />
        <span
          className="px-[2px] text-[11px] text-white whitespace-nowrap"
          style={{ textShadow: "1px 1px 1px black" }}
        >
          FAQ
        </span>
      </button>
    </nav>
  );
}
