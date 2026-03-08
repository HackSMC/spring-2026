const svgTile = `<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'>
  <rect x='0' y='0' width='1' height='1' fill='%23001830'/>
  <rect x='2' y='2' width='1' height='1' fill='%23001830'/>
</svg>`;

const bgImage = `url("data:image/svg+xml,${encodeURIComponent(svgTile)}")`;

export function DitheredOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
        backgroundImage: bgImage,
        backgroundRepeat: "repeat",
        backgroundSize: "4px 4px",
        maskImage:
          "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.6) 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.6) 100%)",
      }}
    />
  );
}
