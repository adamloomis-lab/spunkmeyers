import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { SpunksStack as Engine } from "@/game/stack";
import type { StackState, StackScore, StackResult } from "@/game/stack";

/**
 * /stack — Spunks Stack, falling blocks for the bar. Swipe to move, tap to
 * spin, flick down to drop, or use the big buttons. The canvas engine lives
 * in src/game/stack.ts; this page is the menus, controls, and leaderboard glue.
 */

const SITE = "https://spunkmeyers.pub";
const PATH = "/stack";
const MIN_BOARD_SCORE = 100;

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

const OVER_LINES = [
  "Stacked to the ceiling. Peyton's cutting you off.",
  "Topped out. Kevin says try again.",
  "The well's full. So's the bar.",
  "That stack had no business standing that long.",
  "Last call for that stack.",
];

function pad(n: number): string {
  return String(Math.min(999999, Math.max(0, n))).padStart(6, "0");
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function Stack() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [state, setState] = useState<StackState>("idle");
  const [score, setScore] = useState<StackScore>({ score: 0, lines: 0, level: 0, hi: 0 });
  const [result, setResult] = useState<StackResult | null>(null);
  const [line, setLine] = useState("");
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [sound, setSound] = useState(() => store.get("ss-sound") === "on");
  const [panel, setPanel] = useState<"none" | "board">("none");
  const [board, setBoard] = useState<Board | null>(null);
  const [boardTab, setBoardTab] = useState<"today" | "all">("today");
  const [name, setName] = useState(() => store.get("ss-name") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ranks, setRanks] = useState<{ all: number; today: number } | null>(null);
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
      onScore: setScore,
      onGameOver: (r) => {
        setResult(r);
        setLine(OVER_LINES[Math.floor(Math.random() * OVER_LINES.length)]);
      },
      onToast: showToast,
    });
    engine.setSound(store.get("ss-sound") === "on");
    engine.attach();
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [showToast]);

  // Keep the screen on and go fullscreen (where allowed) during a game.
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

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    store.set("ss-sound", next ? "on" : "off");
    engineRef.current?.setSound(next);
  };

  const loadBoard = useCallback(async () => {
    try {
      const r = await fetch("/api/stack-scores", { cache: "no-store" });
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
      const r = await fetch("/api/stack-scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: clean, score: result.score, time: result.time, lines: result.lines }),
      });
      const data = (await r.json()) as { error?: string; rankAll?: number; rankToday?: number; all?: Entry[]; today?: Entry[]; day?: string };
      if (!r.ok || data.error) {
        setSubmitError(data.error || "Could not save. Try again.");
      } else {
        store.set("ss-name", clean);
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
        title: "Spunks Stack",
        text: `I scored ${result.score.toLocaleString()} (${result.lines} lines) in Spunks Stack at Spunkmeyers. Beat me:`,
        url: `${SITE}${PATH}`,
      });
    } catch {
      /* cancelled */
    }
  };

  const playAgain = () => engineRef.current?.start();

  // On-screen controls. Pointer handlers so holding "down" soft-drops.
  const press = (fn: () => void) => (e: ReactPointerEvent) => {
    e.preventDefault();
    fn();
  };
  const softOn = (e: ReactPointerEvent) => {
    e.preventDefault();
    engineRef.current?.setSoftDrop(true);
  };
  const softOff = () => engineRef.current?.setSoftDrop(false);
  const holdOn = (dir: -1 | 1) => (e: ReactPointerEvent) => {
    e.preventDefault();
    engineRef.current?.holdMove(dir, true);
  };
  const holdOff = (dir: -1 | 1) => () => engineRef.current?.holdMove(dir, false);

  const btn =
    "pointer-events-auto inline-flex items-center justify-center min-h-[48px] px-5 rounded-md font-heading font-semibold uppercase text-xl tracking-wide transition active:scale-95";
  const btnPrimary = `${btn} bg-spunks-orange text-white shadow-lg shadow-orange-900/40`;
  const btnGhost = `${btn} bg-white/10 text-white border border-white/20`;
  const pad_ =
    "pointer-events-auto select-none flex items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white active:bg-spunks-orange active:border-spunks-orange transition-colors";

  return (
    <div className="fixed inset-0 bg-black text-white select-none overflow-hidden" style={{ touchAction: "none", overscrollBehavior: "none" }}>
      <SEO
        title="Spunks Stack | Spunkmeyers Pub & Grill"
        description="Spunks Stack: old-school falling blocks on your phone at Spunkmeyers in Wadsworth. Swipe, spin, drop, and get your initials on the pub leaderboard."
        path={PATH}
        ogImage="https://spunkmeyers.pub/img/og-stack.png"
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-label="Spunks Stack game" />

      {/* HUD */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 pointer-events-none" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-3">
          {state !== "playing" && (
            <Link href="/games" className="pointer-events-auto inline-flex items-center justify-center h-11 px-3 rounded-md bg-black/50 border border-white/15 font-heading font-semibold uppercase text-base tracking-wider">
              ← GAMES
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
        {state === "playing" && (
          <button
            type="button"
            onClick={() => engineRef.current?.pause()}
            className="pointer-events-auto inline-flex items-center justify-center h-11 px-3 rounded-md bg-black/50 border border-white/15 font-heading font-semibold uppercase text-base tracking-wider"
          >
            PAUSE
          </button>
        )}
      </div>

      {/* On-screen controls */}
      {(state === "playing" || state === "paused") && (
        <div className="absolute inset-x-0 bottom-0 px-3 pointer-events-none" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="grid grid-cols-5 gap-2 h-16 font-heading text-2xl">
            <button type="button" aria-label="Move left (hold to keep moving)" className={pad_} onPointerDown={holdOn(-1)} onPointerUp={holdOff(-1)} onPointerCancel={holdOff(-1)} onPointerLeave={holdOff(-1)}>
              ◀
            </button>
            <button type="button" aria-label="Move right (hold to keep moving)" className={pad_} onPointerDown={holdOn(1)} onPointerUp={holdOff(1)} onPointerCancel={holdOff(1)} onPointerLeave={holdOff(1)}>
              ▶
            </button>
            <button type="button" aria-label="Rotate" className={`${pad_} text-3xl`} onPointerDown={press(() => engineRef.current?.rotate(1))}>
              ↻
            </button>
            <button type="button" aria-label="Soft drop (hold)" className={pad_} onPointerDown={softOn} onPointerUp={softOff} onPointerCancel={softOff} onPointerLeave={softOff}>
              ▼
            </button>
            <button type="button" aria-label="Hard drop" className={`${pad_} bg-spunks-orange/80 border-spunks-orange`} onPointerDown={press(() => engineRef.current?.hardDrop())}>
              ⤓
            </button>
          </div>
          <div className="mt-1 text-center text-[10px] tracking-[0.25em] text-white/50 font-heading uppercase">Drag the piece · tap to spin · flick down to drop</div>
        </div>
      )}

      {/* Title */}
      {state === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
          <div className="font-heading font-semibold text-sm tracking-[0.5em] text-spunks-orange">SPUNKMEYERS · WADSWORTH</div>
          <h1 className="font-heading font-bold uppercase leading-[0.9] text-white mt-1" style={{ fontSize: "clamp(3.5rem, 16vw, 7rem)" }}>
            SPUNKS
            <br />
            <span className="text-spunks-orange">STACK</span>
          </h1>
          <div className="mt-4 font-heading font-semibold text-3xl tracking-[0.25em] text-white animate-pulse">TAP TO PLAY</div>
          <p className="mt-2 text-sm text-white/75 max-w-xs leading-snug">
            Drag the piece where you want it, tap to spin, flick down to drop. Or use the buttons. Clear lines, climb levels, and put your initials on the pub board.
          </p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => openBoard("today")} className={`${btn} bg-white/10 border border-white/20 text-white`}>
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
        <div key={toast.id} className="absolute inset-x-0 flex justify-center pointer-events-none" style={{ top: "18%" }}>
          <div className="crawl-toast bg-black/85 border-2 border-spunks-orange text-spunks-orange font-heading font-semibold uppercase text-2xl tracking-wider px-5 py-2 rounded-md">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Game over */}
      {state === "dead" && result && panel === "none" && (
        <div className="absolute inset-0 flex items-center justify-center px-5 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-neutral-950/95 border border-white/15 rounded-2xl shadow-2xl p-5 text-center crawl-pop">
            <div className="font-heading font-bold text-6xl text-spunks-orange leading-none">TOPPED OUT!</div>
            <p className="mt-2 text-sm text-white/75">{line}</p>
            <div className="mt-4 flex items-end justify-center gap-5">
              <div>
                <div className="text-[11px] tracking-[0.3em] text-white/60 font-bold">SCORE</div>
                <div className="font-heading font-bold text-5xl leading-none tabular-nums">{result.score.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] text-white/60 font-bold">LINES</div>
                <div className="font-heading font-bold text-3xl leading-none tabular-nums">{result.lines}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.3em] text-white/60 font-bold">BEST</div>
                <div className="font-heading font-bold text-3xl leading-none tabular-nums text-spunks-orange">{result.hi.toLocaleString()}</div>
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
            {result.score < MIN_BOARD_SCORE && <p className="mt-3 text-xs text-white/50">Score {MIN_BOARD_SCORE}+ to get on the pub board.</p>}
            {ranks && (
              <p className="mt-3 text-sm text-spunks-orange">
                {ranks.today > 0 && ranks.today <= 10 ? `${ordinal(ranks.today)} tonight` : "Saved"}
                {ranks.all > 0 && ranks.all <= 100 ? ` · ${ordinal(ranks.all)} all-time` : ""}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button type="button" onClick={playAgain} className={btnPrimary}>
                PLAY AGAIN
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
                <li className="py-6 text-center text-white/60 text-sm">{boardTab === "today" ? "Nobody's on the board tonight. Be the first." : "No scores yet. Be the first."}</li>
              )}
              {board?.[boardTab].slice(0, 10).map((e, i) => (
                <li key={`${e.name}-${e.score}-${i}`} className="flex items-center gap-3 py-2 font-heading font-semibold text-2xl tabular-nums">
                  <span className={`w-8 text-right ${i === 0 ? "text-spunks-orange" : "text-white/50"}`}>{i + 1}.</span>
                  <span className="tracking-[0.25em] flex-1">{e.name}</span>
                  {boardTab === "all" && <span className="text-xs font-sans font-normal text-white/40 tracking-normal">{e.date.slice(5).replace("-", "/")}</span>}
                  <span className={i === 0 ? "text-spunks-orange" : ""}>{e.score.toLocaleString()}</span>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => setPanel("none")} className={`${btnPrimary} w-full mt-4`}>
              {state === "idle" ? "LET'S PLAY" : "BACK"}
            </button>
          </div>
        </div>
      )}
      <span className="sr-only">{pad(score.score)}</span>
    </div>
  );
}
