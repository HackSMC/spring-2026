import type { Metadata } from "next";
import "./globals.css";

import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";

export const metadata: Metadata = {
  title: "HackSMC",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
