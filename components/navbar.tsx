"use client";

import {
  Notepad,
  Winfile3,
  Mmsys113,
  QuestionBubble,
  Write1,
} from "@react95/icons";

export function NavBar() {
  return (
    <nav className="top-0 right-0 z-[100] fixed flex gap-1 m-4">
      <a
        href="#about"
        className="group flex flex-col items-center gap-1 px-3 py-2 w-[72px] cursor-pointer select-none"
      >
        <Notepad variant="32x32_4" />
        <span
          style={{
            fontSize: "11px",
            whiteSpace: "nowrap",
            color: "white",
            textShadow: "1px 1px 1px black",
            padding: "0 2px",
          }}
        >
          About
        </span>
      </a>

      <a
        href="#faq"
        className="group flex flex-col items-center gap-1 px-3 py-2 w-[72px] cursor-pointer select-none"
      >
        <QuestionBubble />
        <span
          style={{
            fontSize: "11px",
            whiteSpace: "nowrap",
            color: "white",
            textShadow: "1px 1px 1px black",
            padding: "0 2px",
          }}
        >
          FAQ
        </span>
      </a>
    </nav>
  );
}
