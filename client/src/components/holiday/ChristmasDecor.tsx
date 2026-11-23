import type { CSSProperties } from "react";

export function ChristmasLights({ className = "" }: { className?: string }) {
  return (
    <div className={`christmas-lights ${className}`} aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <i key={i} style={{ "--bulb-index": i } as CSSProperties} />
      ))}
    </div>
  );
}

export function ChristmasGarland({ className = "" }: { className?: string }) {
  return (
    <div className={`christmas-garland ${className}`} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span className="garland-swag" key={i}>
          <b />
          <i />
          <em />
        </span>
      ))}
    </div>
  );
}

export function ChristmasSnow() {
  return (
    <div className="christmas-snow" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--snow-left": `${(i * 47 + 3) % 100}%`,
              "--snow-size": `${(i % 3) + 2}px`,
              "--snow-duration": `${14 + (i % 7) * 2}s`,
              "--snow-delay": `${-i * 1.7}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function ChristmasOrnaments() {
  return (
    <div className="christmas-ornaments" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}
