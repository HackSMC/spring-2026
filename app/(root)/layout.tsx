import { Metadata } from "next";
import { SolidDitheredOverlay } from "../../components/dithered-overlay";
import { TealBackground } from "@/components/teal-background";

export const metadata: Metadata = {
  title: "HackSMC",
  description: "...",
};

export default function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TealBackground />
      <SolidDitheredOverlay />
      <div className="z-20 w-full h-full min-h-screen">{children}</div>
    </>
  );
}
