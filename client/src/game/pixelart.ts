/**
 * Tiny pixel-art toolkit for Spunks Dash. Sprites are written as rows of
 * palette characters so they can live in source control and be tweaked by
 * hand. Everything is rasterized once into offscreen canvases.
 */

export const PALETTE: Record<string, string> = {
  K: "#111111", // black
  W: "#fcfcfc", // white
  G: "#c4c4c4", // light grey
  g: "#6e6e6e", // dark grey
  B: "#7b4a24", // brown (hat, boots, football)
  D: "#45270f", // dark brown
  L: "#9a6436", // light brown
  N: "#a5764b", // tan
  A: "#e3c57e", // wheat
  a: "#b8975a", // wheat shade
  R: "#cc0000", // red
  r: "#7f0000", // dark red
  X: "#e8601c", // Spunks orange
  x: "#b3400b", // Spunks orange dark
  n: "#e0a85a", // burger bun
  m: "#5a2d12", // smash patty
  q: "#f2c530", // cheese
  l: "#5fbf4a", // lettuce
  h: "#f0a830", // beer amber
  i: "#c47d14", // beer amber dark
  O: "#e0b23c", // gold
  o: "#a67f1f", // gold dark
  Y: "#f7e36a", // yellow
  P: "#e8762a", // pumpkin
  p: "#a84f12", // pumpkin dark
  E: "#3f8f3a", // green
  e: "#245c22", // dark green
  S: "#d9b98a", // straw
  s: "#b08c52", // straw dark
  U: "#2f5fbf", // blue
  u: "#1c3a7a", // dark blue
  T: "#f0c9a6", // skin
  t: "#c99b74", // skin shade
  C: "#8ad0f0", // glass / sky blue
  w: "#d9b98a", // wood light
  d: "#8a6236", // wood dark
  M: "#2b2b2b", // charcoal
};

export interface Sprite {
  w: number;
  h: number;
  canvas: HTMLCanvasElement;
}

/** Rasterize rows of palette characters. Rows may differ in length. */
export function makeSprite(rows: string[], overrides?: Record<string, string>): Sprite {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || ch === " ") continue;
      const color = (overrides && overrides[ch]) || PALETTE[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return { w, h, canvas: c };
}

/** Flip a sprite horizontally (for things facing the other way). */
export function flipSprite(s: Sprite): Sprite {
  const c = document.createElement("canvas");
  c.width = s.w;
  c.height = s.h;
  const ctx = c.getContext("2d")!;
  ctx.translate(s.w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(s.canvas, 0, 0);
  return { w: s.w, h: s.h, canvas: c };
}

/* ---------- 3x5 pixel font (uppercase, digits, a little punctuation) ---------- */

const GLYPHS: Record<string, string[]> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: ["###", "#.#", "#.#", "#.#", "###"],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  Q: ["###", "#.#", "#.#", "###", "..#"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  W: ["#.#", "#.#", "###", "###", "#.#"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["##.", "..#", ".#.", "#..", "###"],
  "3": ["###", "..#", ".##", "..#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "##.", "..#", "##."],
  "6": [".##", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "##."],
  " ": ["...", "...", "...", "...", "..."],
  "-": ["...", "...", "###", "...", "..."],
  "!": [".#.", ".#.", ".#.", "...", ".#."],
  "?": ["##.", "..#", ".#.", "...", ".#."],
  ".": ["...", "...", "...", "...", ".#."],
  ":": ["...", ".#.", "...", ".#.", "..."],
  "'": [".#.", ".#.", "...", "...", "..."],
  "+": ["...", ".#.", "###", ".#.", "..."],
  "$": [".#.", "###", "#..", "###", "..#", "###", ".#."],
};

/** Width in pixels of a string drawn with drawText. */
export function textWidth(text: string): number {
  return text.length * 4 - 1;
}

/** Draw uppercase pixel text at (x, y). Unknown characters render as spaces. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale = 1,
): void {
  ctx.fillStyle = color;
  let cx = x;
  for (const raw of text.toUpperCase()) {
    const g = GLYPHS[raw] || GLYPHS[" "];
    for (let gy = 0; gy < g.length; gy++) {
      const row = g[gy];
      for (let gx = 0; gx < row.length; gx++) {
        if (row[gx] === "#") ctx.fillRect(cx + gx * scale, y + gy * scale, scale, scale);
      }
    }
    cx += 4 * scale;
  }
}
