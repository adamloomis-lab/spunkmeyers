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

const TEAM_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "browns", label: "Browns" },
  { key: "guardians", label: "Guardians" },
  { key: "cavaliers", label: "Cavs" },
  { key: "buckeyes", label: "Buckeyes" },
];

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
  const [teamFilter, setTeamFilter] = useState<string>("all");

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

  const rawThisWeek = data?.thisWeek ?? [];
  const rawNextByTeam = data?.nextByTeam ?? [];
  const thisWeek =
    teamFilter === "all" ? rawThisWeek : rawThisWeek.filter((g) => g.key === teamFilter);
  const comingUp =
    teamFilter === "all"
      ? rawNextByTeam.filter((g) => !rawThisWeek.some((w) => w.key === g.key))
      : rawNextByTeam.filter((g) => g.key === teamFilter && !thisWeek.some((w) => w.date === g.date));
  const hasGames = thisWeek.length > 0 || comingUp.length > 0;

  // Which team keys have at least one upcoming game (used to disable empty filters).
  const availableKeys = new Set<string>();
  rawThisWeek.forEach((g) => availableKeys.add(g.key));
  rawNextByTeam.forEach((g) => availableKeys.add(g.key));

  return (
    <section data-narrate="home-sports" className="bg-[#0f0f0f] py-12 sm:py-20 border-y border-[#E8601C]/15">
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

        {/* Team filter pills */}
        {status === "ok" && (rawThisWeek.length > 0 || rawNextByTeam.length > 0) && (
          <div
            className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8"
            role="group"
            aria-label="Filter games by team"
          >
            {TEAM_FILTERS.map((f) => {
              const active = teamFilter === f.key;
              const disabled = f.key !== "all" && !availableKeys.has(f.key);
              const accent = TEAM_ACCENT[f.key] || "#E8601C";
              return (
                <button
                  key={f.key}
                  onClick={() => !disabled && setTeamFilter(f.key)}
                  disabled={disabled}
                  aria-pressed={active}
                  className={`font-heading text-xs sm:text-sm uppercase tracking-[0.08em] px-4 py-2 rounded-full border transition-colors ${
                    active
                      ? "text-white border-transparent"
                      : disabled
                        ? "text-white/25 border-white/8 cursor-not-allowed"
                        : "text-[#bbb] border-white/12 bg-white/[0.04] hover:text-white hover:border-[#E8601C]/60"
                  }`}
                  style={active ? { background: accent, borderColor: accent } : undefined}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

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
