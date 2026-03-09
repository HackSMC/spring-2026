import type { Metadata } from "next";

import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import "@react95/icons/icons.css";
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
