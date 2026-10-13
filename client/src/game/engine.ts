/**
 * Spunks Pub Crawl — an endless runner in the spirit of the Chrome dino game.
 * Kevin runs down High Street past the pub, the Match Factory, and the Blue
 * Tip, jumping the band, the crew, and everything the kitchen sends out.
 *
 * The world is simulated and drawn in low-resolution "logical" pixels on an
 * offscreen buffer, then scaled up with nearest-neighbour sampling so the
 * pixel art stays crisp on any phone. All speeds are logical px / second.
 *
 * Input: tap the RIGHT half of the screen (or Space / Up) to jump, hold the
 * LEFT half (or Down) to slide. Holding the jump makes it a little higher;
 * sliding mid-air drops Kevin fast.
 *
 * Same rules and point structure as Moose Dash at the lodge: +100 for every
 * person you clear, +500 for an SPX pint, +1000 for catching the football.
 */
import { drawText, textWidth, type Sprite } from "./pixelart";
import {
  buildKevin,
  buildObstacles,
  buildScenery,
  type HeroSprites,
  type ObstacleSprites,
  type ScenerySprites,
} from "./sprites";

export type CrawlState = "idle" | "playing" | "paused" | "dead";

export interface GameOverResult {
  score: number;
  /** Seconds the run lasted. */
  time: number;
  hi: number;
  newBest: boolean;
  /** What Kevin hit, for the game-over one-liner. */
  cause: string;
}

export interface CrawlEvents {
  onState: (s: CrawlState) => void;
  onScore: (score: number, hi: number) => void;
  onGameOver: (r: GameOverResult) => void;
  onToast: (msg: string) => void;
}

export interface CrawlOptions {
  /**
   * Attract mode for the bar TV: Kevin plays himself, restarts after a
   * crash, never saves a high score, and the canvas is sized as a short wide
   * strip rather than a phone screen.
   */
  attract?: boolean;
}

export const PERSON_BONUS = 100;
export const FOOTBALL_BONUS = 1000;
export const PINT_BONUS = 500;

/** Everything left of this fraction of the screen width is the slide pad; the rest is jump. */
export const SPLIT_X = 0.5;

const START_SPEED = 90;
const MAX_SPEED = 300;
const ACCEL = 2.1; // px/s gained per second
const GRAVITY = 1150;
const JUMP_V = 368;
const SHORT_JUMP_GRAVITY = 2.4; // multiplier while the jump is released early
const FAST_FALL_GRAVITY = 3.2; // multiplier while sliding in the air
const SCORE_PER_PX = 1 / 12;
const NIGHT_EVERY = 700;
const HI_KEY = "spc-hi";

const ORANGE = "#e8601c";
const ORANGE_INK = "#c84f12";

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

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
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

  jump() {
    this.tone(520, 0.12, "square", 0.08, 880);
  }
  blip() {
    this.tone(1046, 0.07, "square", 0.07);
    setTimeout(() => this.tone(1318, 0.09, "square", 0.07), 70);
  }
  crash() {
    this.tone(220, 0.35, "sawtooth", 0.12, 40);
  }
  start() {
    this.tone(660, 0.08, "square", 0.06);
    setTimeout(() => this.tone(990, 0.1, "square", 0.06), 80);
  }
}

/* ---------------- World objects ---------------- */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type ObKind =
  | "stool"
  | "burger"
  | "wings"
  | "beer"
  | "keg"
  | "pumpkin"
  | "peyton"
  | "mick"
  | "luke"
  | "dj"
  | "brian"
  | "singer"
  | "guitar"
  | "drums"
  | "bass"
  | "keys"
  | "goose"
  | "football";

interface ObDef {
  kind: ObKind;
  minScore: number;
  weight: number;
  /** People are dealt from a shuffled bag so nobody shows up twice in a row. */
  person?: boolean;
  /** Name shown above characters (and used in the crash line). */
  label?: string;
  cause: string;
  /** Inset of the collision box from the sprite edges. */
  inset: { l: number; t: number; r: number; b: number };
}

const OB_DEFS: ObDef[] = [
  { kind: "stool", minScore: 0, weight: 3, cause: "a bar stool", inset: { l: 1, t: 1, r: 1, b: 0 } },
  { kind: "burger", minScore: 0, weight: 2.5, cause: "a smash burger", inset: { l: 1, t: 1, r: 1, b: 0 } },
  { kind: "beer", minScore: 0, weight: 2, cause: "a beer", inset: { l: 1, t: 1, r: 3, b: 0 } },
  { kind: "pumpkin", minScore: 0, weight: 2, cause: "a pumpkin", inset: { l: 1, t: 2, r: 1, b: 0 } },
  { kind: "wings", minScore: 100, weight: 2.5, cause: "a basket of wings", inset: { l: 1, t: 2, r: 1, b: 0 } },
  { kind: "keg", minScore: 150, weight: 3, cause: "the keg", inset: { l: 2, t: 2, r: 2, b: 0 } },
  { kind: "peyton", minScore: 40, weight: 2, person: true, label: "PEYTON", cause: "Peyton", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "mick", minScore: 60, weight: 2, person: true, label: "MICK", cause: "Mick", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "luke", minScore: 90, weight: 2, person: true, label: "LUKE", cause: "Luke", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "dj", minScore: 110, weight: 2, person: true, label: "DJ", cause: "DJ", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "brian", minScore: 120, weight: 2, person: true, label: "DJ BRIAN", cause: "DJ Brian", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "singer", minScore: 160, weight: 2, person: true, label: "ARENE", cause: "Arene", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "guitar", minScore: 200, weight: 2, person: true, label: "CHRIS", cause: "Chris", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "drums", minScore: 240, weight: 2, label: "KEVIN'S KIT", cause: "your own drum kit", inset: { l: 3, t: 1, r: 3, b: 0 } },
  { kind: "bass", minScore: 280, weight: 2, person: true, label: "BASS", cause: "the bass player", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "keys", minScore: 320, weight: 2, person: true, label: "BOB", cause: "Bob", inset: { l: 2, t: 1, r: 2, b: 0 } },
  { kind: "goose", minScore: 420, weight: 2.2, cause: "a goose", inset: { l: 3, t: 5, r: 3, b: 5 } },
  { kind: "football", minScore: 300, weight: 2.4, cause: "a football", inset: { l: 1, t: 1, r: 1, b: 1 } },
];

interface Obstacle {
  def: ObDef;
  x: number;
  y: number; // top, logical px
  w: number;
  h: number;
  sprites: Sprite[];
  frameRate: number; // frames per second, 0 = static
  /** Stool groups draw the same sprite several times. */
  count: number;
  cleared: boolean;
  /** Horizontal speed relative to the ground (1 = scrolls with the world). */
  vx: number;
  /** The football spirals in high, then dives at Kevin. */
  swoop?: { startY: number; diveY: number; diveX: number; span: number };
}

interface Scenery {
  sprite: Sprite | null;
  kind: "cloud" | "tree" | "bush" | "pub" | "factory" | "downtown" | "match" | "banner" | "bike" | "pontoon";
  x: number;
  y: number;
  w: number;
  factor: number; // parallax speed multiplier
}

/** Wadsworth landmarks that drift by in the background, in rotation. */
const LANDMARKS: Array<{ kind: Scenery["kind"]; w: number; h: number }> = [
  { kind: "pub", w: 74, h: 36 },
  { kind: "factory", w: 118, h: 50 },
  { kind: "downtown", w: 84, h: 36 },
  { kind: "match", w: 14, h: 46 },
];

interface Pebble {
  x: number;
  y: number;
  w: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

/** Floating "+100" style text. */
interface Pop {
  x: number;
  y: number;
  text: string;
  t: number;
  color: string;
}

/** A pint of SPX Lager drifting through the air. Grab it for a bonus. */
interface Pint {
  x: number;
  baseY: number;
  phase: number;
}

const PINT_W = 10;
const PINT_H = 14;

const MILESTONE_TOASTS: Record<number, string> = {
  500: "KEVIN'S STILL RUNNING",
  1000: "SOUNDCHECK'S OVER",
  1500: "PEYTON'S CUTTING YOU OFF",
  2000: "YOU'VE RUN TO AKRON BY NOW",
  3000: "DAWGS GOTTA EAT",
  5000: "LEGEND OF HIGH STREET",
};

function isPumpkinSeason(): boolean {
  const m = new Date().getMonth(); // 0-based
  return m === 8 || m === 9 || m === 10;
}

/* ---------------- The game ---------------- */

export class PubCrawl {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private buf: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private events: CrawlEvents;

  private kevin: HeroSprites;
  private obs: ObstacleSprites;
  private scenery: ScenerySprites;
  private sfx = new Sfx();

  // Logical dimensions
  private W = 200;
  private H = 300;
  private scale = 3;
  private groundY = 180;
  private cssW = 1;
  private cssH = 1;

  state: CrawlState = "idle";
  private speed = START_SPEED;
  private dist = 0;
  private score = 0;
  private hi = 0;
  private runTime = 0;
  private lastMilestone = 0;
  private flashUntil = 0;
  private nightT = 0; // 0 day, 1 night
  private elapsed = 0;

  // Kevin physics
  private mx = 30;
  private my = 0; // feet height above ground (positive = up)
  private vy = 0;
  private ducking = false;
  private jumpHeld = false;
  private runFrame = 0;
  private frameT = 0;
  private hitSprite: Sprite | null = null;

  private obstacles: Obstacle[] = [];
  private nextSpawn = 0; // distance remaining until next spawn
  private clearedThisRun = new Set<string>();
  private lastKinds: ObKind[] = [];
  private personBag: ObDef[] = [];
  private bonus = 0;
  private pops: Pop[] = [];
  private pints: Pint[] = [];
  private nextPint = 0;
  private nextBanner = 0;
  private nextBike = 0;
  private nextPontoon = 0;
  private scene: Scenery[] = [];
  private pebbles: Pebble[] = [];
  private particles: Particle[] = [];
  private nextCloud = 0;
  private nextScenery = 0;
  private nextLandmark = 1200;
  private landmarkIdx = 0;

  private raf = 0;
  private lastT = 0;
  private pointers = new Map<number, "jump" | "duck">();
  private keyDuck = false;
  private resizeObs: ResizeObserver | null = null;
  private destroyed = false;
  private attract = false;
  private restartAt = 0;

  constructor(canvas: HTMLCanvasElement, events: CrawlEvents, opts: CrawlOptions = {}) {
    this.attract = !!opts.attract;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.buf = document.createElement("canvas");
    this.bctx = this.buf.getContext("2d")!;
    this.events = events;
    this.kevin = buildKevin();
    this.obs = buildObstacles();
    this.scenery = buildScenery();
    this.hi = this.attract ? 0 : Number(store.get(HI_KEY)) || 0;
  }

  /* ---------- lifecycle ---------- */

  attach() {
    this.resize();
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(this.canvas);
    if (this.attract) {
      this.seedScene();
      this.lastT = performance.now();
      this.raf = requestAnimationFrame(this.loop);
      this.start();
      return;
    }
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("pointerleave", this.onPointerUp);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("touchmove", this.preventTouch, { passive: false });
    this.canvas.addEventListener("contextmenu", this.preventTouch);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("blur", this.onVisibility);
    this.seedScene();
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
    this.events.onScore(0, this.hi);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs?.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("pointerleave", this.onPointerUp);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
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

  /** Begin a run from the title or game-over screen. */
  start() {
    if (this.state === "playing") return;
    this.resetRun();
    this.setState("playing");
    this.sfx.unlock();
    this.sfx.start();
  }

  /* ---------- sizing ---------- */

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(1, rect.height);
    const devW = Math.max(1, Math.floor(this.cssW * dpr));
    const devH = Math.max(1, Math.floor(this.cssH * dpr));
    this.canvas.width = devW;
    this.canvas.height = devH;
    // The TV strip needs about 100 logical rows so a full jump (59 px plus
    // the 26 px Kevin) stays inside the frame.
    this.scale = this.attract
      ? Math.max(2, Math.floor(devH / 100))
      : Math.max(2, Math.floor(Math.min(devW, devH) / 200));
    this.W = Math.ceil(devW / this.scale);
    this.H = Math.ceil(devH / this.scale);
    this.buf.width = this.W;
    this.buf.height = this.H;
    const portrait = this.H > this.W;
    this.groundY = Math.round(this.H * (this.attract ? 0.82 : portrait ? 0.6 : 0.74));
    this.mx = Math.round(this.W * 0.14);
    this.ctx.imageSmoothingEnabled = false;
    this.bctx.imageSmoothingEnabled = false;
    // Re-seed ground detail for the new width.
    this.pebbles = [];
    for (let x = 0; x < this.W + 40; x += 6 + Math.random() * 14) this.pebbles.push(this.makePebble(x));
    this.draw();
  }

  /* ---------- input ---------- */

  private preventTouch = (e: Event) => e.preventDefault();

  private onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    this.sfx.unlock();
    const duckZone = e.offsetX < this.cssW * SPLIT_X;
    if (this.state === "idle") {
      this.start();
      this.pressJump(e.pointerId);
      return;
    }
    if (this.state === "paused") {
      this.setState("playing");
      return;
    }
    if (this.state !== "playing") return;
    this.tapPint(e.offsetX, e.offsetY);
    if (duckZone) {
      this.pointers.set(e.pointerId, "duck");
      this.ducking = true;
    } else {
      this.pressJump(e.pointerId);
    }
  };

  /** A tap right on (or near) a floating pint grabs it. */
  private tapPint(cssX: number, cssY: number) {
    const lx = (cssX / this.cssW) * this.W;
    const ly = (cssY / this.cssH) * this.H;
    for (const q of this.pints) {
      const qy = this.pintY(q);
      if (lx > q.x - 14 && lx < q.x + PINT_W + 14 && ly > qy - 14 && ly < qy + PINT_H + 14) {
        this.collectPint(q);
        return;
      }
    }
  }

  private pintY(q: Pint): number {
    return q.baseY + Math.round(Math.sin(this.elapsed * 3 + q.phase) * 4);
  }

  private collectPint(q: Pint) {
    this.pints = this.pints.filter((x) => x !== q);
    this.addBonus(PINT_BONUS, `SPX +${PINT_BONUS}`, q.x, this.pintY(q), ORANGE);
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: q.x + 5,
        y: this.pintY(q) + 7,
        vx: (Math.random() - 0.5) * 120,
        vy: -30 - Math.random() * 80,
        life: 0.4 + Math.random() * 0.4,
        color: Math.random() < 0.5 ? "#f0a830" : "#fcfcfc",
      });
    }
  }

  private addBonus(n: number, text: string, x: number, y: number, color = "#e0b23c") {
    this.bonus += n;
    this.pops.push({ x, y, text, t: 0, color });
    this.sfx.blip();
  }

  private onPointerMove = (e: PointerEvent) => {
    // Sliding a jump finger over to the slide side mid-air drops Kevin
    // fast, like the dino's down arrow.
    if (this.state !== "playing") return;
    const role = this.pointers.get(e.pointerId);
    if (role === "jump" && e.offsetX < this.cssW * SPLIT_X) {
      this.pointers.set(e.pointerId, "duck");
      this.jumpHeld = this.hasPointer("jump");
      this.ducking = true;
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    const role = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (role === "jump") this.jumpHeld = this.hasPointer("jump");
    if (role === "duck") this.ducking = this.hasPointer("duck") || this.keyDuck;
  };

  private hasPointer(role: "jump" | "duck") {
    return Array.from(this.pointers.values()).some((r) => r === role);
  }

  private pressJump(pointerId: number) {
    this.pointers.set(pointerId, "jump");
    this.jumpHeld = true;
    this.jump();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "BUTTON")) return;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      e.preventDefault();
      this.sfx.unlock();
      if (this.state === "idle") this.start();
      else if (this.state === "paused") {
        this.setState("playing");
        return;
      }
      if (this.state === "playing") {
        this.jumpHeld = true;
        this.jump();
      }
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      e.preventDefault();
      this.keyDuck = true;
      if (this.state === "playing") this.ducking = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      this.jumpHeld = this.hasPointer("jump");
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      this.keyDuck = false;
      this.ducking = this.hasPointer("duck");
    }
  };

  private onVisibility = () => {
    if ((document.hidden || !document.hasFocus()) && this.state === "playing") {
      this.setState("paused");
      this.pointers.clear();
      this.ducking = false;
      this.jumpHeld = false;
    }
  };

  private jump() {
    if (this.my > 0) return; // already in the air
    this.vy = JUMP_V;
    this.ducking = this.hasPointer("duck") || this.keyDuck;
    this.sfx.jump();
  }

  /* ---------- state ---------- */

  private setState(s: CrawlState) {
    this.state = s;
    this.events.onState(s);
  }

  private resetRun() {
    this.speed = START_SPEED;
    this.dist = 0;
    this.score = 0;
    this.runTime = 0;
    this.lastMilestone = 0;
    this.flashUntil = 0;
    this.my = 0;
    this.vy = 0;
    this.ducking = false;
    this.jumpHeld = false;
    this.hitSprite = null;
    this.obstacles = [];
    this.particles = [];
    this.pops = [];
    this.pints = [];
    this.bonus = 0;
    this.lastKinds = [];
    this.personBag = [];
    this.nextPint = 300 + Math.random() * 200;
    this.nextBanner = 260;
    // On the TV demo the slide is short and Kevin crashes often, so the
    // pedal bike and the pontoon show up within a few seconds and keep coming back.
    this.nextBike = this.attract ? 60 + Math.random() * 60 : 500 + Math.random() * 400;
    this.nextPontoon = this.attract ? 200 + Math.random() * 100 : 900 + Math.random() * 500;
    this.clearedThisRun.clear();
    this.nextSpawn = this.speed * 2.2;
    this.pointers.clear();
    if (import.meta.env.DEV) {
      // Local preview only: /pub-crawl?from=600 starts the run at score 600.
      const from = Number(new URLSearchParams(location.search).get("from")) || 0;
      if (from > 0) {
        this.dist = from / SCORE_PER_PX;
        this.score = from;
        this.lastMilestone = Math.floor(from / 100);
        this.speed = Math.min(MAX_SPEED, START_SPEED + from * 0.2);
      }
    }
    this.events.onScore(this.score, this.hi);
  }

  private gameOver(cause: string) {
    this.setState("dead");
    this.sfx.crash();
    try {
      navigator.vibrate?.(70);
    } catch {
      /* ignore */
    }
    const newBest = this.score > this.hi;
    if (newBest) {
      this.hi = this.score;
      if (!this.attract) store.set(HI_KEY, String(this.hi));
    }
    if (this.attract) this.restartAt = this.elapsed + 1.8;
    this.events.onScore(this.score, this.hi);
    this.events.onGameOver({
      score: this.score,
      time: Math.round(this.runTime * 10) / 10,
      hi: this.hi,
      newBest,
      cause,
    });
  }

  /* ---------- simulation ---------- */

  private loop = (t: number) => {
    if (this.destroyed) return;
    const dt = Math.min(0.05, (t - this.lastT) / 1000);
    this.lastT = t;
    this.elapsed += dt;
    if (this.state === "playing") this.update(dt);
    else if (this.state === "idle") this.updateIdle(dt);
    else if (this.state === "dead" && this.attract && this.elapsed > this.restartAt) this.start();
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private updateIdle(dt: number) {
    // Gentle scenery drift on the title screen.
    this.advanceScene(dt, 40);
    this.frameT += dt;
  }

  private update(dt: number) {
    this.runTime += dt;
    this.speed = Math.min(MAX_SPEED, this.speed + ACCEL * dt);
    const step = this.speed * dt;
    this.dist += step;
    this.nextSpawn -= step;

    // Score + milestones
    const prev = this.score;
    this.score = Math.floor(this.dist * SCORE_PER_PX) + this.bonus;
    if (this.score !== prev) {
      this.events.onScore(this.score, Math.max(this.hi, this.score));
      const m = Math.floor(this.score / 100);
      if (m > this.lastMilestone && this.score > 0) {
        this.lastMilestone = m;
        this.flashUntil = this.elapsed + 0.9;
        this.sfx.blip();
        const toast = MILESTONE_TOASTS[this.score - (this.score % 100)];
        if (toast) this.events.onToast(toast);
      }
    }

    // Day / night
    const target = Math.floor(this.score / NIGHT_EVERY) % 2;
    this.nightT += (target - this.nightT) * Math.min(1, dt * 1.2);

    if (this.attract) this.autoPilot();

    // Kevin physics
    if (this.my > 0 || this.vy > 0) {
      let g = GRAVITY;
      if (this.ducking) g *= FAST_FALL_GRAVITY;
      else if (!this.jumpHeld && this.vy > 0) g *= SHORT_JUMP_GRAVITY;
      this.vy -= g * dt;
      this.my += this.vy * dt;
      if (this.my <= 0) {
        this.my = 0;
        this.vy = 0;
        this.puff();
      }
    }
    this.frameT += dt;
    const frameLen = Math.max(0.07, 16 / this.speed);
    if (this.frameT > frameLen) {
      this.frameT = 0;
      this.runFrame ^= 1;
    }

    // World
    this.advanceScene(dt, this.speed);
    for (const o of this.obstacles) {
      o.x -= step * o.vx;
      if (o.swoop) {
        // Level flight until the dive starts, a smooth dive that bottoms out
        // right in front of Kevin, then a climb back up and away.
        const { startY, diveY, diveX, span } = o.swoop;
        if (o.x > diveX) {
          const p = Math.min(1, Math.max(0, (diveX + span - o.x) / span));
          const s = p * p * (3 - 2 * p);
          o.y = startY + (diveY - startY) * s;
        } else {
          const climb = Math.min(1, (diveX - o.x) / 70);
          o.y = diveY + (startY - diveY) * climb * climb;
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.w * o.count > -4 && o.y < this.H + 10);
    if (this.nextSpawn <= 0) this.spawn();

    // Collision + "cleared" toasts
    const mb = this.heroBox();
    for (const o of this.obstacles) {
      const box = this.obstacleBox(o);
      if (o.def.kind === "football") {
        // The football can't hurt you. Catch it in the air for the big bonus.
        if (this.my > 0 && this.overlap(mb, box)) {
          this.obstacles = this.obstacles.filter((x) => x !== o);
          this.vy = Math.max(this.vy, 230); // a little hop off the catch
          this.addBonus(FOOTBALL_BONUS, `TOUCHDOWN +${FOOTBALL_BONUS}`, this.mx + 10, box.y - 6);
          this.events.onToast(`CAUGHT THE FOOTBALL! +${FOOTBALL_BONUS}`);
          try {
            navigator.vibrate?.(25);
          } catch {
            /* ignore */
          }
          for (let i = 0; i < 10; i++) {
            this.particles.push({
              x: box.x + box.w / 2,
              y: box.y,
              vx: (Math.random() - 0.5) * 140,
              vy: -20 - Math.random() * 90,
              life: 0.4 + Math.random() * 0.4,
              color: Math.random() < 0.5 ? "#fcfcfc" : "#7b4a24",
            });
          }
          break;
        }
        continue;
      }
      if (this.overlap(mb, box)) {
        this.hitSprite = this.ducking && this.my === 0 ? this.kevin.duck : this.kevin.dead;
        this.burst();
        this.gameOver(o.def.cause);
        return;
      }
      if (!o.cleared && o.x + o.w * o.count < mb.x) {
        o.cleared = true;
        if (o.def.person) {
          this.addBonus(PERSON_BONUS, `${o.def.label} +${PERSON_BONUS}`, this.mx + 10, this.groundY - 34 - Math.round(this.my));
          if (!this.clearedThisRun.has(o.def.kind)) {
            this.clearedThisRun.add(o.def.kind);
            this.events.onToast(`CLEARED ${o.def.label}!`);
          }
        }
      }
    }

    // SPX pints: grab one with Kevin or with a tap.
    for (const q of this.pints) q.x -= step;
    this.pints = this.pints.filter((q) => q.x + PINT_W > -4);
    this.nextPint -= step;
    if (this.nextPint <= 0) {
      this.pints.push({ x: this.W + 6, baseY: this.groundY - 44 - Math.round(Math.random() * 18), phase: Math.random() * 6 });
      this.nextPint = 400 + Math.random() * 400;
    }
    for (const q of this.pints) {
      const qb = { x: q.x, y: this.pintY(q), w: PINT_W, h: PINT_H };
      if (this.overlap(mb, qb)) {
        this.collectPint(q);
        break;
      }
    }
    for (const p of this.pops) {
      p.t += dt;
      p.y -= 18 * dt;
    }
    this.pops = this.pops.filter((p) => p.t < 1.1);

    // Particles
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private advanceScene(dt: number, speed: number) {
    const step = speed * dt;
    for (const s of this.scene) s.x -= step * s.factor;
    this.scene = this.scene.filter((s) => s.x + s.w > 0);
    for (const p of this.pebbles) p.x -= step;
    this.pebbles = this.pebbles.filter((p) => p.x + p.w > 0);
    const lastPebble = this.pebbles.length ? this.pebbles[this.pebbles.length - 1].x : 0;
    if (lastPebble < this.W + 10) this.pebbles.push(this.makePebble(this.W + 10 + Math.random() * 14));

    this.nextCloud -= step * 0.25;
    if (this.nextCloud <= 0) {
      this.scene.push({
        sprite: this.scenery.cloud,
        kind: "cloud",
        x: this.W + 5,
        y: 6 + Math.random() * Math.max(10, this.groundY * 0.45),
        w: this.scenery.cloud.w,
        factor: 0.25,
      });
      this.nextCloud = 40 + Math.random() * 90;
    }
    this.nextScenery -= step * 0.5;
    if (this.nextScenery <= 0) {
      const tree = Math.random() < 0.55;
      const sp = tree ? this.scenery.tree : this.scenery.bush;
      this.scene.push({ sprite: sp, kind: tree ? "tree" : "bush", x: this.W + 5, y: this.groundY - sp.h, w: sp.w, factor: 0.5 });
      this.nextScenery = 50 + Math.random() * 120;
    }
    this.nextBanner -= step * 0.3;
    if (this.nextBanner <= 0) {
      this.scene.push({ sprite: null, kind: "banner", x: this.W + 5, y: 8 + Math.round(Math.random() * Math.max(6, this.groundY * 0.22)), w: 120, factor: 0.3 });
      this.nextBanner = 1100 + Math.random() * 900;
    }
    // The Grizzly pedal bike rolls the same way Kevin runs, just slower,
    // so Kevin overtakes it.
    this.nextBike -= step * 0.35;
    if (this.nextBike <= 0) {
      this.scene.push({ sprite: null, kind: "bike", x: this.W + 5, y: this.groundY - 31, w: 76, factor: 0.35 });
      this.nextBike = this.attract ? 500 + Math.random() * 300 : 1400 + Math.random() * 1200;
    }
    // Kevin's pontoon, on the trailer behind the truck, headed for the lake.
    this.nextPontoon -= step * 0.35;
    if (this.nextPontoon <= 0) {
      this.scene.push({ sprite: null, kind: "pontoon", x: this.W + 5, y: this.groundY - 30, w: 112, factor: 0.35 });
      this.nextPontoon = this.attract ? 600 + Math.random() * 300 : 1800 + Math.random() * 1400;
    }
    this.nextLandmark -= step * 0.5;
    if (this.nextLandmark <= 0) {
      const lm = LANDMARKS[this.landmarkIdx % LANDMARKS.length];
      this.landmarkIdx++;
      this.scene.push({ sprite: null, kind: lm.kind, x: this.W + 5, y: this.groundY - lm.h, w: lm.w, factor: 0.5 });
      this.nextLandmark = 650 + Math.random() * 700;
    }
  }

  private seedScene() {
    this.scene = [];
    for (let i = 0; i < 3; i++) {
      this.scene.push({
        sprite: this.scenery.cloud,
        kind: "cloud",
        x: Math.random() * this.W,
        y: 6 + Math.random() * Math.max(10, this.groundY * 0.45),
        w: this.scenery.cloud.w,
        factor: 0.25,
      });
    }
    this.scene.push({ sprite: this.scenery.tree, kind: "tree", x: this.W * 0.7, y: this.groundY - this.scenery.tree.h, w: this.scenery.tree.w, factor: 0.5 });
    this.nextCloud = 40;
    this.nextScenery = 60;
    this.nextLandmark = 320;
    this.landmarkIdx = Math.floor(Math.random() * LANDMARKS.length);
    if (import.meta.env.DEV) {
      // Local preview only: /pub-crawl?landmark=factory parks that landmark on screen.
      const want = new URLSearchParams(location.search).get("landmark");
      const lm = LANDMARKS.find((l) => l.kind === want);
      if (lm) this.scene.push({ sprite: null, kind: lm.kind, x: Math.round(this.W * 0.45 - lm.w / 2), y: this.groundY - lm.h, w: lm.w, factor: 0.5 });
      if (want === "bike") this.scene.push({ sprite: null, kind: "bike", x: Math.round(this.W * 0.45 - 38), y: this.groundY - 31, w: 76, factor: 0.35 });
      if (want === "pontoon") this.scene.push({ sprite: null, kind: "pontoon", x: Math.round(this.W * 0.45 - 56), y: this.groundY - 30, w: 112, factor: 0.35 });
    }
  }

  private makePebble(x: number): Pebble {
    return { x, y: this.groundY + 3 + Math.floor(Math.random() * 6), w: 1 + Math.floor(Math.random() * 3) };
  }

  private spawn() {
    let pool = OB_DEFS.filter((d) => this.score >= d.minScore && (d.kind !== "pumpkin" || isPumpkinSeason()));
    if (import.meta.env.DEV) {
      // Local preview only: /pub-crawl?only=drums spawns just that obstacle.
      const only = new URLSearchParams(location.search).get("only");
      if (only && OB_DEFS.some((d) => d.kind === only)) pool = OB_DEFS.filter((d) => d.kind === only);
    }
    // Variety: never the same thing twice in a row (or the one before), and
    // people are dealt from a shuffled bag so the band and the crew all get
    // their turn before anyone repeats.
    const people = pool.filter((d) => d.person);
    const lastWasPerson = this.lastKinds.length > 0 && OB_DEFS.some((d) => d.kind === this.lastKinds[this.lastKinds.length - 1] && d.person);
    let candidates: ObDef[] = pool.filter((d) => !d.person && !this.lastKinds.includes(d.kind));
    if (candidates.length === 0) candidates = pool.filter((d) => !d.person);
    const personWeight = people.length && !lastWasPerson ? Math.min(people.reduce((a, d) => a + d.weight, 0), 8) : 0;
    const total = candidates.reduce((a, d) => a + d.weight, 0) + personWeight;
    let r = Math.random() * total;
    let def: ObDef | null = null;
    for (const d of candidates) {
      r -= d.weight;
      if (r <= 0) {
        def = d;
        break;
      }
    }
    if (!def) {
      // Deal the next person from the bag, refilling it (shuffled) as needed.
      this.personBag = this.personBag.filter((d) => people.includes(d));
      if (this.personBag.length === 0) {
        this.personBag = [...people].sort(() => Math.random() - 0.5);
        const last = this.lastKinds[this.lastKinds.length - 1];
        if (this.personBag.length > 1 && this.personBag[0].kind === last) this.personBag.push(this.personBag.shift()!);
      }
      def = this.personBag.shift() ?? candidates[0] ?? pool[0];
    }
    this.lastKinds.push(def.kind);
    if (this.lastKinds.length > 2) this.lastKinds.shift();

    let sprites: Sprite[] = [];
    let count = 1;
    let frameRate = 0;
    let vx = 1;
    let swoop: Obstacle["swoop"];
    let y: number;
    if (def.kind === "football") {
      sprites = [this.obs.footballA, this.obs.footballB];
      frameRate = 10;
      vx = 1.25;
      const h = sprites[0].h;
      // Most throws bottom out low (a short hop catches it); some stay up at head height.
      const low = Math.random() < 0.65;
      const startY = this.groundY - 78 - h;
      const diveY = this.groundY - (low ? 12 : 33) - h;
      swoop = { startY, diveY, diveX: this.mx - 2, span: 150 };
      y = startY;
    } else if (def.kind === "goose") {
      sprites = [this.obs.gooseA, this.obs.gooseB];
      frameRate = 5;
      // Low: must jump. Mid: jump or slide. High: slide (or run under).
      const lanes = [14, 32, 46];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      y = this.groundY - lane - sprites[0].h + 5;
    } else {
      const sp = this.obs[def.kind];
      sprites = [sp];
      if (def.kind === "stool") count = 1 + Math.floor(Math.random() * 3);
      y = this.groundY - sp.h;
    }

    const w = sprites[0].w;
    this.obstacles.push({ def, x: this.W + 6, y, w, h: sprites[0].h, sprites, frameRate, count, cleared: false, vx, swoop });

    // Next gap: wider while slow so there is time to land between jumps.
    const t = (this.speed - START_SPEED) / (MAX_SPEED - START_SPEED);
    const base = 150 - t * 30;
    this.nextSpawn = w * count + base + Math.random() * 130 + this.speed * 0.5;
  }

  /** TV attract mode: jump what's low, slide under what's high. Not perfect on purpose. */
  private autoPilot() {
    if (this.my === 0) this.jumpHeld = false;
    let next: Obstacle | null = null;
    for (const o of this.obstacles) {
      if (o.def.kind === "football") continue;
      if (o.x + o.w * o.count > this.mx + 6 && (!next || o.x < next.x)) next = o;
    }
    this.ducking = false;
    if (!next) return;
    const box = this.obstacleBox(next);
    const gap = box.x - (this.mx + 20);
    const clearance = this.groundY - (box.y + box.h);
    const closing = this.speed * next.vx;
    if (clearance >= 16) {
      // Flying over head height: slide when it is about to pass.
      if (gap < closing * 0.5 && gap > -30) this.ducking = true;
      return;
    }
    if (this.my === 0 && gap < closing * 0.36 + 8 && gap > -6) {
      this.jumpHeld = true;
      this.jump();
    }
  }

  /* ---------- geometry ---------- */

  private heroSprite(): Sprite {
    if (this.state === "dead" && this.hitSprite) return this.hitSprite;
    if (this.state === "idle") return this.kevin.idle;
    if (this.my > 0) return this.ducking ? this.kevin.duck : this.kevin.jump;
    if (this.ducking) return this.kevin.duck;
    return this.runFrame ? this.kevin.runB : this.kevin.runA;
  }

  private heroBox(): Box {
    const sp = this.heroSprite();
    const top = this.groundY - Math.round(this.my) - sp.h;
    if (sp === this.kevin.duck) return { x: this.mx + 3, y: top + 3, w: sp.w - 6, h: sp.h - 3 };
    return { x: this.mx + 3, y: top + 4, w: sp.w - 6, h: sp.h - 4 };
  }

  private obstacleBox(o: Obstacle): Box {
    const i = o.def.inset;
    return { x: o.x + i.l, y: o.y + i.t, w: o.w * o.count - i.l - i.r, h: o.h - i.t - i.b };
  }

  private overlap(a: Box, b: Box) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private puff() {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: this.mx + 4 + Math.random() * 8,
        y: this.groundY - 1,
        vx: -20 - Math.random() * 30,
        vy: -10 - Math.random() * 20,
        life: 0.25 + Math.random() * 0.2,
        color: "#bfae92",
      });
    }
  }

  private burst() {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: this.mx + 9,
        y: this.groundY - 14 - Math.round(this.my),
        vx: (Math.random() - 0.5) * 160,
        vy: -40 - Math.random() * 120,
        life: 0.5 + Math.random() * 0.5,
        color: Math.random() < 0.5 ? ORANGE : "#fcfcfc",
      });
    }
  }

  /* ---------- drawing ---------- */

  private lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  private draw() {
    const c = this.bctx;
    const { W, H, groundY } = this;
    const n = this.nightT;

    // Sky
    c.fillStyle = this.lerpColor([248, 245, 239], [12, 16, 34], n);
    c.fillRect(0, 0, W, H);
    if (n > 0.05) {
      // Stars + moon fade in with the night
      c.globalAlpha = n;
      c.fillStyle = "#fcfcfc";
      for (let i = 0; i < 26; i++) {
        const sx = (i * 73 + 17) % W;
        const sy = (i * 41 + 9) % Math.max(10, groundY - 30);
        if ((i + Math.floor(this.elapsed * 2)) % 7 !== 0) c.fillRect(sx, sy, 1, 1);
      }
      c.fillStyle = "#f3e9c6";
      c.fillRect(W - 34, 14, 10, 10);
      c.fillRect(W - 36, 16, 14, 6);
      c.fillRect(W - 32, 12, 6, 14);
      c.fillStyle = this.lerpColor([248, 245, 239], [12, 16, 34], n);
      c.fillRect(W - 31, 15, 4, 4);
      c.globalAlpha = 1;
    }

    // Far scenery
    for (const s of this.scene) {
      if (s.kind === "pub") this.drawPub(Math.round(s.x), s.y);
      else if (s.kind === "banner") this.drawBanner(Math.round(s.x), s.y);
      else if (s.kind === "bike") this.drawPedalBike(Math.round(s.x), s.y);
      else if (s.kind === "pontoon") this.drawPontoon(Math.round(s.x), s.y);
      else if (s.kind === "factory") this.drawFactory(Math.round(s.x), s.y);
      else if (s.kind === "downtown") this.drawDowntown(Math.round(s.x), s.y);
      else if (s.kind === "match") this.drawMatch(Math.round(s.x), s.y);
      else if (s.sprite) {
        if (s.kind === "cloud") c.globalAlpha = 0.9 - n * 0.6;
        c.drawImage(s.sprite.canvas, Math.round(s.x), Math.round(s.y));
        c.globalAlpha = 1;
      }
    }

    // Ground
    c.fillStyle = this.lerpColor([60, 36, 18], [18, 14, 20], n);
    c.fillRect(0, groundY, W, 1);
    c.fillStyle = this.lerpColor([226, 206, 170], [30, 28, 40], n);
    c.fillRect(0, groundY + 1, W, H - groundY - 1);
    c.fillStyle = this.lerpColor([178, 150, 108], [60, 56, 70], n);
    for (const p of this.pebbles) c.fillRect(Math.round(p.x), p.y, p.w, 1);

    // Obstacles
    for (const o of this.obstacles) {
      const frame = o.frameRate ? Math.floor(this.elapsed * o.frameRate) % o.sprites.length : 0;
      const sp = o.sprites[frame];
      for (let i = 0; i < o.count; i++) c.drawImage(sp.canvas, Math.round(o.x) + i * o.w, Math.round(o.y));
      if (o.def.label) {
        const lx = Math.round(o.x + (o.w - textWidth(o.def.label)) / 2);
        const ly = Math.round(o.y) - 9;
        drawText(c, o.def.label, lx + 1, ly + 1, "rgba(0,0,0,0.45)");
        drawText(c, o.def.label, lx, ly, n > 0.5 ? "#fcfcfc" : ORANGE_INK);
      }
      if (o.def.kind === "brian") this.drawNotes(Math.round(o.x) + o.w - 4, Math.round(o.y) + 6);
      if (o.def.kind === "singer" || o.def.kind === "guitar") this.drawNotes(Math.round(o.x) - 2, Math.round(o.y) + 4);
    }

    // SPX pints
    for (const q of this.pints) this.drawPint(Math.round(q.x), this.pintY(q));

    // Kevin
    const sp = this.heroSprite();
    const top = groundY - Math.round(this.my) - sp.h;
    c.drawImage(sp.canvas, this.mx, top);
    if (this.state === "dead") {
      // Little stars circling the head
      c.fillStyle = "#e0b23c";
      for (let i = 0; i < 3; i++) {
        const a = this.elapsed * 4 + (i * Math.PI * 2) / 3;
        c.fillRect(this.mx + 9 + Math.round(Math.cos(a) * 8), top + 2 + Math.round(Math.sin(a) * 3), 2, 2);
      }
    }

    // Particles
    for (const p of this.particles) {
      c.fillStyle = p.color;
      c.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }

    // Bonus pops
    for (const p of this.pops) {
      const alpha = p.t < 0.8 ? 1 : 1 - (p.t - 0.8) / 0.3;
      c.globalAlpha = Math.max(0, alpha);
      const px = Math.max(2, Math.min(W - textWidth(p.text) * 2 - 2, Math.round(p.x)));
      drawText(c, p.text, px + 1, Math.round(p.y) + 1, "rgba(0,0,0,0.5)", 2);
      drawText(c, p.text, px, Math.round(p.y), p.color, 2);
      c.globalAlpha = 1;
    }

    // Milestone flash: the score area pulses (the DOM HUD shows numbers).
    if (this.elapsed < this.flashUntil && Math.floor(this.elapsed * 8) % 2 === 0) {
      c.fillStyle = "rgba(232,96,28,0.18)";
      c.fillRect(0, 0, W, Math.max(12, Math.round(H * 0.06)));
    }

    // Blit
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.buf, 0, 0, W * this.scale, H * this.scale);
  }

  /**
   * Spunkmeyers on High Street: the dark storefront with the orange SPUNKS
   * sign, and the Buck Naked Bar patio next door with its string lights
   * (lit at night) and a couple of palm trees.
   */
  private drawPub(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const gy = this.groundY;
    const bw = 46; // building
    // Walls
    c.fillStyle = this.lerpColor([44, 44, 46], [20, 20, 24], n);
    c.fillRect(x, y + 8, bw, gy - y - 8);
    // Roof line
    c.fillStyle = this.lerpColor([24, 24, 26], [10, 10, 12], n);
    c.fillRect(x - 2, y + 6, bw + 4, 3);
    c.fillRect(x + 2, y + 3, bw - 4, 3);
    // Sign board
    c.fillStyle = ORANGE;
    c.fillRect(x + 6, y + 11, bw - 12, 9);
    drawText(c, "SPUNKS", x + 6 + Math.round((bw - 12 - textWidth("SPUNKS")) / 2), y + 13, "#111");
    // Windows (lit at night) with a neon-ish glow line
    c.fillStyle = n > 0.5 ? "#f7c36a" : this.lerpColor([138, 208, 240], [60, 80, 120], n);
    c.fillRect(x + 4, y + 23, 10, 8);
    c.fillRect(x + bw - 14, y + 23, 10, 8);
    c.fillStyle = n > 0.5 ? ORANGE : "#6e6e6e";
    c.fillRect(x + 5, y + 25, 8, 1);
    // Door with the "DAWGS GOTTA EAT" bone sign
    c.fillStyle = "#45270f";
    c.fillRect(x + 18, y + 22, 10, gy - y - 22);
    c.fillStyle = "#fcfcfc";
    c.fillRect(x + 16, y + 24, 14, 6);
    drawText(c, "EAT", x + 17, y + 25, "#111");
    // Patio: fence posts, string lights, palm trees
    const px = x + bw + 2;
    const pw = 26;
    c.fillStyle = this.lerpColor([120, 90, 60], [50, 38, 28], n);
    c.fillRect(px, gy - 8, 1, 8);
    c.fillRect(px + pw, gy - 8, 1, 8);
    c.fillRect(px, gy - 6, pw, 1);
    c.fillRect(px, gy - 3, pw, 1);
    // Light string from the roof to the far post
    c.fillStyle = n > 0.5 ? "#c4c4c4" : "#8a8a8a";
    for (let i = 0; i <= pw; i += 2) {
      const sag = Math.round(Math.sin((i / pw) * Math.PI) * 4);
      c.fillRect(px + i, y + 10 + sag, 1, 1);
    }
    for (let i = 2; i < pw; i += 4) {
      const sag = Math.round(Math.sin((i / pw) * Math.PI) * 4);
      c.fillStyle = n > 0.5 ? ((Math.floor(this.elapsed * 3) + i) % 8 === 0 ? "#e0b23c" : "#f7e36a") : "#c4c4c4";
      c.fillRect(px + i, y + 11 + sag, 1, 2);
    }
    // Palm trees
    this.drawPalm(px + 6, gy);
    this.drawPalm(px + 19, gy);
    // Picnic table
    c.fillStyle = this.lerpColor([160, 120, 80], [70, 52, 36], n);
    c.fillRect(px + 9, gy - 7, 9, 1);
    c.fillRect(px + 11, gy - 6, 1, 6);
    c.fillRect(px + 15, gy - 6, 1, 6);
    c.fillRect(px + 8, gy - 4, 11, 1);
  }

  private drawPalm(x: number, gy: number) {
    const c = this.bctx;
    const n = this.nightT;
    c.fillStyle = this.lerpColor([138, 98, 54], [60, 44, 26], n);
    c.fillRect(x, gy - 16, 2, 16);
    c.fillRect(x + 1, gy - 18, 1, 2);
    c.fillStyle = this.lerpColor([63, 143, 58], [30, 60, 34], n);
    // Fronds
    c.fillRect(x - 4, gy - 18, 10, 1);
    c.fillRect(x - 5, gy - 17, 3, 1);
    c.fillRect(x + 4, gy - 17, 3, 1);
    c.fillRect(x - 6, gy - 16, 2, 1);
    c.fillRect(x + 6, gy - 16, 2, 1);
    c.fillRect(x - 1, gy - 20, 4, 1);
    c.fillRect(x, gy - 21, 2, 1);
    c.fillRect(x - 3, gy - 19, 2, 1);
    c.fillRect(x + 3, gy - 19, 2, 1);
  }

  private brick(n: number): string {
    return this.lerpColor([152, 82, 62], [66, 34, 30], n);
  }
  private windowFill(n: number): string {
    return n > 0.5 ? "#f7e36a" : this.lerpColor([150, 196, 220], [70, 86, 120], n);
  }

  /**
   * The Ohio Match Factory (later Blue Tip), the long brick plant down the
   * road: arched windows, a clerestory monitor along the roof, two
   * smokestacks, and a rail car out front.
   */
  private drawFactory(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const w = 118;
    const top = y + 18; // main wall top; stacks rise above
    const gy = this.groundY;
    // Smokestacks
    c.fillStyle = this.lerpColor([70, 44, 40], [30, 22, 24], n);
    c.fillRect(x + 22, y, 5, top - y + 2);
    c.fillRect(x + 78, y + 4, 4, top - y - 2);
    c.fillRect(x + 21, y, 7, 2);
    this.drawPlume(x + 24, y - 1, 1.0);
    this.drawPlume(x + 80, y + 3, 0.7);
    // Roof + clerestory monitor
    c.fillStyle = this.lerpColor([58, 48, 48], [22, 20, 24], n);
    c.fillRect(x - 2, top - 2, w + 4, 3);
    c.fillRect(x + 14, top - 9, w - 28, 7);
    c.fillStyle = this.windowFill(n);
    for (let wx = x + 17; wx < x + w - 17; wx += 6) c.fillRect(wx, top - 7, 3, 3);
    // Walls
    c.fillStyle = this.brick(n);
    c.fillRect(x, top, w, gy - top);
    // Mortar courses
    c.fillStyle = "rgba(0,0,0,0.12)";
    for (let yy = top + 4; yy < gy; yy += 5) c.fillRect(x, yy, w, 1);
    // Two rows of arched windows, a big arched doorway in the middle
    for (let wx = x + 5; wx < x + w - 6; wx += 9) {
      if (wx > x + 50 && wx < x + 66) continue;
      c.fillStyle = this.windowFill(n);
      c.fillRect(wx, top + 4, 3, 6);
      c.fillRect(wx + 1, top + 3, 1, 1);
      c.fillRect(wx, top + 15, 3, 6);
      c.fillRect(wx + 1, top + 14, 1, 1);
    }
    c.fillStyle = "#2b1a14";
    c.fillRect(x + 54, top + 14, 10, gy - top - 14);
    c.fillRect(x + 55, top + 12, 8, 2);
    c.fillRect(x + 56, top + 11, 6, 1);
    // Sign plate
    c.fillStyle = "#fcfcfc";
    c.fillRect(x + 33, top + 3, 52, 8);
    drawText(c, "OHIO MATCH CO", x + 35, top + 5, "#111");
    // Rail car out front
    c.fillStyle = this.lerpColor([44, 44, 48], [20, 20, 24], n);
    c.fillRect(x + 8, gy - 9, 34, 7);
    c.fillStyle = "#111";
    c.fillRect(x + 11, gy - 3, 3, 3);
    c.fillRect(x + 18, gy - 3, 3, 3);
    c.fillRect(x + 29, gy - 3, 3, 3);
    c.fillRect(x + 36, gy - 3, 3, 3);
    drawText(c, "LS MS", x + 13, gy - 8, "#c4c4c4");
  }

  /** A block of downtown Wadsworth: brick storefronts with awnings on the square. */
  private drawDowntown(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const gy = this.groundY;
    const stores: Array<{ w: number; brick: [number, number, number]; awning: string; sign: string }> = [
      { w: 28, brick: [150, 78, 60], awning: "#2f5fbf", sign: "DINER" },
      { w: 30, brick: [186, 160, 130], awning: "#cc0000", sign: "BARBER" },
      { w: 26, brick: [120, 70, 56], awning: "#245c22", sign: "TOOLS" },
    ];
    let sx = x;
    stores.forEach((st, i) => {
      const top = y + (i === 1 ? 0 : 4);
      c.fillStyle = this.lerpColor(st.brick, [st.brick[0] * 0.4, st.brick[1] * 0.4, st.brick[2] * 0.4].map(Math.round) as [number, number, number], n);
      c.fillRect(sx, top, st.w, gy - top);
      // Cornice
      c.fillStyle = this.lerpColor([70, 60, 56], [28, 24, 26], n);
      c.fillRect(sx - 1, top - 2, st.w + 2, 2);
      // Upstairs windows
      c.fillStyle = this.windowFill(n);
      for (let wx = sx + 4; wx < sx + st.w - 4; wx += 8) c.fillRect(wx, top + 5, 3, 6);
      // Sign band + awning + display window + door
      c.fillStyle = "#fcfcfc";
      c.fillRect(sx + 2, top + 14, st.w - 4, 7);
      drawText(c, st.sign, sx + 2 + Math.round((st.w - 4 - textWidth(st.sign)) / 2), top + 15, "#111");
      c.fillStyle = st.awning;
      c.fillRect(sx + 1, top + 21, st.w - 2, 3);
      c.fillStyle = "rgba(255,255,255,0.35)";
      for (let ax = sx + 3; ax < sx + st.w - 2; ax += 4) c.fillRect(ax, top + 21, 2, 3);
      c.fillStyle = this.windowFill(n);
      c.fillRect(sx + 3, top + 25, st.w - 12, gy - top - 26);
      c.fillStyle = "#2b1a14";
      c.fillRect(sx + st.w - 7, top + 25, 4, gy - top - 25);
      sx += st.w;
    });
    // Street lamp on the corner
    c.fillStyle = "#2b2b2b";
    c.fillRect(x - 5, gy - 22, 1, 22);
    c.fillRect(x - 7, gy - 24, 5, 2);
    c.fillStyle = n > 0.5 ? "#f7e36a" : "#c4c4c4";
    c.fillRect(x - 6, gy - 27, 3, 3);
  }

  /** The giant Blue Tip match on the square, flowers around the base. */
  private drawMatch(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const gy = this.groundY;
    // Flower bed
    c.fillStyle = this.lerpColor([63, 143, 58], [30, 60, 34], n);
    c.fillRect(x - 6, gy - 3, 26, 3);
    const petals = ["#cc0000", "#f7e36a", "#e8762a", "#fcfcfc"];
    for (let i = 0; i < 8; i++) {
      c.fillStyle = petals[i % 4];
      c.fillRect(x - 5 + i * 3, gy - 4, 1, 1);
    }
    // Concrete base
    c.fillStyle = "#8a8a8a";
    c.fillRect(x + 3, gy - 6, 8, 3);
    // Stick (cedar) with grain
    c.fillStyle = this.lerpColor([212, 130, 58], [110, 66, 30], n);
    c.fillRect(x + 4, y + 9, 6, gy - 15 - y);
    c.fillStyle = "rgba(0,0,0,0.18)";
    for (let yy = y + 12; yy < gy - 8; yy += 7) c.fillRect(x + 5 + (yy % 3), yy, 1, 1);
    // Blue tip
    c.fillStyle = this.lerpColor([47, 95, 191], [24, 50, 110], n);
    c.fillRect(x + 3, y + 3, 8, 7);
    c.fillRect(x + 4, y + 2, 6, 1);
    c.fillStyle = "rgba(255,255,255,0.35)";
    c.fillRect(x + 4, y + 3, 1, 5);
    // Pink striker tip
    c.fillStyle = "#f08ab0";
    c.fillRect(x + 6, y, 2, 2);
  }

  /** A pint of SPX: amber lager, a head of foam, orange label. */
  private drawPint(x: number, y: number) {
    const c = this.bctx;
    c.fillStyle = "#45270f";
    c.fillRect(x - 1, y - 1, PINT_W + 2, PINT_H + 2);
    c.fillStyle = "#fcfcfc";
    c.fillRect(x, y, PINT_W, PINT_H);
    c.fillStyle = "#f0a830";
    c.fillRect(x + 1, y + 3, PINT_W - 2, PINT_H - 4);
    c.fillStyle = "#c47d14";
    c.fillRect(x + 1, y + PINT_H - 3, PINT_W - 2, 2);
    c.fillStyle = "#fcfcfc";
    c.fillRect(x + 1, y + 1, PINT_W - 2, 2);
    c.fillRect(x + 2, y + 3, 1, PINT_H - 6);
    c.fillStyle = ORANGE;
    c.fillRect(x + 2, y + 6, PINT_W - 4, 4);
    drawText(c, "X", x + 4, y + 6, "#fcfcfc");
    // Bubbles
    const b = Math.floor(this.elapsed * 4) % 3;
    c.fillStyle = "#f7e36a";
    c.fillRect(x + 6, y + 12 - b, 1, 1);
    c.fillRect(x + 4, y + 11 - ((b + 1) % 3), 1, 1);
  }

  /** A little plane towing an SPX banner across the sky. */
  private drawBanner(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const text = "SPX LAGER ON TAP";
    const tw = textWidth(text);
    // Banner (behind the plane, to the right)
    const bx = x + 18;
    c.fillStyle = "#fcfcfc";
    c.fillRect(bx, y, tw + 6, 9);
    c.fillStyle = ORANGE;
    c.fillRect(bx, y, tw + 6, 1);
    c.fillRect(bx, y + 8, tw + 6, 1);
    drawText(c, text, bx + 3, y + 2, ORANGE_INK);
    // Tow rope
    c.fillStyle = n > 0.5 ? "#c4c4c4" : "#6e6e6e";
    c.fillRect(x + 12, y + 4, 6, 1);
    // Plane: body, wing, tail, spinning prop
    c.fillStyle = ORANGE;
    c.fillRect(x + 2, y + 3, 10, 3);
    c.fillRect(x + 10, y + 1, 2, 2);
    c.fillRect(x + 4, y + 2, 4, 1);
    c.fillRect(x + 5, y + 6, 3, 1);
    c.fillStyle = "#111";
    const prop = Math.floor(this.elapsed * 20) % 2;
    c.fillRect(x, y + 2 + prop, 2, 1);
    c.fillRect(x, y + 5 - prop, 2, 1);
    c.fillStyle = "#8ad0f0";
    c.fillRect(x + 8, y + 3, 2, 1);
  }

  /**
   * The Grizzly Pedal Company bike: a long red party bike with a canopy,
   * sponsor banners up top, a bar down the middle, and a row of riders
   * pedaling away. Drives to the right; the front is the right end.
   */
  private drawPedalBike(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const gy = this.groundY;
    const w = 76;
    const red = this.lerpColor([204, 0, 0], [120, 10, 10], n);
    const dark = this.lerpColor([127, 0, 0], [70, 6, 6], n);
    const pedal = Math.floor(this.elapsed * 6) % 2;

    // Canopy roof + banner strip
    c.fillStyle = this.lerpColor([58, 48, 48], [22, 20, 24], n);
    c.fillRect(x + 2, y, w - 4, 2);
    c.fillStyle = "#fcfcfc";
    c.fillRect(x + 4, y + 2, w - 8, 8);
    drawText(c, "GRIZZLY PEDAL CO", x + 4 + Math.round((w - 8 - textWidth("GRIZZLY PEDAL CO")) / 2), y + 4, "#cc0000");
    // Posts
    c.fillStyle = dark;
    c.fillRect(x + 8, y + 10, 2, 12);
    c.fillRect(x + w - 12, y + 10, 2, 12);
    c.fillRect(x + Math.round(w / 2), y + 10, 1, 12);
    // String lights under the canopy (glow at night)
    for (let lx = x + 12; lx < x + w - 12; lx += 6) {
      c.fillStyle = n > 0.5 ? (Math.floor(this.elapsed * 4 + lx) % 2 ? "#f7e36a" : "#e0b23c") : "#c4c4c4";
      c.fillRect(lx, y + 11, 1, 1);
    }

    // Riders: heads, shirts, pedaling legs
    const shirts = ["#2f5fbf", "#e8762a", "#245c22", "#8a4a9a", "#111111", "#e0b23c"];
    for (let i = 0; i < 6; i++) {
      const rx = x + 12 + i * 9;
      c.fillStyle = i % 2 ? "#f0c9a6" : "#c99b74";
      c.fillRect(rx + 1, y + 12, 3, 3); // head
      c.fillStyle = shirts[i];
      c.fillRect(rx, y + 15, 5, 5); // torso
      c.fillStyle = "#1c3a7a";
      const up = (i + pedal) % 2;
      c.fillRect(rx + (up ? 3 : 0), y + 20, 2, 2); // knee
      c.fillRect(rx + (up ? 0 : 3), y + 21, 2, 2);
    }
    // Bar top
    c.fillStyle = dark;
    c.fillRect(x + 10, y + 17, w - 22, 1);

    // Chassis
    c.fillStyle = red;
    c.fillRect(x + 2, y + 22, w - 4, 6);
    c.fillRect(x + w - 8, y + 19, 8, 9); // hood / front
    c.fillRect(x, y + 24, 3, 4); // rear bumper
    c.fillStyle = dark;
    c.fillRect(x + 4, y + 25, w - 14, 1);
    // Steering wheel + driver up front
    c.fillStyle = "#111";
    c.fillRect(x + w - 11, y + 14, 3, 1);
    c.fillRect(x + w - 10, y + 15, 1, 3);
    // Headlight at night
    if (n > 0.5) {
      c.fillStyle = "rgba(247,227,106,0.35)";
      c.fillRect(x + w, y + 22, 14, 4);
      c.fillStyle = "#f7e36a";
      c.fillRect(x + w - 1, y + 23, 1, 2);
    }
    // Wheels
    const spin = Math.floor(this.elapsed * 10) % 2;
    for (const wx of [x + 10, x + w - 14]) {
      c.fillStyle = "#111";
      c.fillRect(wx, gy - 6, 7, 6);
      c.fillRect(wx + 1, gy - 7, 5, 1);
      c.fillStyle = "#c4c4c4";
      c.fillRect(wx + 3 - spin, gy - 4, 1 + spin, 1);
      c.fillRect(wx + 3, gy - 5 + spin, 1, 1);
    }
  }

  /**
   * Kevin's pontoon boat, riding its trailer behind a pickup on the way to
   * the lake. Drives to the right; the truck is the right end. Pure
   * background, nothing to jump.
   */
  private drawPontoon(x: number, y: number) {
    const c = this.bctx;
    const n = this.nightT;
    const gy = this.groundY;
    const spin = Math.floor(this.elapsed * 10) % 2;
    const wheel = (wx: number) => {
      c.fillStyle = "#111";
      c.fillRect(wx, gy - 6, 7, 6);
      c.fillRect(wx + 1, gy - 7, 5, 1);
      c.fillStyle = "#c4c4c4";
      c.fillRect(wx + 3 - spin, gy - 4, 1 + spin, 1);
      c.fillRect(wx + 3, gy - 5 + spin, 1, 1);
    };

    /* --- Boat on the trailer (x .. x+72) --- */
    const bx = x;
    const bw = 72;
    // Bimini top (blue canvas) on two posts
    c.fillStyle = this.lerpColor([47, 95, 191], [24, 50, 110], n);
    c.fillRect(bx + 22, y, 30, 3);
    c.fillStyle = "#c4c4c4";
    c.fillRect(bx + 24, y + 3, 1, 8);
    c.fillRect(bx + 49, y + 3, 1, 8);
    // Railing
    c.fillStyle = n > 0.5 ? "#9a9a9a" : "#e6e6e6";
    c.fillRect(bx + 2, y + 6, bw - 4, 1);
    for (let rx = bx + 4; rx < bx + bw - 2; rx += 6) c.fillRect(rx, y + 7, 1, 5);
    // Seats (two cushions) and a cooler
    c.fillStyle = "#1c3a7a";
    c.fillRect(bx + 6, y + 8, 10, 4);
    c.fillRect(bx + 56, y + 8, 10, 4);
    c.fillStyle = "#cc0000";
    c.fillRect(bx + 30, y + 9, 6, 3);
    // Deck (wood) with the name on the side rail
    c.fillStyle = this.lerpColor([160, 120, 80], [70, 52, 36], n);
    c.fillRect(bx, y + 12, bw, 4);
    c.fillStyle = "#fcfcfc";
    c.fillRect(bx + 24, y + 12, textWidth("KEVIN") + 4, 4);
    drawText(c, "KEVIN", bx + 26, y + 12, ORANGE_INK);
    // Twin pontoon tubes (aluminum)
    c.fillStyle = this.lerpColor([196, 196, 200], [90, 90, 100], n);
    c.fillRect(bx + 2, y + 16, bw - 4, 4);
    c.fillRect(bx + 1, y + 17, bw - 2, 2);
    c.fillStyle = "rgba(0,0,0,0.18)";
    c.fillRect(bx + 2, y + 19, bw - 4, 1);
    // Outboard motor off the back (left end)
    c.fillStyle = "#111";
    c.fillRect(bx - 2, y + 10, 3, 4);
    c.fillRect(bx - 1, y + 14, 1, 6);
    // Trailer frame + tongue to the truck
    c.fillStyle = this.lerpColor([60, 60, 64], [26, 26, 30], n);
    c.fillRect(bx + 4, y + 20, bw - 8, 2);
    c.fillRect(bx + bw - 4, y + 21, 14, 1);
    c.fillRect(bx + 14, y + 22, 2, 2);
    c.fillRect(bx + 50, y + 22, 2, 2);
    wheel(bx + 12);
    wheel(bx + 48);

    /* --- Pickup truck (x+82 .. x+112) --- */
    const tx = x + 82;
    const tw = 30;
    const body = this.lerpColor([232, 96, 28], [130, 50, 14], n);
    const dark = this.lerpColor([179, 64, 11], [80, 30, 8], n);
    // Bed
    c.fillStyle = body;
    c.fillRect(tx, y + 14, 14, 10);
    // Cab
    c.fillRect(tx + 14, y + 8, 12, 16);
    c.fillRect(tx + 26, y + 14, 4, 10);
    c.fillStyle = this.windowFill(n);
    c.fillRect(tx + 16, y + 9, 5, 5);
    c.fillRect(tx + 22, y + 9, 3, 5);
    c.fillStyle = dark;
    c.fillRect(tx, y + 21, tw, 1);
    c.fillRect(tx, y + 14, 14, 1);
    // Headlight at night
    if (n > 0.5) {
      c.fillStyle = "rgba(247,227,106,0.35)";
      c.fillRect(tx + tw, y + 16, 14, 4);
      c.fillStyle = "#f7e36a";
      c.fillRect(tx + tw - 1, y + 17, 1, 2);
    }
    wheel(tx + 3);
    wheel(tx + 20);
  }

  /** Factory chimney smoke: slow puffs drifting up and to the left. */
  private drawPlume(x: number, y: number, size: number) {
    const c = this.bctx;
    c.fillStyle = this.nightT > 0.5 ? "rgba(200,200,210,0.35)" : "rgba(90,90,90,0.4)";
    for (let i = 0; i < 5; i++) {
      const t = (this.elapsed * 0.35 + i * 0.2) % 1;
      const s = Math.max(1, Math.round((1 + t * 3) * size));
      c.fillRect(x - Math.round(t * 18) - Math.round(s / 2), y - Math.round(t * 16) - s, s, s);
    }
  }

  /** Music notes rising off the band and the DJ booth. */
  private drawNotes(x: number, y: number) {
    const c = this.bctx;
    c.fillStyle = this.nightT > 0.5 ? "#fcfcfc" : "#2b2b2b";
    for (let i = 0; i < 2; i++) {
      const t = (this.elapsed * 0.9 + i * 0.5) % 1;
      const nx = x + Math.round(Math.sin(t * 6 + i) * 2);
      const ny = y - Math.round(t * 12);
      c.fillRect(nx, ny, 2, 2);
      c.fillRect(nx + 2, ny - 3, 1, 4);
    }
  }
}
