export function Header({
  icon,
  children,
  subtitle,
}: {
  icon: React.ReactNode;
  children: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <div>
        <h2
          className="drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)] font-bold text-white"
          style={{
            fontFamily: "MS Sans Serif, Arial, sans-serif",
            fontSize: 28,
          }}
        >
          {children}
        </h2>
        <p
          className="text-[#c0f0f0]"
          style={{
            fontFamily: "MS Sans Serif, Arial, sans-serif",
            fontSize: 14,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
