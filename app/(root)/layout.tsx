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
      <main className="z-20 relative w-full h-screen min-h-screen">
        {children}
      </main>
    </>
  );
}
