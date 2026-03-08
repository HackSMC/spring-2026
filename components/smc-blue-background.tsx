import { SolidDitheredOverlay } from "@/app/components/dithered-overlay";

export function SmcBlueBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-[#004C98] w-full min-h-screen">
      <SolidDitheredOverlay />
      <div className="z-20 relative">{children}</div>{" "}
      {/* children above overlay */}
    </div>
  );
}
