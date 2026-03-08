// ─── Individual Modal Components ──────────────────────────────────────────────

import { Frame, Modal } from "@react95/core";
import { Computer3, Explorer103, FileFind2, Notepad } from "@react95/icons";

export function SMCCampusModal({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 250, ...style }}>
      <Modal
        title="SMC — Bundy Campus"
        icon={<FileFind2 variant="16x16_4" />}
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
                  height: 200,
                  objectFit: "cover",
                }}
              />
            </Frame>
          </Frame>
        </Modal.Content>
      </Modal>
    </div>
  );
}

export function BundyCampusMapsModal({
  style,
}: {
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: "absolute", width: 360, ...style }}>
      <Modal
        title="Bundy Campus — Maps"
        icon={<Explorer103 variant="16x16_4" />}
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
        <Modal.Content
          boxShadow="$in"
          bgColor="$material"
          style={{ padding: 0 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.1220991739583!2d-118.445574!3d34.0150767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bafe7f7c6edd%3A0x1506078475f24855!2sSanta%20Monica%20College%20Bundy%20Campus!5e1!3m2!1sen!2sus!4v1772952693827!5m2!1sen!2sus"
            width="100%"
            height="240"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Modal.Content>
      </Modal>
    </div>
  );
}

export function ReadmeModal({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 255, ...style }}>
      <Modal
        title="readme.txt — Notepad"
        icon={<Notepad variant="16x16_4" />}
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
      </Modal>
    </div>
  );
}

export function MyComputerModal({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 295, ...style }}>
      <Modal
        title="My Computer"
        icon={<Computer3 variant="16x16_4" />}
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
      </Modal>
    </div>
  );
}
