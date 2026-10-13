import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import PixelArt from "@/components/PixelArt";
import StackArt from "@/components/StackArt";

/**
 * Home page pop-up for the Spunks Arcade. Slides in a couple of seconds
 * after the page loads, once per day per browser, offers both games, and
 * gets out of the way with a tap anywhere outside, the X, Escape, or
 * "Maybe later".
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

  const tile = "group block rounded-xl overflow-hidden border border-white/10 hover:border-[#E8601C] transition-colors text-left";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spc-popup-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg bg-[#111111] border border-white/10 ring-4 ring-[#E8601C]/50 rounded-2xl shadow-2xl shadow-black/60 p-6 sm:p-8 text-center crawl-pop"
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

        <div className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-[#E8601C]">New · Free to play · No app</div>
        <h2 id="spc-popup-title" className="mt-2 text-4xl sm:text-5xl font-bold text-white leading-[1.05] tracking-tight">
          Spunks <span className="text-[#E8601C]">Arcade</span>
        </h2>
        <p className="mt-2 text-[#F5F0EB]/75 text-sm sm:text-base leading-relaxed">Two games on your phone. Top scores go up on the bar TVs.</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/pub-crawl" onClick={close} className={tile}>
            <div className="bg-[#F5F0EB] flex items-end justify-center gap-2 px-3 pt-4 pb-2 h-28">
              <PixelArt name="jump" scale={3} className="block" />
              <PixelArt name="burger" scale={2} className="block" />
              <PixelArt name="peyton" scale={2} className="block" />
            </div>
            <div className="p-3 bg-black">
              <div className="font-heading text-lg font-bold uppercase text-white leading-tight">
                Pub <span className="text-[#E8601C]">Crawl</span>
              </div>
              <div className="text-xs text-[#999] mt-0.5">Kevin runs. Jump the band, grab an SPX.</div>
              <div className="mt-2 font-heading text-xs font-semibold uppercase tracking-widest text-[#E8601C] group-hover:text-[#F07A3A]">Play →</div>
            </div>
          </Link>
          <Link href="/stack" onClick={close} className={tile}>
            <div className="bg-black border-b border-white/10 flex items-end justify-center px-3 pt-4 pb-2 h-28">
              <StackArt scale={2} className="block" />
            </div>
            <div className="p-3 bg-black">
              <div className="font-heading text-lg font-bold uppercase text-white leading-tight">
                Spunks <span className="text-[#E8601C]">Stack</span>
              </div>
              <div className="text-xs text-[#999] mt-0.5">Old-school falling blocks. Outlast last call.</div>
              <div className="mt-2 font-heading text-xs font-semibold uppercase tracking-widest text-[#E8601C] group-hover:text-[#F07A3A]">Play →</div>
            </div>
          </Link>
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-4 font-heading text-sm font-semibold uppercase tracking-widest text-[#999] hover:text-[#F5F0EB] py-1 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
