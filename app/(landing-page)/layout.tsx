import type { Metadata, Viewport } from "next";
import { NavBar } from "@/components/navbar";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "HackSMC 2026",
  description:
    "A two-days hackathon for and by community college students at SMC Bundy Campus. Build and innovate on May 9-10.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HackSMC 2026",
  },
};
export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
