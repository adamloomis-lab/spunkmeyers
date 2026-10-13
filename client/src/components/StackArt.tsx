import { useEffect, useRef } from "react";
import { drawBlock, CELL } from "@/game/stack";

/**
 * A little Spunks Stack still life: a few locked rows and a falling T,
 * drawn with the game's own block renderer so it matches exactly.
 */
const ART: number[][] = [
  [0, 0, 0, 3, 0, 0, 0, 0],
  [0, 0, 3, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0],
  [4, 4, 0, 0, 0, 5, 1, 0],
  [4, 4, 0, 6, 0, 5, 1, 2],
  [7, 7, 7, 6, 6, 5, 1, 2],
];

export default function StackArt({ scale = 4, className = "" }: { scale?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const w = ART[0].length * CELL;
    const h = ART.length * CELL;
    c.width = w;
    c.height = h;
    c.style.width = `${w * scale}px`;
    c.style.height = `${h * scale}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ART.forEach((row, y) => row.forEach((v, x) => v && drawBlock(ctx, x * CELL, y * CELL, v)));
  }, [scale]);
  return <canvas ref={ref} aria-hidden="true" className={className} style={{ imageRendering: "pixelated" }} />;
}
