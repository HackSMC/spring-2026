import { SmcBlueBackground } from "@/components/smc-blue-background";
import { Metadata } from "next";
import { SolidDitheredOverlay } from "../(landing-page)/components/dithered-overlay";

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
    <html lang="en">
      <body className="antialiased">
        <SolidDitheredOverlay />
        <SmcBlueBackground>{children}</SmcBlueBackground>
      </body>
    </html>
  );
}
