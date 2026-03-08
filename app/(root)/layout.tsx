import { SmcBlueBackground } from "@/components/smc-blue-background";
import { Metadata } from "next";

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
      <body className="antialiased">
        <SmcBlueBackground>{children}</SmcBlueBackground>
      </body>
    </html>
  );
}
