import { useState } from "react";
import { Frame } from "@react95/core";
import { QuestionBubble } from "@react95/icons";
import { Header } from "../../../components/header";
import { BundyCampusMapsModal } from "./modals";

const faqs = [
  {
    q: "Who can participate?",
    a: "Any currently enrolled community college student is welcome to join. You can come solo or with a team of up to 4 people.",
  },
  {
    q: "Do I need experience to join?",
    a: "Not at all! HackSMC welcomes beginners. Mentors will be on-site throughout the event to help you get started and unstuck.",
  },
  {
    q: "Where is it held?",
    a: "The event is at the Bundy Campus of Santa Monica College. Check the Maps window for exact directions.",
  },
  {
    q: "Is there a registration fee?",
    a: "Nope — it's completely free. Food, swag, and workshops are all included at no cost.",
  },
  {
    q: "What should I bring?",
    a: "Bring your laptop, charger, student ID, and your best ideas. Everything else will be provided.",
  },
];

function Divider() {
  return (
    <div className="border-t border-t-[#808080] border-b border-b-white" />
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#c0c0c0] hover:bg-[#d4d0c8] px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-t-white active:border-t-[#808080] border-r-[#808080] active:border-r-white border-b-[#808080] active:border-b-white border-l-white active:border-l-[#808080] w-full text-left cursor-default"
        style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
      >
        <span className="w-3 font-bold text-[#000080] text-sm sm:text-base shrink-0">
          {open ? "▼" : "►"}
        </span>
        <span className="font-bold text-black text-sm sm:text-base leading-snug">
          {q}
        </span>
      </button>
      {open && (
        <div
          className="bg-white px-4 sm:px-6 py-3 sm:py-4 border border-[#808080] border-t-0 text-black text-xs sm:text-sm leading-relaxed"
          style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────────

export function FaqSection() {
  return (
    <div id="faq" className="z-10 relative w-full">
      {/* Modal only shown on sm+ screens */}
      <div className="hidden xl:block">
        <BundyCampusMapsModal style={{ top: 10, left: "2vw" }} />
      </div>

      {/* Center FAQ — padded so it never overlaps the absolute modals */}
      <div className="mx-auto px-4 sm:px-6 py-12 sm:py-24 w-full max-w-xl min-h-auto sm:min-h-160">
        <Header icon={<QuestionBubble />} subtitle="Frequently Asked Questions">
          FAQ
        </Header>
        <Frame
          boxShadow="$in"
          bgColor="$material"
          className="w-full overflow-hidden"
        >
          {faqs.map((faq, i) => (
            <div key={i}>
              <Accordion q={faq.q} a={faq.a} />
              {i < faqs.length - 1 && <Divider />}
            </div>
          ))}
        </Frame>
      </div>
    </div>
  );
}

export default FaqSection;
