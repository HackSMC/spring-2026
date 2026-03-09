import type { Metadata } from "next";
import { NavBar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "HackSMC",
  description: "...",
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
