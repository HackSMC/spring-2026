export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 4, fontSize: 11 }}>{label}</div>
      {children}
    </div>
  );
}
