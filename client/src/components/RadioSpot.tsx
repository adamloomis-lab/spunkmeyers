import { useEffect, useRef, useState } from "react";
import { Pause, Play, Radio } from "lucide-react";

// The pub's radio spot, running on WQMX. A slim band, not a card: one line of
// copy, one control, a hairline progress. Self-hosted mp3; user-initiated only.
const SPOT_SRC = "/audio/wqmx-fall-2026.mp3";

export default function RadioSpot() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop cleanly on unmount (route change).
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = () => {
    let a = audioRef.current;
    if (!a) {
      a = new Audio(SPOT_SRC);
      a.preload = "none";
      a.ontimeupdate = () => {
        if (a && a.duration > 0) setProgress(a.currentTime / a.duration);
      };
      a.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
      a.onerror = () => setPlaying(false);
      audioRef.current = a;
    }
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <section className="bg-[#111111] border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause our radio spot" : "Play our radio spot"}
            aria-pressed={playing}
            className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-full bg-[#E8601C] text-white shadow-[0_10px_24px_-10px_rgba(232,96,28,0.8)] transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg sm:text-xl text-[#F5F0EB] tracking-wide leading-tight normal-case">
              Heard us on WQMX?
            </h2>
            <p className="text-[#999] text-sm sm:text-base mt-0.5">
              That's us. Thirty seconds of what Wadsworth already knows.
            </p>
            {/* Hairline progress, only meaningful while playing */}
            <div className="mt-2.5 h-[3px] w-full max-w-sm rounded-full bg-white/8" aria-hidden>
              <div
                className="h-full rounded-full bg-[#E8601C] transition-[width] duration-300 ease-linear"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
          <Radio size={26} className="hidden sm:block shrink-0 text-[#E8601C]/60" aria-hidden />
        </div>
      </div>
    </section>
  );
}
