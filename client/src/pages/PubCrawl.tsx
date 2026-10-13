import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { PubCrawl as Engine, SPLIT_X, PERSON_BONUS, PINT_BONUS, FOOTBALL_BONUS } from "@/game/engine";
import type { CrawlState, GameOverResult } from "@/game/engine";

/**
 * /pub-crawl — Spunks Pub Crawl, the pub's phone game. Kevin runs; right
 * thumb taps to jump, left thumb holds to slide. The canvas engine lives in
 * src/game; this page is the HUD, menus, and leaderboard glue.
 */

const SITE = "https://spunkmeyers.pub";
const PATH = "/pub-crawl";
const MIN_BOARD_SCORE = 50;

interface Entry {
  name: string;
  score: number;
  date: string;
}
interface Board {
  all: Entry[];
  today: Entry[];
  day: string;
}

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
      /* ignore */
    }
  },
};

const CRASH_LINES: Record<string, string[]> = {
  Peyton: ["Peyton's cutting you off.", "You ran over the bartender. Good luck getting served.", "Peyton saw that. Tab's closed."],
  Mick: ["Mick's been on that stool all night. He wasn't moving.", "You bumped Mick. Buy him one.", "Mick didn't even spill his beer."],
  Luke: ["Luke had a pitcher. Had.", "Luke says you owe him a refill.", "You took out Luke and the pitcher. Rough."],
  DJ: ["DJ's a regular, not the DJ. Still counts.", "You bumped DJ. He'll tell Brian.", "DJ didn't move. DJ never moves."],
  "DJ Brian": ["Brian cut the music. Everybody's looking at you.", "Needle scratch. DJ Brian is not amused.", "You unplugged Brian's table mid-set."],
  Arene: ["Arene saw it coming. Sang right through it.", "You took out the lead vocals. Show's over.", "Arene's not sharing the mic after that."],
  Chris: ["Chris's solo was going so well.", "You broke a string. And Chris.", "Chris plays pedal steel. You play the pavement."],
  Jeff: ["Crash cymbal. Literally.", "You wiped out Jeff and the whole kit.", "Jeff kept the beat. You didn't."],
  Dave: ["Dropped the bass. And Dave.", "The low end just got lower. Sorry, Dave.", "Dave was holding it down. You took it down."],
  Bob: ["That was a lot of keys to run into.", "Bob just played every note at once.", "Bob learned piano in Zimbabwe. He did not learn to dodge."],
  "a bar stool": ["Stools: still undefeated.", "Somebody left that stool out on purpose."],
  "a smash burger": ["Smashed by the smash burger.", "That burger's still the top seller. You're not."],
  "a basket of wings": ["Wings 1, Kevin 0.", "Sauced. Totally sauced."],
  "a beer": ["Spilled it. Party foul.", "That one's on you. Literally."],
  "the keg": ["The keg always wins.", "Kicked the keg. Not like that."],
  "a goose": ["Honk.", "Canada geese: still undefeated."],
  "a pumpkin": ["Gourd game, pal."],
};
const DEFAULT_LINES = ["Kevin's down. Band plays on.", "Shake it off and order a round."];

function crashLine(cause: string): string {
  const pool = CRASH_LINES[cause] ?? DEFAULT_LINES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pad(n: number): string {
  return String(Math.min(99999, Math.max(0, n))).padStart(5, "0");
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function PubCrawl() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [state, setState] = useState<CrawlState>("idle");
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);
  const [result, setResult] = useState<GameOverResult | null>(null);
  const [line, setLine] = useState("");
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [sound, setSound] = useState(() => store.get("spc-sound") === "on");
  const [panel, setPanel] = useState<"none" | "board">("none");
  const [board, setBoard] = useState<Board | null>(null);
  const [boardTab, setBoardTab] = useState<"today" | "all">("today");
  const [name, setName] = useState(() => store.get("spc-name") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ranks, setRanks] = useState<{ all: number; today: number } | null>(null);
  const [duckHintSeen, setDuckHintSeen] = useState(() => store.get("spc-duck-hint") === "1");
  const toastTimer = useRef<number | undefined>(undefined);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const showToast = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  // Lock the page to the viewport while the game is mounted.
  useEffect(() => {
    document.documentElement.classList.add("crawl-active");
    document.body.classList.add("crawl-active");
    return () => {
      document.documentElement.classList.remove("crawl-active");
      document.body.classList.remove("crawl-active");
    };
  }, []);

  // Boot the engine.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, {
      onState: (s) => {
        setState(s);
        if (s === "playing") {
          setResult(null);
          setRanks(null);
          setSubmitError("");
          setPanel("none");
        }
      },
      onScore: (s, h) => {
        setScore(s);
        setHi(h);
      },
      onGameOver: (r) => {
        setResult(r);
        setLine(crashLine(r.cause));
      },
      onToast: showToast,
    });
    engine.setSound(store.get("spc-sound") === "on");
    engine.attach();
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [showToast]);

  // Keep the screen on and go fullscreen (where allowed) during a run.
  useEffect(() => {
    if (state === "playing") {
      void (async () => {
        try {
          if ("wakeLock" in navigator && !wakeLock.current) {
            wakeLock.current = await navigator.wakeLock.request("screen");
            wakeLock.current.addEventListener("release", () => {
              wakeLock.current = null;
            });
          }
        } catch {
          /* not supported */
        }
      })();
      const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      if (coarse && !standalone && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
    return () => {
      if (state === "playing" && wakeLock.current) {
        wakeLock.current.release().catch(() => {});
        wakeLock.current = null;
      }
    };
  }, [state]);

  useEffect(
    () => () => {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    },
    [],
  );

  // Remember the slide hint once the player has slid.
  useEffect(() => {
    if (state === "dead" && !duckHintSeen && score >= 400) {
      setDuckHintSeen(true);
      store.set("spc-duck-hint", "1");
    }
  }, [state, score, duckHintSeen]);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    store.set("spc-sound", next ? "on" : "off");
    engineRef.current?.setSound(next);
  };

  const loadBoard = useCallback(async () => {
    try {
      const r = await fetch("/api/pub-crawl-scores", { cache: "no-store" });
      if (r.ok) setBoard((await r.json()) as Board);
    } catch {
      /* offline */
    }
  }, []);

  const openBoard = (tab: "today" | "all" = "today") => {
    setBoardTab(tab);
    setPanel("board");
    void loadBoard();
  };

  const submitScore = async (e: FormEvent) => {
    e.preventDefault();
    if (!result || submitting) return;
    const clean = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!clean) {
      setSubmitError("Enter 1 to 3 letters.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const r = await fetch("/api/pub-crawl-scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: clean, score: result.score, time: result.time }),
      });
      const data = (await r.json()) as { error?: string; rankAll?: number; rankToday?: number; all?: Entry[]; today?: Entry[]; day?: string };
      if (!r.ok || data.error) {
        setSubmitError(data.error || "Could not save. Try again.");
      } else {
        store.set("spc-name", clean);
        setName(clean);
        setRanks({ all: data.rankAll ?? 0, today: data.rankToday ?? 0 });
        if (data.all && data.today && data.day) setBoard({ all: data.all, today: data.today, day: data.day });
      }
    } catch {
      setSubmitError("No connection. Your score is saved on this phone.");
    } finally {
      setSubmitting(false);
    }
  };

  const share = async () => {
    if (!result) return;
    try {
      await navigator.share({
        title: "Spunks Pub Crawl",
        text: `I scored ${result.score} in Spunks Pub Crawl at Spunkmeyers. Beat me:`,
        url: `${SITE}${PATH}`,
      });
    } catch {
      /* cancelled */
    }
  };

  const runAgain = () => engineRef.current?.start();

  const btn =
    "pointer-events-auto inline-flex items-center justify-center min-h-[48px] px-5 rounded-md font-heading font-semibold uppercase text-xl tracking-wide transition active:scale-95";
  const btnPrimary = `${btn} bg-spunks-orange text-white shadow-lg shadow-orange-900/40`;
  const btnGhost = `${btn} bg-white/10 text-white border border-white/20`;

  return (
    <div
      className="fixed inset-0 bg-black text-white select-none overflow-hidden"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      <SEO
        title="Spunks Pub Crawl | Spunkmeyers Pub & Grill"
        description="Spunks Pub Crawl: the Spunkmeyers phone game. Kevin runs down High Street. Tap to jump the band, slide under the geese, grab an SPX, and get your initials on the pub leaderboard."
        path={PATH}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-label="Spunks Pub Crawl game" />

      {/* Control pads: left half slides, right half jumps */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          state === "playing" || state === "idle" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/55 to-transparent" />
        <div
          className="absolute inset-x-0 bottom-0 flex font-heading uppercase tracking-[0.25em] text-white"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-col items-center gap-1" style={{ width: `${SPLIT_X * 100}%` }}>
            <span className="text-5xl leading-none">▼</span>
            <span className="text-2xl font-semibold">SLIDE</span>
            <span className="text-xs text-white/70">{!duckHintSeen || state === "idle" ? "HOLD LEFT SIDE" : "HOLD"}</span>
          </div>
          <div className="flex flex-col items-center gap-1" style={{ width: `${(1 - SPLIT_X) * 100}%` }}>
            <span className="text-5xl leading-none">▲</span>
            <span className="text-2xl font-semibold">JUMP</span>
            <span className="text-xs text-white/70">{state === "idle" ? "TAP RIGHT SIDE" : "TAP"}</span>
          </div>
        </div>
      </div>

      {/* HUD */}
      <div
        className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pointer-events-none"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          {state !== "playing" && (
            <Link href="/" className="pointer-events-auto inline-flex items-center justify-center h-11 px-3 rounded-md bg-black/50 border border-white/15 font-heading font-semibold uppercase text-base tracking-wider">
              ← PUB
            </Link>
          )}
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="pointer-events-auto inline-flex items-center justify-center h-11 min-w-[44px] px-3 rounded-md bg-black/50 border border-white/15 font-heading font-semibold uppercase text-base tracking-wider"
          >
            {sound ? "♪ ON" : "♪ OFF"}
          </button>
        </div>
        <div className="text-right font-heading leading-none tabular-nums bg-black/50 border border-white/15 rounded-md px-3 py-1.5">
          <div className="text-[11px] tracking-[0.3em] text-white/60">HI {pad(hi)}</div>
          <div className="text-3xl font-semibold text-white">{pad(score)}</div>
        </div>
      </div>

      {/* Title */}
      {state === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-start text-center pointer-events-none px-6" style={{ paddingTop: "max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem))" }}>
          <div className="font-heading font-semibold text-sm tracking-[0.5em] text-spunks-orange">SPUNKMEYERS · WADSWORTH</div>
          <h1 className="font-heading font-bold uppercase leading-[0.9] text-[#111] mt-1" style={{ fontSize: "clamp(3.5rem, 16vw, 7rem)" }}>
            SPUNKS
            <br />
            <span className="text-spunks-orange">PUB CRAWL</span>
          </h1>
          <div className="mt-4 font-heading font-semibold text-3xl tracking-[0.25em] text-[#111] animate-pulse">TAP TO RUN</div>
          <p className="mt-2 text-sm text-neutral-700 max-w-xs leading-snug">
            Right side: tap to jump. Left side: hold to slide. Jump the band and the crew for +{PERSON_BONUS}, grab an SPX for +{PINT_BONUS}, and catch the football for +{FOOTBALL_BONUS.toLocaleString()}.
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => openBoard("today")} className={`${btn} bg-black/80 text-white`}>
              TOP SCORES
            </button>
          </div>
        </div>
      )}

      {/* Paused */}
      {state === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
          <div className="text-center">
            <div className="font-heading font-bold text-6xl">PAUSED</div>
            <div className="mt-2 font-heading text-2xl tracking-[0.3em] text-white/70">TAP TO RESUME</div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div key={toast.id} className="absolute inset-x-0 flex justify-center pointer-events-none" style={{ bottom: "22%" }}>
          <div className="crawl-toast bg-black/85 border-2 border-spunks-orange text-spunks-orange font-heading font-semibold uppercase text-2xl tracking-wider px-5 py-2 rounded-md">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Game over */}
      {state === "dead" && result && panel === "none" && (
        <div className="absolute inset-0 flex items-center justify-center px-5 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-neutral-950/95 border border-white/15 rounded-2xl shadow-2xl p-5 text-center crawl-pop">
            <div className="font-heading font-bold text-6xl text-spunks-orange leading-none">WRECKED!</div>
            <p className="mt-2 text-sm text-white/75">{line}</p>
            <div className="mt-4 flex items-end justify-center gap-6">
              <div>
                <div className="text-[11px] tracking-[0.3em] text-white/60 font-bold">SCORE</div>
                <div className="font-heading font-bold text-6xl leading-none tabular-nums">{result.score}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] text-white/60 font-bold">BEST</div>
                <div className="font-heading font-bold text-4xl leading-none tabular-nums text-spunks-orange">{result.hi}</div>
              </div>
            </div>
            {result.newBest && result.score > 0 && (
              <div className="mt-2 inline-block bg-spunks-orange text-black font-heading font-semibold text-xl tracking-widest px-3 py-0.5 rounded">NEW BEST!</div>
            )}

            {result.score >= MIN_BOARD_SCORE && !ranks && (
              <form onSubmit={submitScore} className="mt-4">
                <label htmlFor="initials" className="block text-[11px] tracking-[0.3em] text-white/60 font-bold">
                  YOUR INITIALS
                </label>
                <div className="mt-1 flex justify-center gap-2">
                  <input
                    id="initials"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3))}
                    maxLength={3}
                    autoComplete="off"
                    autoCapitalize="characters"
                    inputMode="text"
                    placeholder="AAA"
                    className="w-28 text-center font-heading font-bold text-4xl tracking-[0.3em] bg-black border-2 border-white/30 focus:border-spunks-orange rounded-md px-2 py-1 text-white outline-none uppercase"
                  />
                  <button type="submit" disabled={submitting} className={`${btnPrimary} disabled:opacity-60`}>
                    {submitting ? "SAVING" : "SAVE"}
                  </button>
                </div>
                {submitError && <p className="mt-2 text-sm text-red-300">{submitError}</p>}
              </form>
            )}
            {result.score < MIN_BOARD_SCORE && (
              <p className="mt-3 text-xs text-white/50">Score {MIN_BOARD_SCORE}+ to get on the pub board.</p>
            )}
            {ranks && (
              <p className="mt-3 text-sm text-spunks-orange">
                {ranks.today > 0 && ranks.today <= 10 ? `${ordinal(ranks.today)} tonight` : "Saved"}
                {ranks.all > 0 && ranks.all <= 100 ? ` · ${ordinal(ranks.all)} all-time` : ""}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button type="button" onClick={runAgain} className={btnPrimary}>
                RUN AGAIN
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => openBoard(ranks && ranks.today > 10 ? "all" : "today")} className={`${btnGhost} flex-1`}>
                  TOP SCORES
                </button>
                {canShare && (
                  <button type="button" onClick={share} className={`${btnGhost} flex-1`}>
                    SHARE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {panel === "board" && (
        <div className="absolute inset-0 flex items-center justify-center px-5 bg-black/60">
          <div className="w-full max-w-sm bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl p-5 crawl-pop" role="dialog" aria-label="Top scores">
            <div className="flex items-center justify-between">
              <div className="font-heading font-bold text-4xl leading-none">TOP SCORES</div>
              <button type="button" onClick={() => setPanel("none")} aria-label="Close" className="h-11 w-11 rounded-md bg-white/10 border border-white/15 font-heading text-2xl">
                ×
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 bg-white/10 p-1 rounded-md">
              {(["today", "all"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBoardTab(t)}
                  className={`h-10 rounded font-heading font-semibold text-lg tracking-wider ${boardTab === t ? "bg-spunks-orange text-white" : "text-white/70"}`}
                >
                  {t === "today" ? "TONIGHT" : "ALL-TIME"}
                </button>
              ))}
            </div>
            <ol className="mt-3 divide-y divide-white/10 min-h-[200px]">
              {!board && <li className="py-6 text-center text-white/50 text-sm">Loading…</li>}
              {board && board[boardTab].length === 0 && (
                <li className="py-6 text-center text-white/60 text-sm">
                  {boardTab === "today" ? "Nobody's on the board tonight. Be the first." : "No scores yet. Be the first."}
                </li>
              )}
              {board?.[boardTab].slice(0, 10).map((e, i) => (
                <li key={`${e.name}-${e.score}-${i}`} className="flex items-center gap-3 py-2 font-heading font-semibold text-2xl tabular-nums">
                  <span className={`w-8 text-right ${i === 0 ? "text-spunks-orange" : "text-white/50"}`}>{i + 1}.</span>
                  <span className="tracking-[0.25em] flex-1">{e.name}</span>
                  {boardTab === "all" && <span className="text-xs font-sans font-normal text-white/40 tracking-normal">{e.date.slice(5).replace("-", "/")}</span>}
                  <span className={i === 0 ? "text-spunks-orange" : ""}>{e.score}</span>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => setPanel("none")} className={`${btnPrimary} w-full mt-4`}>
              {state === "idle" ? "LET'S RUN" : "BACK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
