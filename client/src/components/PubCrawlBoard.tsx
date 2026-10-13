import { useEffect, useState } from "react";
import { Link } from "wouter";

/**
 * Spunks Pub Crawl leaderboard for the home page: tonight's top 5 and the
 * all-time top 5, pulled live from the scores API. Quietly renders nothing
 * useful (just the empty prompts) if the API is unreachable.
 */
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

const SHOW = 5;

function Column({ title, rows, showDate }: { title: string; rows: Entry[] | null; showDate?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-[#E8601C] mb-3">{title}</div>
      <ol className="divide-y divide-white/10">
        {rows === null && <li className="py-3 text-sm text-[#999]">Loading…</li>}
        {rows && rows.length === 0 && <li className="py-3 text-sm text-[#999]">Nobody yet. Be the first.</li>}
        {rows?.slice(0, SHOW).map((e, i) => (
          <li key={`${e.name}-${e.score}-${i}`} className="flex items-center gap-3 py-2 font-heading text-xl tabular-nums">
            <span className={`w-6 text-right ${i === 0 ? "text-[#E8601C]" : "text-[#777]"}`}>{i + 1}.</span>
            <span className="tracking-[0.25em] text-[#F5F0EB]">{e.name}</span>
            {showDate && <span className="text-xs font-sans font-normal text-[#777] tracking-normal">{e.date.slice(5).replace("-", "/")}</span>}
            <span className="flex-1 border-b border-dotted border-white/20 translate-y-[-0.3em]" />
            <span className={i === 0 ? "text-[#E8601C]" : "text-[#F5F0EB]"}>{e.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function PubCrawlBoard({ className = "" }: { className?: string }) {
  const [board, setBoard] = useState<Board | null | "error">(null);

  useEffect(() => {
    let live = true;
    fetch("/api/pub-crawl-scores", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d: Board) => live && setBoard(d))
      .catch(() => live && setBoard("error"));
    return () => {
      live = false;
    };
  }, []);

  const today = board === null ? null : board === "error" ? [] : board.today;
  const all = board === null ? null : board === "error" ? [] : board.all;

  return (
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-7 ${className}`}>
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h3 className="font-heading text-2xl font-bold text-white">Top Scores</h3>
        <Link href="/pub-crawl" className="font-heading text-xs font-semibold uppercase tracking-widest text-[#E8601C] hover:text-[#F07A3A] transition-colors">
          Beat them →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <Column title="Tonight" rows={today} />
        <Column title="All-time" rows={all} showDate />
      </div>
      <p className="mt-5 text-xs text-[#777]">Score 50 or more to put your initials on the board.</p>
    </div>
  );
}
