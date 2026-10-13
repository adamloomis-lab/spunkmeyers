/**
 * Spunks Stack — falling blocks, old-school style, for the pub.
 *
 * Same rendering trick as Pub Crawl: everything is drawn in low-resolution
 * logical pixels on an offscreen buffer and scaled up with nearest-neighbour
 * sampling, so the blocks stay crisp on any phone or the bar TV.
 *
 * Rules: 10 x 20 well, seven pieces dealt from a shuffled 7-bag, gravity
 * speeds up every 10 lines, NES-style scoring (40 / 100 / 300 / 1200 times
 * level + 1), +1 per cell soft-dropped, +2 per cell hard-dropped.
 */
import { drawText, textWidth } from "./pixelart";

export type StackState = "idle" | "playing" | "paused" | "dead";

export interface StackScore {
  score: number;
  lines: number;
  level: number;
  hi: number;
}

export interface StackResult extends StackScore {
  /** Seconds the game lasted. */
  time: number;
  newBest: boolean;
}

export interface StackEvents {
  onState: (s: StackState) => void;
  onScore: (s: StackScore) => void;
  onGameOver: (r: StackResult) => void;
  onToast: (msg: string) => void;
}

export interface StackOptions {
  /** TV attract mode: the game plays itself, restarts after it tops out, never saves a high score. */
  attract?: boolean;
}

export const COLS = 10;
export const ROWS = 20;
const HIDDEN = 2; // spawn rows above the visible well
export const CELL = 8; // logical px
const HI_KEY = "ss-hi";
const LOCK_DELAY = 1.1; // a landed piece can still slide for this long
const SOFT_LOCK_DELAY = 0.35; // ...a bit less while you're pushing down on it
const MAX_LOCK_RESETS = 20;
const CLEAR_FLASH = 0.32;
const DAS = 0.12; // hold left/right: delay before auto-repeat...
const ARR = 0.04; // ...and the repeat rate
const SOFT_DROP = 0.06; // seconds per row while soft dropping

/**
 * Seconds per row of gravity, by level (frame counts / 60). Gentler than the
 * NES curve: this is a bar game played with a thumb and a beer, not a
 * tournament. Level 0 is about 1.3 seconds per row and it ramps slowly.
 */
const GRAVITY = [78, 64, 54, 46, 40, 35, 30, 26, 22, 18, 15, 13, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2].map((f) => f / 60);
const LINE_POINTS = [0, 40, 100, 300, 1200];

const LEVEL_TOASTS: Record<number, string> = {
  1: "LEVEL 1 · HAPPY HOUR'S OVER",
  2: "LEVEL 2 · PEYTON'S WATCHING",
  3: "LEVEL 3 · KEVIN'S IMPRESSED",
  5: "LEVEL 5 · THE BAND STOPPED TO WATCH",
  7: "LEVEL 7 · DAWGS GOTTA EAT",
  10: "LEVEL 10 · LAST CALL",
  15: "LEVEL 15 · LEGEND OF HIGH STREET",
};

const store = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

/* ---------------- Pieces ---------------- */

type Cell = [number, number];
interface PieceDef {
  name: string;
  color: number; // 1-based index into BLOCKS
  rots: Cell[][]; // 4 rotation states, cells in a 4x4 box
}

const PIECES: PieceDef[] = [
  { name: "I", color: 1, rots: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]], [[1, 0], [1, 1], [1, 2], [1, 3]]] },
  { name: "O", color: 2, rots: [[[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]]] },
  { name: "T", color: 3, rots: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]]] },
  { name: "S", color: 4, rots: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]] },
  { name: "Z", color: 5, rots: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]] },
  { name: "J", color: 6, rots: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]] },
  { name: "L", color: 7, rots: [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]] },
];

/** Wall and floor kicks to try, in order, when a rotation doesn't fit. */
const KICKS: Cell[] = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [-2, 0], [2, 0], [0, -2], [-2, -1], [2, -1]];

/** Block colours: base, light edge, dark edge. Pub palette: pints, wings, the Spunks orange T. */
export const BLOCKS: Array<[string, string, string]> = [
  ["#000000", "#000000", "#000000"],
  ["#2ec4d6", "#8ae9f2", "#137f8c"], // I cyan
  ["#f2c530", "#fbe58a", "#a8831a"], // O yellow
  ["#e8601c", "#f5a06e", "#9b3b0c"], // T Spunks orange
  ["#3fbf3a", "#8de886", "#237a20"], // S green
  ["#d8342a", "#f08a82", "#8a1d16"], // Z red
  ["#2f5fbf", "#86a6ea", "#1c3a7a"], // J blue
  ["#f0a830", "#f8cf84", "#9c6a14"], // L amber
  ["#8a8a8a", "#c4c4c4", "#4a4a4a"], // 8: frame bricks / dead grey
];

/** Draw one bevelled block at logical (x, y). Exported so previews can match the game. */
export function drawBlock(c: CanvasRenderingContext2D, x: number, y: number, color: number, size = CELL) {
  const [base, light, dark] = BLOCKS[color];
  c.fillStyle = base;
  c.fillRect(x, y, size, size);
  c.fillStyle = light;
  c.fillRect(x, y, size, 1);
  c.fillRect(x, y, 1, size);
  c.fillStyle = dark;
  c.fillRect(x, y + size - 1, size, 1);
  c.fillRect(x + size - 1, y, 1, size);
  c.fillStyle = "rgba(255,255,255,0.35)";
  c.fillRect(x + 1, y + 1, 1, 1);
}

interface Active {
  def: PieceDef;
  rot: number;
  x: number;
  y: number; // row in the full (hidden + visible) grid, top of the 4x4 box
}

/* ---------------- Sound (synthesized, no files) ---------------- */

class Sfx {
  private ctx: AudioContext | null = null;
  enabled = false;

  unlock() {
    if (!this.enabled) return;
    try {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return;
      if (!this.ctx) this.ctx = new C();
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {
      /* no audio */
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  move() {
    this.tone(440, 0.03, "square", 0.04);
  }
  rotate() {
    this.tone(660, 0.05, "square", 0.05, 880);
  }
  lock() {
    this.tone(180, 0.08, "triangle", 0.09, 120);
  }
  clear(n: number) {
    const notes = n >= 4 ? [523, 659, 784, 1046, 1318] : [523, 659, 784].slice(0, n + 1);
    notes.forEach((f, i) => this.tone(f, 0.12, "square", 0.07, undefined, i * 0.07));
  }
  level() {
    [784, 988, 1175].forEach((f, i) => this.tone(f, 0.1, "square", 0.06, undefined, i * 0.09));
  }
  over() {
    this.tone(330, 0.5, "sawtooth", 0.1, 60);
  }
  start() {
    this.tone(660, 0.08, "square", 0.06);
    this.tone(990, 0.1, "square", 0.06, undefined, 0.08);
  }
}

/* ---------------- The game ---------------- */

export class SpunksStack {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private buf: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private events: StackEvents;
  private sfx = new Sfx();

  // Logical dimensions + layout
  private W = 160;
  private H = 200;
  private scale = 3;
  private ox = 0; // well left (inside the frame), logical px
  private oy = 0; // well top
  private cssW = 1;
  private cssH = 1;
  private dpr = 1;

  state: StackState = "idle";
  private grid: number[] = []; // (ROWS + HIDDEN) * COLS, 0 = empty
  private active: Active | null = null;
  private bag: PieceDef[] = [];
  private next: PieceDef | null = null;
  private score = 0;
  private lines = 0;
  private level = 0;
  private hi = 0;
  private runTime = 0;
  private elapsed = 0;
  private gravT = 0;
  private lockT = 0;
  private lockResets = 0;
  private grounded = false;
  private softDrop = false;
  private clearing: number[] = []; // rows being flashed
  private clearT = 0;
  private flashUntil = 0;
  private restartAt = 0;

  // Input
  private keys = { left: false, right: false };
  private dasDir = 0;
  private dasT = 0;
  private gesture: { id: number; x0: number; y0: number; col0: number; t0: number; moved: boolean; soft: boolean } | null = null;
  private dragTarget: number | null = null; // column the finger wants the piece in
  private dragT = 0;

  private raf = 0;
  private lastT = 0;
  private resizeObs: ResizeObserver | null = null;
  private destroyed = false;
  private attract = false;
  private demo = false; // the AI plays behind the title screen
  private aiPlan: { rot: number; x: number } | null = null;
  private aiT = 0;

  constructor(canvas: HTMLCanvasElement, events: StackEvents, opts: StackOptions = {}) {
    this.attract = !!opts.attract;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.buf = document.createElement("canvas");
    this.bctx = this.buf.getContext("2d")!;
    this.events = events;
    this.hi = this.attract ? 0 : Number(store.get(HI_KEY)) || 0;
    this.resetGame();
  }

  /* ---------- lifecycle ---------- */

  attach() {
    this.resize();
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(this.canvas);
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    if (this.attract) {
      this.start();
      return;
    }
    // The AI plays a dimmed demo behind the title until the player taps.
    this.demo = true;
    this.spawn();
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("touchmove", this.preventTouch, { passive: false });
    this.canvas.addEventListener("contextmenu", this.preventTouch);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("blur", this.onVisibility);
    this.emitScore();
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs?.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("touchmove", this.preventTouch);
    this.canvas.removeEventListener("contextmenu", this.preventTouch);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("blur", this.onVisibility);
  }

  setSound(on: boolean) {
    this.sfx.enabled = on;
    if (on) this.sfx.unlock();
  }

  get highScore() {
    return this.hi;
  }

  /** Begin a game from the title or game-over screen. */
  start() {
    if (this.state === "playing") return;
    this.demo = false;
    this.resetGame();
    this.spawn();
    this.setState("playing");
    this.sfx.unlock();
    this.sfx.start();
  }

  pause() {
    if (this.state === "playing") this.setState("paused");
  }

  resume() {
    if (this.state === "paused") {
      this.setState("playing");
      this.lastT = performance.now();
    }
  }

  /* ---------- public controls (on-screen buttons + keys) ---------- */

  moveLeft() {
    if (this.state !== "playing" || this.clearing.length) return;
    if (this.tryMove(-1, 0)) this.sfx.move();
  }
  moveRight() {
    if (this.state !== "playing" || this.clearing.length) return;
    if (this.tryMove(1, 0)) this.sfx.move();
  }
  rotate(dir: 1 | -1 = 1) {
    if (this.state !== "playing" || this.clearing.length || !this.active) return;
    const a = this.active;
    const rot = (a.rot + dir + 4) % 4;
    for (const [kx, ky] of KICKS) {
      if (this.fits(a.def, rot, a.x + kx, a.y + ky)) {
        a.rot = rot;
        a.x += kx;
        a.y += ky;
        this.onMoved();
        this.sfx.rotate();
        return;
      }
    }
  }
  setSoftDrop(on: boolean) {
    this.softDrop = on;
  }
  /** Hold a direction (on-screen button): moves once now, then auto-repeats until released. */
  holdMove(dir: -1 | 1, on: boolean) {
    if (on) {
      this.dasDir = dir;
      this.dasT = 0;
      if (dir < 0) this.moveLeft();
      else this.moveRight();
    } else if (this.dasDir === dir) {
      this.dasDir = 0;
    }
  }
  hardDrop() {
    if (this.state !== "playing" || this.clearing.length || !this.active) return;
    let n = 0;
    while (this.tryMove(0, 1, false)) n++;
    this.score += n * 2;
    this.lock();
  }

  /* ---------- sizing ---------- */

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(3, window.devicePixelRatio || 1);
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(1, rect.height);
    const devW = Math.max(1, Math.floor(this.cssW * this.dpr));
    const devH = Math.max(1, Math.floor(this.cssH * this.dpr));
    this.canvas.width = devW;
    this.canvas.height = devH;
    // Content: frame (8) + well (80) + frame (8) + gap (6) + side panel (58) = 160 wide,
    // frame + 20 rows + frame = 176 tall. Leave headroom for the page's HUD.
    this.scale = Math.max(1, Math.floor(Math.min(devW / 166, devH / (this.attract ? 184 : 232))));
    this.W = Math.ceil(devW / this.scale);
    this.H = Math.ceil(devH / this.scale);
    this.buf.width = this.W;
    this.buf.height = this.H;
    this.ox = Math.floor((this.W - 160) / 2) + CELL;
    this.oy = Math.floor((this.H - 176) / 2) + CELL + (this.attract ? 0 : 10);
    this.ctx.imageSmoothingEnabled = false;
    this.bctx.imageSmoothingEnabled = false;
    this.draw();
  }

  /** Width of one well cell in CSS pixels (for swipe distances). */
  private cellCss() {
    return (CELL * this.scale) / this.dpr;
  }

  /* ---------- input ---------- */

  private preventTouch = (e: Event) => e.preventDefault();

  private onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    this.sfx.unlock();
    if (this.state === "idle") {
      this.start();
      return;
    }
    if (this.state === "paused") {
      this.resume();
      return;
    }
    if (this.state !== "playing") return;
    this.gesture = { id: e.pointerId, x0: e.offsetX, y0: e.offsetY, col0: this.active?.x ?? 3, t0: performance.now(), moved: false, soft: false };
    this.dragTarget = null;
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const g = this.gesture;
    if (!g || g.id !== e.pointerId || this.state !== "playing") return;
    const cell = this.cellCss();
    const dx = e.offsetX - g.x0;
    const dy = e.offsetY - g.y0;
    // The piece follows the finger sideways: wherever you drag, that's the
    // column it heads for (stepping one cell at a time so it can't tunnel).
    if (Math.abs(dx) > cell * 0.45) {
      this.dragTarget = g.col0 + Math.round(dx / cell);
      g.moved = true;
    }
    // Pull down past a couple of cells to soft drop; ease off to stop.
    if (dy > cell * 2) {
      g.soft = true;
      g.moved = true;
      this.softDrop = true;
    } else if (g.soft && dy < cell) {
      this.softDrop = false;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    const g = this.gesture;
    if (!g || g.id !== e.pointerId) return;
    this.gesture = null;
    // Leave dragTarget alone: a quick flick sideways keeps the piece
    // travelling to where the finger pointed even after it lifts.
    const dt = performance.now() - g.t0;
    const dy = e.offsetY - g.y0;
    const dx = e.offsetX - g.x0;
    const cell = this.cellCss();
    this.softDrop = false;
    // A quick flick straight down is a hard drop.
    if (dt < 250 && dy > cell * 3 && dy > Math.abs(dx) * 1.5) {
      this.hardDrop();
      return;
    }
    if (!g.moved && dt < 300 && this.state === "playing") this.rotate(1);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "BUTTON")) return;
    if (e.repeat) {
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(e.code)) e.preventDefault();
      return;
    }
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        e.preventDefault();
        this.keys.left = true;
        this.dasDir = -1;
        this.dasT = 0;
        this.moveLeft();
        break;
      case "ArrowRight":
      case "KeyD":
        e.preventDefault();
        this.keys.right = true;
        this.dasDir = 1;
        this.dasT = 0;
        this.moveRight();
        break;
      case "ArrowUp":
      case "KeyX":
      case "KeyW":
        e.preventDefault();
        this.sfx.unlock();
        if (this.state === "idle") this.start();
        else if (this.state === "paused") this.resume();
        else this.rotate(1);
        break;
      case "KeyZ":
        e.preventDefault();
        this.rotate(-1);
        break;
      case "ArrowDown":
      case "KeyS":
        e.preventDefault();
        this.softDrop = true;
        break;
      case "Space":
      case "Enter":
        e.preventDefault();
        this.sfx.unlock();
        if (this.state === "idle") this.start();
        else if (this.state === "paused") this.resume();
        else this.hardDrop();
        break;
      case "KeyP":
      case "Escape":
        if (this.state === "playing") this.pause();
        else if (this.state === "paused") this.resume();
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      this.keys.left = false;
      if (this.dasDir === -1) this.dasDir = this.keys.right ? 1 : 0;
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
      this.keys.right = false;
      if (this.dasDir === 1) this.dasDir = this.keys.left ? -1 : 0;
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      this.softDrop = false;
    }
  };

  private onVisibility = () => {
    if ((document.hidden || !document.hasFocus()) && this.state === "playing") {
      this.pause();
      this.softDrop = false;
      this.keys.left = this.keys.right = false;
      this.dasDir = 0;
      this.gesture = null;
    }
  };

  /* ---------- state ---------- */

  private setState(s: StackState) {
    this.state = s;
    this.events.onState(s);
  }

  private emitScore() {
    this.events.onScore({ score: this.score, lines: this.lines, level: this.level, hi: Math.max(this.hi, this.score) });
  }

  private resetGame() {
    this.grid = new Array((ROWS + HIDDEN) * COLS).fill(0);
    this.active = null;
    this.bag = [];
    this.next = null;
    this.score = 0;
    this.lines = 0;
    this.level = 0;
    this.runTime = 0;
    this.gravT = 0;
    this.lockT = 0;
    this.lockResets = 0;
    this.grounded = false;
    this.softDrop = false;
    this.clearing = [];
    this.clearT = 0;
    this.flashUntil = 0;
    this.aiPlan = null;
    this.gesture = null;
    this.dragTarget = null;
    this.dasDir = 0;
    if (import.meta.env.DEV) {
      // Local preview only: /stack?level=9 starts at that level.
      const lv = Number(new URLSearchParams(location.search).get("level")) || 0;
      if (lv > 0) {
        this.level = lv;
        this.lines = lv * 10;
      }
    }
  }

  private draw7(): PieceDef {
    if (this.bag.length === 0) this.bag = [...PIECES].sort(() => Math.random() - 0.5);
    return this.bag.pop()!;
  }

  private spawn() {
    const def = this.next ?? this.draw7();
    this.next = this.draw7();
    const a: Active = { def, rot: 0, x: 3, y: 0 };
    this.active = a;
    this.dragTarget = null;
    this.gravT = 0;
    this.lockT = 0;
    this.lockResets = 0;
    this.grounded = false;
    this.aiPlan = null;
    if (!this.fits(def, 0, a.x, a.y)) {
      // Nudge up once; if it still doesn't fit, the well is full.
      a.y = -1;
      if (!this.fits(def, 0, a.x, a.y)) {
        this.active = null;
        if (this.demo) {
          this.resetGame();
          this.spawn();
          return;
        }
        this.gameOver();
      }
    }
  }

  private gameOver() {
    this.setState("dead");
    this.sfx.over();
    try {
      navigator.vibrate?.(80);
    } catch {
      /* ignore */
    }
    const newBest = this.score > this.hi;
    if (newBest) {
      this.hi = this.score;
      if (!this.attract) store.set(HI_KEY, String(this.hi));
    }
    if (this.attract) this.restartAt = this.elapsed + 2.5;
    this.emitScore();
    this.events.onGameOver({
      score: this.score,
      lines: this.lines,
      level: this.level,
      hi: this.hi,
      time: Math.round(this.runTime * 10) / 10,
      newBest,
    });
  }

  /* ---------- grid helpers ---------- */

  private cellAt(x: number, y: number): number {
    if (x < 0 || x >= COLS || y >= ROWS + HIDDEN) return 8;
    if (y < 0) return 0;
    return this.grid[y * COLS + x];
  }

  private fits(def: PieceDef, rot: number, px: number, py: number): boolean {
    for (const [cx, cy] of def.rots[rot]) {
      if (this.cellAt(px + cx, py + cy) !== 0) return false;
    }
    return true;
  }

  private tryMove(dx: number, dy: number, countsAsMove = true): boolean {
    const a = this.active;
    if (!a) return false;
    if (!this.fits(a.def, a.rot, a.x + dx, a.y + dy)) return false;
    a.x += dx;
    a.y += dy;
    if (countsAsMove && dx !== 0) this.onMoved();
    return true;
  }

  /** A successful move or rotation while grounded buys a little more lock time. */
  private onMoved() {
    if (this.grounded && this.lockResets < MAX_LOCK_RESETS) {
      this.lockT = 0;
      this.lockResets++;
    }
  }

  private lock() {
    const a = this.active;
    if (!a) return;
    for (const [cx, cy] of a.def.rots[a.rot]) {
      const x = a.x + cx;
      const y = a.y + cy;
      if (y >= 0 && y < ROWS + HIDDEN) this.grid[y * COLS + x] = a.def.color;
    }
    this.active = null;
    this.sfx.lock();
    // Full rows?
    const full: number[] = [];
    for (let y = 0; y < ROWS + HIDDEN; y++) {
      let ok = true;
      for (let x = 0; x < COLS; x++) {
        if (this.grid[y * COLS + x] === 0) {
          ok = false;
          break;
        }
      }
      if (ok) full.push(y);
    }
    if (full.length) {
      this.clearing = full;
      this.clearT = 0;
      this.sfx.clear(full.length);
      if (full.length === 4) this.events.onToast("FOUR LINES!");
      return;
    }
    this.emitScore();
    this.spawn();
  }

  private finishClear() {
    const rows = this.clearing;
    this.clearing = [];
    // Collapse: rebuild the grid without the cleared rows.
    const kept: number[][] = [];
    for (let y = 0; y < ROWS + HIDDEN; y++) {
      if (rows.includes(y)) continue;
      kept.push(this.grid.slice(y * COLS, y * COLS + COLS));
    }
    while (kept.length < ROWS + HIDDEN) kept.unshift(new Array(COLS).fill(0));
    this.grid = kept.flat();
    const n = rows.length;
    this.score += LINE_POINTS[n] * (this.level + 1);
    this.lines += n;
    const newLevel = Math.floor(this.lines / 10);
    if (newLevel > this.level) {
      this.level = newLevel;
      this.flashUntil = this.elapsed + 0.9;
      this.sfx.level();
      const toast = LEVEL_TOASTS[newLevel];
      this.events.onToast(toast ?? `LEVEL ${newLevel}`);
    }
    this.emitScore();
    this.spawn();
  }

  /* ---------- simulation ---------- */

  private loop = (t: number) => {
    if (this.destroyed) return;
    const dt = Math.min(0.05, (t - this.lastT) / 1000);
    this.lastT = t;
    this.elapsed += dt;
    if (this.state === "playing") this.update(dt);
    else if (this.state === "idle" && this.demo) this.update(dt, true);
    else if (this.state === "dead" && this.attract && this.elapsed > this.restartAt) this.start();
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number, demo = false) {
    if (!demo) this.runTime += dt;

    if (this.clearing.length) {
      this.clearT += dt;
      if (this.clearT >= CLEAR_FLASH) this.finishClear();
      return;
    }
    if (!this.active) return;

    if (this.attract || demo) this.autoPilot(dt);
    else {
      if (this.dasDir !== 0) {
        // Held left/right: delayed auto shift like the old consoles.
        this.dasT += dt;
        if (this.dasT >= DAS) {
          this.dasT -= ARR;
          if (this.dasDir < 0) this.moveLeft();
          else this.moveRight();
        }
      }
      if (this.dragTarget !== null) {
        // Finger drag: step toward the wanted column, quickly but one cell at a time.
        this.dragT += dt;
        if (this.dragT >= 0.03) {
          this.dragT = 0;
          const a = this.active;
          const before = a.x;
          if (a.x < this.dragTarget) this.moveRight();
          else if (a.x > this.dragTarget) this.moveLeft();
          // Arrived, or blocked by a wall or the stack: stop chasing.
          if (a.x === this.dragTarget || a.x === before) this.dragTarget = null;
        }
      }
    }

    const level = Math.min(this.level, GRAVITY.length - 1);
    let g = GRAVITY[level];
    if (this.softDrop) g = Math.min(g, SOFT_DROP);
    this.gravT += dt;
    while (this.gravT >= g) {
      this.gravT -= g;
      if (this.tryMove(0, 1, false)) {
        if (this.softDrop) this.score += 1;
        this.grounded = false;
      } else {
        this.grounded = true;
        break;
      }
    }
    if (this.grounded || !this.fits(this.active.def, this.active.rot, this.active.x, this.active.y + 1)) {
      this.grounded = true;
      this.lockT += dt;
      if (this.lockT >= (this.softDrop ? SOFT_LOCK_DELAY : LOCK_DELAY)) this.lock();
    }
  }

  /* ---------- the AI (TV demo + title screen) ---------- */

  private autoPilot(dt: number) {
    const a = this.active;
    if (!a) return;
    if (!this.aiPlan) this.aiPlan = this.planBest(a.def);
    this.aiT += dt;
    if (this.aiT < 0.09) return;
    this.aiT = 0;
    const plan = this.aiPlan;
    if (a.rot !== plan.rot) {
      this.rotate(1);
      return;
    }
    if (a.x < plan.x) {
      this.tryMove(1, 0);
      return;
    }
    if (a.x > plan.x) {
      this.tryMove(-1, 0);
      return;
    }
    this.softDrop = true;
  }

  /** Classic placement heuristic: low stack, few holes, flat surface, cleared lines. */
  private planBest(def: PieceDef): { rot: number; x: number } {
    let best = { rot: 0, x: 3, score: -Infinity };
    for (let rot = 0; rot < 4; rot++) {
      for (let x = -2; x < COLS; x++) {
        if (!this.fits(def, rot, x, 0) && !this.fits(def, rot, x, -1)) continue;
        let y = this.fits(def, rot, x, 0) ? 0 : -1;
        while (this.fits(def, rot, x, y + 1)) y++;
        const g = this.grid.slice();
        for (const [cx, cy] of def.rots[rot]) {
          const yy = y + cy;
          if (yy >= 0) g[yy * COLS + x + cx] = 1;
        }
        let cleared = 0;
        for (let yy = 0; yy < ROWS + HIDDEN; yy++) {
          let full = true;
          for (let xx = 0; xx < COLS; xx++) if (g[yy * COLS + xx] === 0) full = false;
          if (full) cleared++;
        }
        const heights: number[] = [];
        let holes = 0;
        for (let xx = 0; xx < COLS; xx++) {
          let h = 0;
          let seen = false;
          for (let yy = 0; yy < ROWS + HIDDEN; yy++) {
            if (g[yy * COLS + xx]) {
              if (!seen) {
                seen = true;
                h = ROWS + HIDDEN - yy;
              }
            } else if (seen) holes++;
          }
          heights.push(h);
        }
        const agg = heights.reduce((s, h) => s + h, 0);
        let bump = 0;
        for (let i = 1; i < COLS; i++) bump += Math.abs(heights[i] - heights[i - 1]);
        const s = -0.51 * agg + 0.76 * cleared - 0.36 * holes - 0.18 * bump + (Math.random() - 0.5) * 0.05;
        if (s > best.score) best = { rot, x, score: s };
      }
    }
    return { rot: best.rot, x: best.x };
  }

  /* ---------- drawing ---------- */

  private draw() {
    const c = this.bctx;
    const { W, H, ox, oy } = this;
    c.fillStyle = "#000";
    c.fillRect(0, 0, W, H);

    // Frame of grey bricks around the well, like the old Java applet.
    for (let y = -1; y <= ROWS; y++) {
      drawBlock(c, ox - CELL, oy + y * CELL, 8);
      drawBlock(c, ox + COLS * CELL, oy + y * CELL, 8);
    }
    for (let x = 0; x < COLS; x++) drawBlock(c, ox + x * CELL, oy + ROWS * CELL, 8);

    // Well contents
    const dim = this.state === "idle" && this.demo;
    for (let y = 0; y < ROWS; y++) {
      const gy = y + HIDDEN;
      const flashing = this.clearing.includes(gy) && Math.floor(this.clearT * 16) % 2 === 0;
      for (let x = 0; x < COLS; x++) {
        const v = this.grid[gy * COLS + x];
        if (!v) continue;
        if (flashing) {
          c.fillStyle = "#fcfcfc";
          c.fillRect(ox + x * CELL, oy + y * CELL, CELL, CELL);
        } else drawBlock(c, ox + x * CELL, oy + y * CELL, this.state === "dead" ? 8 : v);
      }
    }

    // Ghost + active piece
    const a = this.active;
    if (a && this.state !== "dead") {
      if (!this.attract && !dim) {
        let gy = a.y;
        while (this.fits(a.def, a.rot, a.x, gy + 1)) gy++;
        c.fillStyle = "rgba(255,255,255,0.18)";
        for (const [cx, cy] of a.def.rots[a.rot]) {
          const row = gy + cy - HIDDEN;
          if (row < 0) continue;
          c.fillRect(ox + (a.x + cx) * CELL + 1, oy + row * CELL + 1, CELL - 2, CELL - 2);
        }
      }
      for (const [cx, cy] of a.def.rots[a.rot]) {
        const row = a.y + cy - HIDDEN;
        if (row < 0) continue;
        drawBlock(c, ox + (a.x + cx) * CELL, oy + row * CELL, a.def.color);
      }
    }

    // Side panel
    const px = ox + COLS * CELL + CELL + 6;
    const gold = "#e0b23c";
    let ty = oy + 2;
    const line = (label: string, value: string) => {
      drawText(c, label, px, ty, gold);
      drawText(c, value, px, ty + 7, "#fcfcfc");
      ty += 18;
    };
    line("SCORE", String(this.score));
    line("LINES", String(this.lines));
    line("LEVEL", String(this.level));
    if (!this.attract) line("HI", String(Math.max(this.hi, this.score)));
    ty += 4;
    drawText(c, "NEXT", px, ty, gold);
    if (this.next && this.state !== "dead") {
      const r = this.next.rots[0];
      const minX = Math.min(...r.map(([x]) => x));
      const minY = Math.min(...r.map(([, y]) => y));
      for (const [cx, cy] of r) drawBlock(c, px + (cx - minX) * CELL, ty + 9 + (cy - minY) * CELL, this.next.color);
    }
    if (this.attract) {
      ty += 36;
      drawText(c, "SPUNKS", px, ty, "#e8601c");
      drawText(c, "STACK", px, ty + 7, "#e8601c");
    }

    // Dim the well behind the title
    if (dim) {
      c.fillStyle = "rgba(0,0,0,0.6)";
      c.fillRect(0, 0, W, H);
    }

    // Level-up flash along the top
    if (this.elapsed < this.flashUntil && Math.floor(this.elapsed * 8) % 2 === 0) {
      c.fillStyle = "rgba(232,96,28,0.22)";
      c.fillRect(0, 0, W, Math.max(10, Math.round(H * 0.05)));
    }

    // Blit
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.buf, 0, 0, W * this.scale, H * this.scale);
  }
}

/** Width of the pixel font, re-exported for the page. */
export { textWidth };
