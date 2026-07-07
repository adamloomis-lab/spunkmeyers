/*
 * SPUNKMEYERS TV BOARD — in-bar full-screen display (/tv)
 * Point any TV/Fire Stick/Chromecast browser at spunkmeyers.pub/tv, press F
 * for fullscreen. Rotating slides (specials, events, live games, weather,
 * sponsor ads) + live weather in the header, an NWS alert banner, and two
 * broadcast-style tickers (sports + events/messages) along the bottom.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  AlertTriangle,
} from "lucide-react";
import { IMAGES, LINKS, BUSINESS, getCurrentDayName } from "@/lib/constants";
import { SLIDES, SLIDE_MS, TICKER_MESSAGES, type Slide } from "@/lib/tvSlides";
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
interface DayFc {
  date: string;
  code: number;
  label: string;
  hiF: number;
  loF: number;
  pop: number | null;
}
interface Weather {
  current: { tempF: number; feelsF: number; windMph: number; code: number; label: string } | null;
  forecast: DayFc[] | null;
  alerts: { event: string; severity: string; headline: string; ends: string | null }[];
}

const TEAM_ACCENT: Record<string, string> = {
  browns: "#FB4F14",
  guardians: "#E50022",
  cavaliers: "#FDBB30",
  buckeyes: "#BB0000",
};

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const Icon =
    code === 0
      ? Sun
      : code === 1 || code === 2
        ? CloudSun
        : code === 45 || code === 48
          ? CloudFog
          : code >= 51 && code <= 57
            ? CloudDrizzle
            : (code >= 61 && code <= 67) || (code >= 80 && code <= 82)
              ? CloudRain
              : (code >= 71 && code <= 77) || code === 85 || code === 86
                ? CloudSnow
                : code >= 95
                  ? CloudLightning
                  : Cloud;
  return <Icon className={className} />;
}

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
  const [weather, setWeather] = useState<Weather | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const now = useClock();

  useEffect(() => {
    let active = true;
    fetch("/.netlify/functions/games")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!active) return;
        setGames((d.thisWeek?.length ? d.thisWeek : d.nextByTeam) || []);
      })
      .catch(() => active && setGamesFailed(true));
    fetch("/.netlify/functions/weather")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d: Weather) => active && setWeather(d))
      .catch(() => {});
    // Re-pull weather every 15 minutes so the board stays live all day.
    const wt = setInterval(() => {
      fetch("/.netlify/functions/weather")
        .then((r) => r.json())
        .then((d: Weather) => setWeather(d))
        .catch(() => {});
    }, 15 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(wt);
    };
  }, []);

  const alerts = weather?.alerts || [];

  const slides = useMemo(() => {
    const t = todayStr();
    return SLIDES.filter((s) => {
      if (s.type === "ad" && s.until && s.until < t) return false;
      if (s.type === "games") {
        if (gamesFailed) return false;
        if (games && games.length === 0) return false;
      }
      if (s.type === "weather" && weather && !weather.current) return false;
      return true;
    });
  }, [games, gamesFailed, weather]);

  const count = slides.length;

  useEffect(() => {
    if (paused || count === 0) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

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
  const cur = weather?.current;

  // ---- Ticker content ----
  const eventItems = useMemo(
    () =>
      SLIDES.filter((s): s is Extract<Slide, { type: "event" }> => s.type === "event").map(
        (s) => `${s.title} — ${s.when}`
      ),
    []
  );
  const bottomItems = [...eventItems, ...TICKER_MESSAGES];

  return (
    <div className="tv-root">
      <SEO title="Spunkmeyers TV Board" description="In-bar display board for Spunkmeyers Pub & Grill." path="/tv" noindex />

      {/* Weather alert banner (NWS) */}
      {alerts.length > 0 && (
        <div className="tv-alert">
          <AlertTriangle className="tv-alert-icon" />
          <div className="tv-alert-scroll">
            <div className="tv-alert-track">
              {[0, 1].map((k) => (
                <span key={k} className="tv-alert-text">
                  {alerts.map((a) => a.headline).join("   •   ")}
                  {"   •   "}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header: logo | live weather | clock */}
      <header className="tv-header">
        <img src={IMAGES.logo} alt="Spunkmeyers Pub & Grill" className="tv-logo" />
        <div className="tv-header-right">
          {cur && (
            <span className="tv-wx">
              <WeatherIcon code={cur.code} className="tv-wx-icon" />
              <span className="tv-wx-temp">{cur.tempF}&deg;</span>
              <span className="tv-wx-label">{cur.label}</span>
            </span>
          )}
          {todayHours && (
            <span className="tv-open">
              <span className="tv-dot" /> Open Today · {todayHours}
            </span>
          )}
          <span className="tv-clock">{clock}</span>
        </div>
      </header>

      {/* Thin slide progress under the header */}
      <div className="tv-progress">
        {slides.map((_, i) => (
          <span key={i} className={`tv-seg ${i === index ? "active" : ""} ${i < index ? "done" : ""}`}>
            <span className="tv-seg-fill" style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }} />
          </span>
        ))}
      </div>

      {/* Slides */}
      <main className="tv-stage">
        {slides.map((slide, i) => (
          <div key={slide.id} className={`tv-slide tv-slide--${slide.type} ${i === index ? "active" : ""}`} aria-hidden={i !== index}>
            <SlideView slide={slide} games={games} weather={weather} active={i === index} />
          </div>
        ))}
      </main>

      {/* Events ticker */}
      <div className="tv-tickers">
        <TickerRow label="Spunks" tone="spunks" items={bottomItems} />
      </div>

      {paused && <div className="tv-paused">Paused — press space to resume</div>}
    </div>
  );
}

function TickerRow({ label, tone, items }: { label: string; tone: "sports" | "spunks"; items: string[] }) {
  // Duration scales with content so speed stays readable regardless of length.
  const dur = Math.max(30, items.join(" ").length * 0.35);
  return (
    <div className={`tv-ticker tv-ticker--${tone}`}>
      <span className="tv-ticker-label">{label}</span>
      <div className="tv-ticker-viewport">
        <div className="tv-ticker-track" style={{ animationDuration: `${dur}s` }}>
          {[0, 1].map((copy) => (
            <span key={copy} className="tv-ticker-group" aria-hidden={copy === 1}>
              {items.map((it, i) => (
                <span key={i} className="tv-ticker-item">
                  <span className="tv-ticker-dot" />
                  {it}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideView({ slide, games, weather, active }: { slide: Slide; games: Game[] | null; weather: Weather | null; active: boolean }) {
  switch (slide.type) {
    case "welcome":
      return <WelcomeSlide active={active} />;

    case "event":
      return (
        <div className="tv-content tv-event">
          {slide.image && <div className="tv-event-img" style={{ backgroundImage: `url(${slide.image})` }} />}
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

    case "weather":
      return <WeatherSlide weather={weather} active={active} />;

    case "games":
      return <GamesSlide games={games} active={active} />;
  }
}

function WelcomeSlide({ active }: { active: boolean }) {
  const today = getCurrentDayName();
  const todayHours = BUSINESS.hours.find((h) => h.day === today)?.hours;
  return (
    <div className="tv-content tv-welcome">
      <img src={IMAGES.logo} alt="Spunkmeyers Pub & Grill" className={`tv-welcome-logo ${active ? "tv-rise" : ""}`} />
      <div className="tv-welcome-hours">
        <span className="tv-kicker">Open {today}</span>
        <div className="tv-welcome-time">{todayHours || "See you soon"}</div>
      </div>
    </div>
  );
}

function WeatherSlide({ weather, active }: { weather: Weather | null; active: boolean }) {
  const cur = weather?.current;
  const fc = weather?.forecast || [];
  return (
    <div className="tv-content tv-weather">
      <div className="tv-wx-now">
        <span className="tv-kicker">Wadsworth Right Now</span>
        <div className="tv-wx-now-row">
          {cur && <WeatherIcon code={cur.code} className="tv-wx-big-icon" />}
          <div className={`tv-wx-big-temp ${active ? "tv-rise" : ""}`}>{cur ? `${cur.tempF}°` : "—"}</div>
        </div>
        {cur && (
          <div className="tv-wx-meta">
            {cur.label} · Feels {cur.feelsF}° · <Wind className="tv-wx-wind" /> {cur.windMph} mph
          </div>
        )}
      </div>
      <div className="tv-wx-forecast">
        {fc.map((d, i) => {
          const dt = new Date(`${d.date}T12:00:00`);
          const dayLabel = i === 0 ? "Today" : dt.toLocaleDateString("en-US", { weekday: "short" });
          return (
            <div key={d.date} className="tv-wx-day">
              <div className="tv-wx-day-name">{dayLabel}</div>
              <WeatherIcon code={d.code} className="tv-wx-day-icon" />
              <div className="tv-wx-day-hi">{d.hiF}°</div>
              <div className="tv-wx-day-lo">{d.loF}°</div>
              {d.pop != null && d.pop >= 20 && <div className="tv-wx-day-pop">{d.pop}%</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
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
          const time = g.tbd ? "TBD" : d.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
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
    </div>
  );
}
