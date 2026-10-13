import { useEffect, useRef } from "react";
import type { Sprite } from "@/game/pixelart";
import { buildKevin, buildObstacles, type HeroSprites, type ObstacleSprites } from "@/game/sprites";

export type PixelArtName = keyof HeroSprites | keyof ObstacleSprites;

/** Any Spunks Pub Crawl sprite, rendered crisp at an integer scale. */
export default function PixelArt({ name, scale = 4, className = "" }: { name: PixelArtName; scale?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const sheet: Record<PixelArtName, Sprite> = { ...buildKevin(), ...buildObstacles() };
    const sprite = sheet[name];
    c.width = sprite.w;
    c.height = sprite.h;
    c.style.width = `${sprite.w * scale}px`;
    c.style.height = `${sprite.h * scale}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(sprite.canvas, 0, 0);
  }, [name, scale]);
  return <canvas ref={ref} aria-hidden="true" className={className} style={{ imageRendering: "pixelated" }} />;
}
