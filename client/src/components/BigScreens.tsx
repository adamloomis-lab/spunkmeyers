import { useEffect, useState } from "react";
import { LINKS } from "@/lib/constants";

interface Game {
  key: string;
  team: string;
  league: string;
  date: string;
  homeAway: string;
  opponent: string;
  opponentLogo: string;
  tbd?: boolean;
}
interface GamesData {
  thisWeek: Game[];
  nextByTeam: Game[];
}

const TEAM_ACCENT: Record<string, string> = {
  browns: "#FB4F14",
  guardians: "#E50022",
  cavaliers: "#FDBB30",
  buckeyes: "#BB0000",
};

function formatGame(iso: string, tbd?: boolean) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = tbd
    ? "Time TBD"
    : d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
  return { day, time };
}

export default function BigScreens() {
  const [data, setData] = useState<GamesData | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetch("/.netlify/functions/games")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((d: GamesData) => {
        if (active) {
          setData(d);
          setStatus("ok");
        }
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  const thisWeek = data?.thisWeek ?? [];
  const comingUp = (data?.nextByTeam ?? []).filter((g) => !thisWeek.some((w) => w.key === g.key));
  const hasGames = thisWeek.length > 0 || comingUp.length > 0;

  return (
    <section className="bg-[#0f0f0f] py-12 sm:py-20 border-y border-[#E8601C]/15">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 fade-up">
          <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-3 block">
            On The Big Screens
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">This Week&rsquo;s Games</h2>
          <p className="text-[#999] mt-3 max-w-xl mx-auto">
            Every Cleveland game and the Buckeyes, on our screens. Updated automatically &mdash; come watch with us.
          </p>
        </div>

        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#1c1c1c] border border-white/5 rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        )}

        {/* Fallback when the schedule can't load or there's nothing scheduled */}
        {(status === "error" || (status === "ok" && !hasGames)) && (
          <div className="bg-[#1c1c1c] border border-white/8 rounded-lg p-8 text-center max-w-xl mx-auto">
            <p className="text-[#F5F0EB] text-lg mb-2">We&rsquo;ve got every big game on.</p>
            <p className="text-[#999] mb-6">
              Check our Facebook for this week&rsquo;s lineup, or call us at (330) 334-5080.
            </p>
            <a
              href={LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm py-3 px-8"
            >
              See What&rsquo;s On
            </a>
          </div>
        )}

        {/* Game cards */}
        {status === "ok" && hasGames && (
          <>
            {thisWeek.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {thisWeek.map((g, i) => {
                  const accent = TEAM_ACCENT[g.key] || "#E8601C";
                  const { day, time } = formatGame(g.date, g.tbd);
                  return (
                    <div key={i} className="bg-[#1c1c1c] border border-white/8 rounded-lg overflow-hidden">
                      <div className="h-1" style={{ background: accent }} />
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className="text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm text-white"
                            style={{ background: accent }}
                          >
                            {g.league}
                          </span>
                          <span className="text-[#888] text-xs font-heading uppercase tracking-wider">{day}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {g.opponentLogo && (
                            <img src={g.opponentLogo} alt="" className="w-10 h-10 object-contain flex-shrink-0" loading="lazy" />
                          )}
                          <div className="min-w-0">
                            <p className="font-heading text-white text-lg leading-tight truncate">{g.team}</p>
                            <p className="text-[#bbb] text-sm truncate">
                              {g.homeAway === "home" ? "vs" : "@"} {g.opponent}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                          <span className="text-[#E8601C] font-heading text-base">{time}</span>
                          <span
                            className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                              g.homeAway === "home"
                                ? "bg-[#E8601C]/15 text-[#E8601C]"
                                : "bg-white/10 text-white/60"
                            }`}
                          >
                            {g.homeAway === "home" ? "Home" : "Away"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coming up for teams with no game this week (e.g., off-season) */}
            {comingUp.length > 0 && (
              <div className="mt-8">
                <p className="font-heading text-sm text-[#888] uppercase tracking-[0.2em] mb-4 text-center">
                  Coming Up
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {comingUp.map((g, i) => {
                    const accent = TEAM_ACCENT[g.key] || "#E8601C";
                    const { day } = formatGame(g.date, g.tbd);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-[#1c1c1c] border border-white/8 rounded-full pl-3 pr-4 py-2"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
                        <span className="text-[#F5F0EB] text-sm font-heading uppercase tracking-wide">{g.team}</span>
                        <span className="text-[#888] text-sm">
                          {day} {g.homeAway === "home" ? "vs" : "@"} {g.opponent}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
