export function SmcBlueBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-[#004C98] w-full min-h-screen">
      <div className="z-20 relative">{children}</div>{" "}
    </div>
  );
}
