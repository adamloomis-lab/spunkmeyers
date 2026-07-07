/*
 * SPUNKMEYERS TV BOARD — in-bar full-screen slideshow (/tv)
 * Point any TV/Fire Stick/Chromecast browser at spunkmeyers.pub/tv and
 * go fullscreen. Auto-rotates specials, events, live games, and sponsor
 * ads from client/src/lib/tvSlides.ts. Loops forever.
 */
import { useEffect, useMemo, useState } from "react";
import { IMAGES, LINKS, BUSINESS, getCurrentDayName } from "@/lib/constants";
import { SLIDES, SLIDE_MS, type Slide } from "@/lib/tvSlides";
import SEO from "@/components/SEO";

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

const TEAM_ACCENT: Record<string, string> = {
  browns: "#FB4F14",
  guardians: "#E50022",
  cavaliers: "#FDBB30",
  buckeyes: "#BB0000",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function TV() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [gamesFailed, setGamesFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const now = useClock();

  // Fetch the live game board once (used by the "games" slide).
  useEffect(() => {
    let active = true;
    fetch("/.netlify/functions/games")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!active) return;
        const list: Game[] = (d.thisWeek?.length ? d.thisWeek : d.nextByTeam) || [];
        setGames(list);
      })
      .catch(() => active && setGamesFailed(true));
    return () => {
      active = false;
    };
  }, []);

  // Build the live slide list: drop expired ads, and drop the games slide if
  // there's nothing to show so the board never displays a blank screen.
  const slides = useMemo(() => {
    const t = todayStr();
    return SLIDES.filter((s) => {
      if (s.type === "ad" && s.until && s.until < t) return false;
      if (s.type === "games") {
        if (gamesFailed) return false;
        if (games && games.length === 0) return false;
      }
      return true;
    });
  }, [games, gamesFailed]);

  const count = slides.length;

  // Auto-advance.
  useEffect(() => {
    if (paused || count === 0) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  // Keep index in range if the slide list shrinks (e.g. games slide drops out).
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  // Keyboard controls for whoever sets up the TV.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % count);
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + count) % count);
      } else if (e.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  const clock = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const today = getCurrentDayName();
  const todayHours = BUSINESS.hours.find((h) => h.day === today)?.hours;

  return (
    <div className="tv-root">
      <SEO
        title="Spunkmeyers TV Board"
        description="In-bar display board for Spunkmeyers Pub & Grill."
        path="/tv"
        noindex
      />
      {/* Persistent header */}
      <header className="tv-header">
        <img src={IMAGES.logo} alt="Spunkmeyers Pub & Grill" className="tv-logo" />
        <div className="tv-header-right">
          {todayHours && (
            <span className="tv-open">
              <span className="tv-dot" /> Open Today · {todayHours}
            </span>
          )}
          <span className="tv-clock">{clock}</span>
        </div>
      </header>

      {/* Slides */}
      <main className="tv-stage">
        {slides.map((slide, i) => (
          <div key={slide.id} className={`tv-slide ${i === index ? "active" : ""}`} aria-hidden={i !== index}>
            <SlideView slide={slide} games={games} active={i === index} />
          </div>
        ))}
      </main>

      {/* Segmented progress */}
      <footer className="tv-progress">
        {slides.map((_, i) => (
          <span key={i} className={`tv-seg ${i === index ? "active" : ""} ${i < index ? "done" : ""}`}>
            <span className="tv-seg-fill" style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }} />
          </span>
        ))}
      </footer>

      {paused && <div className="tv-paused">Paused — press space to resume</div>}
    </div>
  );
}

function SlideView({ slide, games, active }: { slide: Slide; games: Game[] | null; active: boolean }) {
  switch (slide.type) {
    case "event":
      return (
        <div className="tv-content tv-event">
          {slide.image && (
            <div className="tv-event-img" style={{ backgroundImage: `url(${slide.image})` }} />
          )}
          <div className="tv-event-body">
            <span className="tv-kicker">{slide.when}</span>
            <h2 className={`tv-title ${active ? "tv-rise" : ""}`}>{slide.title}</h2>
            {slide.detail && <p className="tv-detail">{slide.detail}</p>}
          </div>
        </div>
      );

    case "special":
      return (
        <div className="tv-content tv-special">
          {slide.when && <span className="tv-kicker">{slide.when}</span>}
          <h2 className={`tv-title ${active ? "tv-rise" : ""}`}>{slide.title}</h2>
          {slide.price && <div className="tv-price">{slide.price}</div>}
          {slide.detail && <p className={`tv-detail ${slide.sample ? "tv-sample" : ""}`}>{slide.detail}</p>}
        </div>
      );

    case "promo":
      return (
        <div className="tv-content tv-promo">
          <span className="tv-kicker">{slide.kicker}</span>
          <h2 className={`tv-title ${active ? "tv-rise" : ""}`}>{slide.title}</h2>
          {slide.detail && <p className="tv-detail">{slide.detail}</p>}
          {slide.footer && <div className="tv-footer-url">{slide.footer}</div>}
        </div>
      );

    case "ad":
      return (
        <div className="tv-content tv-ad">
          <span className="tv-ad-flag">Sponsored</span>
          {slide.image && <img src={slide.image} alt={slide.sponsor} className="tv-ad-img" />}
          <h2 className={`tv-title ${active ? "tv-rise" : ""}`}>{slide.sponsor}</h2>
          {slide.tagline && <p className="tv-ad-tagline">{slide.tagline}</p>}
          {slide.detail && <p className="tv-detail">{slide.detail}</p>}
        </div>
      );

    case "games":
      return <GamesSlide games={games} active={active} />;
  }
}

function GamesSlide({ games, active }: { games: Game[] | null; active: boolean }) {
  const list = (games || []).slice(0, 6);
  return (
    <div className="tv-content tv-games">
      <span className="tv-kicker">On The Big Screens</span>
      <h2 className={`tv-title ${active ? "tv-rise" : ""}`}>This Week&rsquo;s Games</h2>
      <div className="tv-games-grid">
        {list.map((g, i) => {
          const accent = TEAM_ACCENT[g.key] || "#E8601C";
          const d = new Date(g.date);
          const day = d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric" });
          const time = g.tbd
            ? "TBD"
            : d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
          return (
            <div key={i} className="tv-game" style={{ borderColor: accent }}>
              {g.opponentLogo && <img src={g.opponentLogo} alt="" className="tv-game-logo" />}
              <div className="tv-game-info">
                <div className="tv-game-team">{g.team}</div>
                <div className="tv-game-opp">
                  {g.homeAway === "home" ? "vs" : "@"} {g.opponent}
                </div>
                <div className="tv-game-when" style={{ color: accent }}>
                  {day} · {time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="tv-footer-url">{LINKS.facebook.replace("https://www.", "")}</div>
    </div>
  );
}
