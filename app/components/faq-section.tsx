import { useState } from "react";
import { Modal, Frame } from "@react95/core";
import {
  FileFind2,
  Explorer103,
  Notepad,
  Computer3,
  QuestionBubble,
} from "@react95/icons";

const faqs = [
  {
    q: "What is HackSMC?",
    a: "HackSMC is a hackathon open to community college students. Build projects, meet mentors, win prizes, and enjoy free food & swag — all in one day.",
  },
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
        className="flex items-center gap-2 bg-[#c0c0c0] hover:bg-[#d4d0c8] px-4 py-3 border-2 border-t-white active:border-t-[#808080] border-r-[#808080] active:border-r-white border-b-[#808080] active:border-b-white border-l-white active:border-l-[#808080] w-full text-left cursor-default"
        style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
      >
        <span className="w-3 font-bold text-[#000080] text-base shrink-0">
          {open ? "▼" : "►"}
        </span>
        <span className="font-bold text-black text-base">{q}</span>
      </button>
      {open && (
        <div
          className="bg-white px-6 py-4 border border-[#808080] border-t-0 text-black text-sm leading-relaxed"
          style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

function PinnedModal({
  title,
  icon,
  children,
  width,
  style,
}: {
  title: string;
  icon: React.ReactElement;
  children: React.ReactNode;
  width: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ width, ...style }}>
      <Modal
        title={title}
        icon={icon}
        titleBarOptions={[]}
        dragOptions={{ defaultPosition: { x: 0, y: 0 } }}
        style={{
          position: "relative",
          top: "unset",
          left: "unset",
          width: "100%",
          inset: "unset",
        }}
      >
        {children}
      </Modal>
    </div>
  );
}

export function FaqSection() {
  return (
    <div
      id="faq"
      className="w-full"
      style={{
        backgroundColor: "#008080",
      }}
    >
      <div className="mx-auto px-6 py-16 max-w-7xl">
        <div className="flex items-start gap-10">
          {/* LEFT COLUMN */}
          <div
            className="hidden lg:flex flex-col shrink-0"
            style={{ width: 320, gap: 48 }}
          >
            {/* SMC — tall, starts high */}
            <PinnedModal
              title="SMC — Bundy Campus"
              icon={<FileFind2 variant="16x16_4" />}
              width={320}
            >
              <Modal.Content
                boxShadow="$in"
                bgColor="$material"
                style={{ padding: 0 }}
              >
                <Frame bgColor="$material" boxShadow="$out">
                  <Frame boxShadow="$in">
                    <img
                      src="/smc.jpg"
                      alt="Santa Monica College"
                      style={{
                        filter: "saturate(0.75) contrast(1.1) brightness(1.25)",
                        imageRendering: "pixelated",
                        display: "block",
                        width: "100%",
                        height: 260,
                        objectFit: "cover",
                      }}
                    />
                  </Frame>
                </Frame>
              </Modal.Content>
            </PinnedModal>

            {/* Maps — shorter, narrower, pushed in from left */}
            <PinnedModal
              title="Bundy Campus — Maps"
              icon={<Explorer103 variant="16x16_4" />}
              width={400}
              style={{ marginLeft: -48, marginTop: 0 }}
            >
              <Modal.Content
                boxShadow="$in"
                bgColor="$material"
                style={{ padding: 0 }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.1220991739583!2d-118.445574!3d34.0150767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bafe7f7c6edd%3A0x1506078475f24855!2sSanta%20Monica%20College%20Bundy%20Campus!5e1!3m2!1sen!2sus!4v1772952693827!5m2!1sen!2sus"
                  width="100%"
                  height="250"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Modal.Content>
            </PinnedModal>
          </div>

          {/* CENTER — FAQ */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <QuestionBubble />
              <div>
                <h2
                  className="drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)] font-bold text-white"
                  style={{
                    fontFamily: "MS Sans Serif, Arial, sans-serif",
                    fontSize: 28,
                  }}
                >
                  FAQ
                </h2>
                <p
                  className="text-[#c0f0f0]"
                  style={{
                    fontFamily: "MS Sans Serif, Arial, sans-serif",
                    fontSize: 14,
                  }}
                >
                  Frequently Asked Questions
                </p>
              </div>
            </div>

            <Frame
              boxShadow="$in"
              bgColor="$material"
              className="overflow-hidden"
            >
              {faqs.map((faq, i) => (
                <div key={i}>
                  <Accordion q={faq.q} a={faq.a} />
                  {i < faqs.length - 1 && <Divider />}
                </div>
              ))}
            </Frame>
          </div>

          {/* RIGHT COLUMN */}
          <div
            className="hidden lg:flex flex-col shrink-0"
            style={{ width: 320, gap: 32 }}
          >
            {/* Readme — narrower, dropped significantly */}
            <PinnedModal
              title="readme.txt — Notepad"
              icon={<Notepad variant="16x16_4" />}
              width={255}
              style={{ marginTop: 72, marginLeft: 24 }}
            >
              <Modal.Content boxShadow="$in" bgColor="white">
                <div className="p-3 font-mono text-black text-xs leading-relaxed">
                  <p>{">"} HACKSMC 2025</p>
                  <br />
                  <p>{"🎓"} Open to: Community College Students</p>
                  <br />
                  <p>{">"} Free food &amp; swag</p>
                  <p>{">"} Mentors on-site</p>
                  <p>{">"} Prizes up for grabs</p>
                  <br />
                  <p>Register now to secure your spot!</p>
                  <br />
                  <p>
                    {"📍 "}
                    <a
                      href="https://share.google/LlUEc3U0xgrRaVXmr"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "monospace",
                        color: "#000080",
                        fontSize: 12,
                        textDecoration: "underline",
                      }}
                    >
                      Bundy Campus, SMC
                    </a>
                  </p>
                  <p>_</p>
                </div>
              </Modal.Content>
            </PinnedModal>

            {/* My Computer — widest on the right, low down */}
            <PinnedModal
              title="My Computer"
              icon={<Computer3 variant="16x16_4" />}
              width={295}
              style={{ marginTop: 16 }}
            >
              <Modal.Content boxShadow="$in" bgColor="$material">
                <div
                  className="flex flex-col items-center gap-2 p-4"
                  style={{ fontFamily: "MS Sans Serif, Arial, sans-serif" }}
                >
                  <Computer3 variant="32x32_4" />
                  <p className="font-bold text-black text-sm text-center">
                    HackSMC 2025 PC
                  </p>
                  <div className="my-1 border-t border-t-[#808080] border-b border-b-white w-full" />
                  <div
                    className="w-full text-black text-xs"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto auto",
                      gap: "6px 24px",
                    }}
                  >
                    <span>Processor:</span>
                    <span style={{ textAlign: "right" }}>Big Ideas™</span>
                    <span>RAM:</span>
                    <span style={{ textAlign: "right" }}>Unlimited Coffee</span>
                    <span>OS:</span>
                    <span style={{ textAlign: "right" }}>Windows 95</span>
                    <span>Disk:</span>
                    <span style={{ textAlign: "right" }}>50MB Free</span>
                  </div>
                </div>
              </Modal.Content>
            </PinnedModal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaqSection;
