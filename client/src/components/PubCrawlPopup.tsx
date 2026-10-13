import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import PixelArt from "@/components/PixelArt";

/**
 * Home page pop-up for Spunks Pub Crawl. Slides in a couple of seconds
 * after the page loads, once per day per browser, and gets out of the way
 * with a tap anywhere outside, the X, Escape, or "Maybe later".
 */
const KEY = "spc-popup-seen";
const SHOW_AFTER_MS = 2500;

function today(): string {
  return new Date().toDateString();
}

export default function PubCrawlPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(KEY);
    } catch {
      /* private mode */
    }
    if (seen === today()) return;
    const t = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, today());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spc-popup-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md bg-[#111111] border border-white/10 ring-4 ring-[#E8601C]/50 rounded-2xl shadow-2xl shadow-black/60 p-6 sm:p-8 text-center crawl-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-[#F5F0EB] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center items-end gap-3 bg-[#F5F0EB] rounded-xl px-4 pt-5 pb-3 mb-5">
          <PixelArt name="jump" scale={4} className="block" />
          <PixelArt name="burger" scale={3} className="block" />
          <PixelArt name="peyton" scale={3} className="block" />
        </div>

        <div className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-[#E8601C]">New · Free to play</div>
        <h2 id="spc-popup-title" className="mt-2 text-4xl sm:text-5xl font-bold text-white leading-[1.05] tracking-tight">
          Spunks <span className="text-[#E8601C]">Pub Crawl</span>
        </h2>
        <p className="mt-3 text-[#F5F0EB]/80 text-base leading-relaxed">
          Kevin's on the run down High Street. Jump the band, dodge the burgers and wings, and put your initials on the pub leaderboard.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/pub-crawl" onClick={close} className="btn-premium btn-premium-pulse w-full justify-center">
            Play Now
          </Link>
          <button
            type="button"
            onClick={close}
            className="font-heading text-sm font-semibold uppercase tracking-widest text-[#999] hover:text-[#F5F0EB] py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
