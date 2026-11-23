/*
 * Spunkmeyers Pub & Grill - Homepage
 * Fonts: Oswald headlines, Lora body (global via CSS)
 * All photos are client-provided originals only
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { IMAGES, VIDEO, SPX, LINKS, BUSINESS, SPORTS_IMAGES, FOOD_IMAGES, PHOTO_STRIP, getCurrentDayName } from "@/lib/constants";

import { Link } from "wouter";
import { Beer, Flame, Sun, Calendar, ChevronLeft, ChevronRight, Star, ChevronDown, Volume2, VolumeX } from "lucide-react";
import SEO, { localBusinessSchema } from "@/components/SEO";
import BigScreens from "@/components/BigScreens";
import RadioSpot from "@/components/RadioSpot";
import PixelArt from "@/components/PixelArt";
import PubCrawlBoard from "@/components/PubCrawlBoard";
import StackArt from "@/components/StackArt";
import ChristmasHero, { ChristmasTour } from "@/components/holiday/ChristmasHero";
import { ChristmasLights, ChristmasSnow } from "@/components/holiday/ChristmasDecor";
import { useChristmasSeason } from "@/lib/holiday";
import { Pause, Play, Snowflake } from "lucide-react";

function usePageEffects(revealKey: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const handleScroll = () => {
      const els = root.querySelectorAll<HTMLElement>("[data-parallax]");
      els.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.3");
        const rect = el.getBoundingClientRect();
        const offset = rect.top * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Reveal each element as it scrolls into view (one-shot).
    const revealEls = root.querySelectorAll<HTMLElement>(
      ".fade-up, .fade-left, .fade-right, .fade-scale"
    );
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => observer!.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("visible"));
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer?.disconnect();
    };
  }, [revealKey]);
  return ref;
}

function SportsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SPORTS_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sports-carousel">
      {SPORTS_IMAGES.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.label}
          className={i === activeIndex ? "active" : ""}
          loading="lazy"
        />
      ))}
    </div>
  );
}

function FoodShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FOOD_IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      {FOOD_IMAGES.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.label}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
          loading="lazy"
        />
      ))}
      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        {FOOD_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? "bg-[#E8601C] w-6" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* SPX American Lager: the pub's own lager. Photo of the pour at the bar plus
   the teaser reel Spunks cut for it. Reel autoplays muted; the button unmutes.
   Facts come from the launch poster on the wall at Spunks (4.7% ABV, 16 oz,
   brewed in Medina OH, tapped Sept 9 2026, launch night $10 glass / $5 refills). */
const SPX_LAUNCH_END = new Date("2026-09-09T23:59:59-04:00").getTime();

function SpxLager() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const launchNight = Date.now() <= SPX_LAUNCH_END;

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  return (
    <section aria-labelledby="spx-heading" className="relative bg-[#111111] overflow-hidden border-b border-[#E8601C]/15">
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-[#E8601C]/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Copy */}
          <div className="lg:col-span-5 text-center lg:text-left fade-up">
            <h2
              id="spx-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5"
            >
              SPX<br />American Lager.
            </h2>
            <p className="text-lg sm:text-xl text-[#F5F0EB]/80 leading-relaxed mb-6">
              Spunks' own American lager, brewed in Medina and {launchNight ? "tapped" : "on tap since"} September 9.
              Your new favorite beer. Pull up a stool and ask for an SPX.
            </p>
            <dl className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 mb-6">
              {[
                { label: "ABV", value: "4.7%" },
                { label: "Pour", value: "16 oz" },
                { label: "Brewed in", value: "Medina, OH" },
              ].map((f) => (
                <div key={f.label} className="text-center lg:text-left">
                  <dt className="font-heading text-xs uppercase tracking-[0.2em] text-[#999]">{f.label}</dt>
                  <dd className="font-heading text-2xl sm:text-3xl text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
            {launchNight && (
              <p className="inline-block border border-[#E8601C]/40 bg-[#E8601C]/10 text-[#F5F0EB] px-4 py-3 mb-8 text-base sm:text-lg leading-snug">
                Launch night, Wednesday, September 9: <span className="text-[#E8601C] font-heading uppercase tracking-wide">$10 keeps the glass, $5 refills all night.</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={LINKS.beerList}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium"
              >
                See the Tap List
              </a>
              <a href={LINKS.directions} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                Get Directions
              </a>
            </div>
          </div>

          {/* Photo + reel, both portrait so they read as a pair */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:gap-5 max-w-[640px] mx-auto lg:max-w-none">
              <figure className="fade-scale relative aspect-[9/16] rounded-xl overflow-hidden border border-[#E8601C]/30 shadow-2xl shadow-black/50 lg:-rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src={SPX.photo}
                  alt="A pint of SPX American Lager on the bar at Spunkmeyers, foam over the rim, TVs glowing behind it"
                  className="absolute inset-0 w-full h-full object-cover"
                  width={1050}
                  height={1400}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent" />
              </figure>

              <div
                className="fade-scale relative aspect-[9/16] rounded-xl overflow-hidden border border-[#E8601C]/30 shadow-2xl shadow-black/50 bg-black lg:rotate-1 hover:rotate-0 transition-transform duration-500 lg:mt-8"
                style={{ transitionDelay: "120ms" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={SPX.poster}
                  className="absolute inset-0 w-full h-full object-cover"
                  aria-label="SPX American Lager teaser: are you ready for your new favorite beer"
                >
                  <source src={SPX.video} type="video/mp4" />
                </video>
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={!muted}
                  aria-label={muted ? "Turn sound on" : "Turn sound off"}
                  className="absolute bottom-3 right-3 z-10 w-11 h-11 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-[#E8601C] hover:border-[#E8601C] transition-colors duration-300"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const marqueeText = "COLD BEER \u00B7 SMASH BURGERS \u00B7 BUCK NAKED BAR \u00B7 18 TAPS \u00B7 WADSWORTH'S PUB \u00B7 LIVE EVENTS \u00B7 BROWNS BACKER BAR \u00B7 OH-IO \u00B7 ";

const reviews = [
  {
    text: "Just wanted to give a shout out and let you know how Amazing my food was last night! I definitely thought the Sweet Chili Shrimp bowl was a keeper!",
    author: "Jennifer Piatt",
    rating: 5,
  },
  {
    text: "This isn't just a review; it's a public service announcement. If you see a bartender named Maddy, clear your calendar. She's a wizard behind the bar, a drink-making sorceress who can turn a Tuesday night into a legendary saga.",
    author: "Marc Clendaniel",
    rating: 5,
  },
  {
    text: "If you're looking for a good time and some killer cocktails, you need to find Alex, Nikki, and Payton. They were slinging drinks like it was a high-stakes competition, and honestly, they deserved to win.",
    author: "Marc Clendaniel",
    rating: 5,
  },
  {
    text: "I have loved this place for over 10 years! Great place to hang with the locals, meet new people and just celebrate good times! Plus the Christmas vibe was off the charts!",
    author: "Victoria VBRC",
    rating: 5,
  },
  {
    text: "Nicole is one of the best bartenders you'll ever meet. She knows her craft and always goes the extra mile.",
    author: "Adam L.",
    rating: 5,
  },
  {
    text: "Spunkmeyer Special sandwich -- by far the best bologna sandwich ever. Fish tacos were delicious as well.",
    author: "Adelia C.",
    rating: 5,
  },
];

function ReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCards = () => {
      if (window.innerWidth < 640) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  const maxIndex = Math.max(0, reviews.length - cardsPerView);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  }, [maxIndex]);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / cardsPerView}%` }}
            >
              <div className="bg-[#1a1a1a] p-6 sm:p-8 border border-white/5 h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-[#E8601C] text-[#E8601C]" />
                  ))}
                </div>
                <p className="text-[#F5F0EB]/90 text-base leading-relaxed mb-6 italic flex-1">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-[#E8601C]" />
                  <span className="text-[#F5F0EB] font-semibold text-sm">{review.author}</span>
                  <span className="text-[#666] text-xs">Google Review</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#F5F0EB] hover:border-[#E8601C] hover:text-[#E8601C] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {[...Array(maxIndex + 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-[#E8601C] w-6" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={currentIndex === maxIndex}
          className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#F5F0EB] hover:border-[#E8601C] hover:text-[#E8601C] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// 2025 Cleveland Browns Season Results
const brownsSchedule = [
  { week: 1, opponent: "vs. Cincinnati Bengals", result: "L", score: "16-17" },
  { week: 2, opponent: "at Baltimore Ravens", result: "L", score: "17-41" },
  { week: 3, opponent: "vs. Green Bay Packers", result: "W", score: "13-10" },
  { week: 4, opponent: "at Detroit Lions", result: "L", score: "10-34" },
  { week: 5, opponent: "vs. Minnesota Vikings (London)", result: "L", score: "17-21" },
  { week: 6, opponent: "at Pittsburgh Steelers", result: "L", score: "9-23" },
  { week: 7, opponent: "vs. Miami Dolphins", result: "W", score: "31-6" },
  { week: 8, opponent: "at New England Patriots", result: "L", score: "13-32" },
  { week: 9, opponent: "BYE", result: "", score: "" },
  { week: 10, opponent: "at New York Jets", result: "L", score: "20-27" },
  { week: 11, opponent: "vs. Baltimore Ravens", result: "L", score: "16-23" },
  { week: 12, opponent: "at Las Vegas Raiders", result: "W", score: "24-10" },
  { week: 13, opponent: "vs. San Francisco 49ers", result: "L", score: "8-26" },
  { week: 14, opponent: "vs. Tennessee Titans", result: "L", score: "29-31" },
  { week: 15, opponent: "at Chicago Bears", result: "L", score: "3-31" },
  { week: 16, opponent: "vs. Buffalo Bills", result: "L", score: "20-23" },
  { week: 17, opponent: "vs. Pittsburgh Steelers", result: "W", score: "13-6" },
  { week: 18, opponent: "at Cincinnati Bengals", result: "W", score: "20-18" },
];

function CountdownTimer() {
  // UPDATE NEEDED: Replace countdown target date with official 2026 preseason Week 1 date/time when NFL schedule is released.
  const targetDate = new Date("2026-08-06T19:00:00-04:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isGameDay, setIsGameDay] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setIsGameDay(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isGameDay) {
    return (
      <div className="text-center py-6">
        <p className="font-heading text-4xl sm:text-5xl text-white uppercase tracking-wider animate-pulse">
          Game Day. Get Here.
        </p>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="text-center">
      <p className="font-heading text-sm text-white/60 uppercase tracking-[0.2em] mb-4">
        Countdown to 2026 Preseason Kickoff
      </p>
      <div className="flex justify-center gap-3 sm:gap-5">
        {units.map((u, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1a1a1a] border border-[#E8601C]/40 rounded-lg flex items-center justify-center shadow-lg shadow-black/30">
              <span className="font-heading text-2xl sm:text-3xl text-white tabular-nums">
                {String(u.value).padStart(2, "0")}
              </span>
            </div>
            <span className="font-heading text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mt-2">
              {u.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-white/40 text-xs mt-4 italic">Date subject to official NFL schedule release.</p>
    </div>
  );
}

function SeasonAccordion() {
  const [open, setOpen] = useState(false);
  const wins = brownsSchedule.filter((g) => g.result === "W").length;
  const losses = brownsSchedule.filter((g) => g.result === "L").length;

  return (
    <div className="border border-[#E8601C]/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#1a1a1a] hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-heading text-base sm:text-lg text-white uppercase tracking-wide">
            2025 Cleveland Browns Season Results
          </span>
          <span className="text-white/40 text-sm hidden sm:inline">({wins}-{losses})</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#E8601C] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bg-[#111] px-3 sm:px-5 py-4">
          <div className="grid gap-1">
            {brownsSchedule.map((game) => (
              <div
                key={game.week}
                className={`flex items-center justify-between py-2.5 px-3 rounded text-sm sm:text-base ${
                  game.result === "W"
                    ? "bg-green-900/20 ring-1 ring-inset ring-green-500/20"
                    : game.result === "L"
                    ? "bg-red-900/15 ring-1 ring-inset ring-red-500/20"
                    : "bg-white/[0.04] ring-1 ring-inset ring-white/8"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-heading text-white/40 text-xs w-12">WK {game.week}</span>
                  <span className="text-white/90">{game.opponent}</span>
                </div>
                {game.result && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-heading text-xs px-2 py-0.5 rounded ${
                        game.result === "W"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/15 text-red-400/80"
                      }`}
                    >
                      {game.result}
                    </span>
                    <span className="text-white/60 font-mono text-sm">{game.score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <a
              href="https://www.clevelandbrowns.com/schedule/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E8601C] hover:text-[#ff7a3a] text-sm font-heading uppercase tracking-wider transition-colors"
            >
              View Full Schedule on ClevelandBrowns.com &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function CavsSection() {
  return (
    <section id="cavs" className="cavs-section" aria-labelledby="cavs-heading">
      <div className="cavs-inner">
        <div className="cavs-photo fade-left">
          <img src="/img/cavs-2026.webp" alt="Cleveland Cavaliers players in white Cavs jerseys" width="1200" height="630" loading="lazy" />
          <span className="cavs-photo-label">Wine. Gold. Game on.</span>
        </div>
        <div className="cavs-copy fade-right">
          <p className="cavs-eyebrow">Cavs basketball at Spunks</p>
          <h2 id="cavs-heading">CLEVELAND<br /><span>CAVALIERS.</span></h2>
          <p>Big screens. Cold beer. A crowd that gets it. Grab your crew and settle in for Cavs basketball at Spunkmeyers.</p>
          <div className="cavs-actions">
            <a href="https://www.nba.com/cavaliers/schedule" target="_blank" rel="noopener noreferrer" className="cavs-schedule"><Calendar size={18} aria-hidden="true" /> Cavs Schedule</a>
            <Link href="/menu" className="cavs-menu">View the Menu <span aria-hidden="true">→</span></Link>
          </div>
          <p className="cavs-note">Your Ohio sports headquarters. Right here in Wadsworth.</p>
        </div>
      </div>
    </section>
  );
}

function BrownsBackerBar() {
  return (
    <section className="relative overflow-hidden">
      {/* Background: helmets image with heavy overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${IMAGES.brownsHelmets})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a0a]/95 via-[#1a0f05]/90 to-[#1a1a1a]" />

      {/* Orange accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E8601C] to-transparent" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header with Backers logo */}
        <div className="fade-up text-center mb-10 sm:mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight mb-4">
            Official Cleveland Browns Backer Bar
          </h2>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Catch every game at Spunkmeyers. We're your official home for Browns football in Wadsworth.
          </p>
        </div>

        {/* Player images row */}
        <div className="fade-up flex justify-center gap-4 sm:gap-8 mb-10 sm:mb-14" style={{ transitionDelay: "100ms" }}>
          <div className="w-32 h-44 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 border-[#E8601C]/30 shadow-xl shadow-black/40 -rotate-2 hover:rotate-0 transition-transform duration-500">
            <img
              src={IMAGES.storefrontDawgs}
              alt="Spunkmeyers storefront with the Dawgs Gotta Eat bone and Browns Backers banner"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="w-32 h-44 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 border-[#E8601C]/30 shadow-xl shadow-black/40 rotate-1 hover:rotate-0 transition-transform duration-500 mt-4">
            <img
              src={IMAGES.tailgateBus}
              alt="Tailgate bus parked under the Spunkmeyers Pub sign on game day"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* <!-- UPDATE NEEDED: Replace countdown target date with official 2026 preseason Week 1 date/time when NFL schedule is released. Also replace 2025 schedule results below with 2026 schedule. --> */}

        {/* Countdown Timer */}
        <div className="fade-up mb-10 sm:mb-14">
          <CountdownTimer />
        </div>

        {/* Season Accordion */}
        <div className="fade-up max-w-3xl mx-auto">
          <SeasonAccordion />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const christmas = useChristmasSeason();
  const pageRef = usePageEffects(christmas);
  const [holidayPaused, setHolidayPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setHolidayPaused(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  return (
    <div ref={pageRef} className={christmas ? `holiday-home ${holidayPaused ? "holiday-motion-paused" : ""}` : undefined}>
      <SEO
        title="Spunkmeyers Pub & Grill | Wadsworth, OH - Cold Beer, Hot Food, Best Patio"
        description="Wadsworth's favorite pub. 18 beers on tap, smash burgers, wings, the Buck Naked outdoor bar, and every big game on screen. Official Browns Backer Bar. 993 High St, Wadsworth, OH."
        path="/"
        ogImage="https://spunkmeyers.pub/img/bar-interior.jpg"
        jsonLd={localBusinessSchema}
      />
      {christmas && <ChristmasSnow />}
      {christmas && <div className="christmas-announcement"><span><Snowflake size={15} aria-hidden="true" /> It’s Christmas at Spunkmeyers!</span><button type="button" onClick={() => setHolidayPaused(!holidayPaused)} aria-pressed={holidayPaused}>{holidayPaused ? <Play size={14} /> : <Pause size={14} />}{holidayPaused ? "Resume holiday motion" : "Pause holiday motion"}</button></div>}

      {/* ===== HERO - VIDEO BACKGROUND ===== */}
      {christmas ? <><ChristmasHero paused={holidayPaused} setPaused={setHolidayPaused} /><ChristmasTour /><ChristmasLights className="christmas-section-lights" /></> : <section data-narrate="home-hero" className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={IMAGES.barInterior}
        >
          <source src={VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#1a1a1a]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="fade-up text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold text-white leading-[1.05] mb-6 max-w-5xl tracking-tight">
            Wadsworth's<br />Favorite Pub.
          </h1>
          <p className="fade-up text-xl sm:text-2xl text-[#F5F0EB]/90 mb-10 font-light tracking-wide max-w-2xl" style={{ transitionDelay: "120ms" }}>
            Cold Beer. Hot Food. The Best Patio in Town.
          </p>
          <div className="fade-up flex flex-col sm:flex-row gap-4" style={{ transitionDelay: "240ms" }}>
            <Link href="/menu" className="btn-premium btn-premium-pulse text-base py-4 px-10">
              View Menu
            </Link>
            <a
              href={LINKS.doordash}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-base py-4 px-10"
            >
              Order Online
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-[#E8601C] rounded-full mt-2 scroll-hint" />
          </div>
        </div>
      </section>}

      {/* ===== SPX AMERICAN LAGER ===== */}
      {christmas && <div className="christmas-section-note"><Snowflake aria-hidden="true" /> Cheers to the season <Snowflake aria-hidden="true" /></div>}
      <SpxLager />

      {/* ===== QUICK INFO STRIP ===== */}
      <section className="home-info relative overflow-hidden">
        {/* Background with gradient and texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8601C] via-[#c94e12] to-[#a33d0d]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="fade-up grid grid-cols-1 sm:grid-cols-3">
            {/* Hours */}
            <div className="info-card-bold">
              <div className="info-card-icon-wrap">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="info-card-label">OPEN TODAY</span>
                <span className="info-card-value">{getCurrentHours()}</span>
              </div>
            </div>

            {/* Phone */}
            <a href={BUSINESS.phoneLink} className="info-card-bold">
              <div className="info-card-icon-wrap">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <span className="info-card-label">CALL US</span>
                <span className="info-card-value">{BUSINESS.phone}</span>
              </div>
            </a>

            {/* Address */}
            <a
              href={LINKS.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="info-card-bold"
            >
              <div className="info-card-icon-wrap">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <span className="info-card-label">FIND US</span>
                <span className="info-card-value">{BUSINESS.address}</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ===== WQMX RADIO SPOT ===== */}
      <RadioSpot />

      {/* ===== WHY SPUNKS - ANIMATED ICONS ===== */}
      <section className="bg-[#1a1a1a] py-12 sm:py-24 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Beer, title: "18 Beers on Tap", desc: "Updated daily. Always something new." },
              { icon: Sun, title: "Best Patio in Town", desc: "The Buck Naked Bar. Open air. Cold drinks." },
              { icon: Flame, title: "Cooked to Order", desc: "Smash burgers, loaded fries, wings, and more. Made fresh daily." },
              { icon: Calendar, title: "Events & Game Days", desc: "Bingo, live music, and every big game." },
            ].map((item, i) => (
              <div
                key={i}
                className="fade-up text-center group"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="icon-circle w-16 h-16 mx-auto mb-5 rounded-full bg-[#E8601C]/10 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-[#E8601C]" />
                </div>
                <h3 className="font-heading text-lg text-[#F5F0EB] mb-2">{item.title}</h3>
                <p className="text-[#999] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {christmas && <ChristmasLights className="christmas-section-lights" />}
      {/* ===== SPUNKS PUB CRAWL - THE PHONE GAME ===== */}
      <section className="relative overflow-hidden bg-black text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="fade-up flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <Link
              href="/pub-crawl"
              className="shrink-0 rounded-2xl bg-[#F5F0EB] p-5 shadow-2xl ring-4 ring-[#E8601C]/60 flex items-end gap-3"
              aria-label="Play Spunks Pub Crawl"
            >
              <PixelArt name="jump" scale={5} className="block" />
              <PixelArt name="burger" scale={4} className="block" />
            </Link>
            <div className="text-center md:text-left">
              <div className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[#E8601C] mb-2">New: play it on your phone</div>
              <h2 className="text-4xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                Spunks <span className="text-[#E8601C]">Pub Crawl</span>
              </h2>
              <p className="mt-4 text-lg text-[#F5F0EB]/80 max-w-xl leading-relaxed">
                Kevin's on the run down High Street. Tap right to jump, hold left to slide. Hop Arene, Chris, Dave, Jeff, and Bob from the band, DJ Brian,
                Peyton, Mick, Luke, and DJ, dodge the burgers and wings, grab an SPX, and get your initials on the pub leaderboard.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/pub-crawl" className="btn-premium">
                  Play Pub Crawl
                </Link>
                <a
                  href="/pub-crawl-sign.html"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-heading text-sm font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Print the QR sign
                </a>
              </div>
            </div>
          </div>
          <PubCrawlBoard className="fade-up mt-10 max-w-3xl mx-auto md:mx-0 md:ml-auto" />
        </div>
      </section>

      {/* ===== SPUNKS STACK - THE SECOND PHONE GAME ===== */}
      <section className="relative overflow-hidden bg-[#111111] text-white border-t border-white/10">
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="fade-up flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <Link href="/stack" className="shrink-0 rounded-2xl bg-black p-5 shadow-2xl ring-4 ring-[#E8601C]/60" aria-label="Play Spunks Stack">
              <StackArt scale={5} className="block" />
            </Link>
            <div className="text-center md:text-left">
              <div className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[#E8601C] mb-2">Also in the Spunks Arcade</div>
              <h2 className="text-4xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                Spunks <span className="text-[#E8601C]">Stack</span>
              </h2>
              <p className="mt-4 text-lg text-[#F5F0EB]/80 max-w-xl leading-relaxed">
                Old-school falling blocks, right on your phone. Swipe to move, tap to spin, flick down to drop. Clear lines, climb levels, and outlast last call.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/stack" className="btn-premium">
                  Play Stack
                </Link>
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-heading text-sm font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  All games
                </Link>
              </div>
            </div>
          </div>
          <PubCrawlBoard className="fade-up mt-10 max-w-3xl mx-auto md:mx-0" endpoint="/api/stack-scores" href="/stack" minScore={100} />
        </div>
      </section>

      {/* ===== BUCK NAKED BAR ===== */}
      <section data-narrate="home-patio" className="relative min-h-[50vh] sm:min-h-[70vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center kenburns"
          data-parallax="0.2"
          style={{ backgroundImage: `url(${IMAGES.barInterior})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="max-w-xl fade-up">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              The Buck<br />Naked Bar.
            </h2>
            <p className="text-xl text-[#F5F0EB]/80 mb-8 leading-relaxed">
              String lights. Palm trees. Cold beer under the open sky. This is where summer lives in Wadsworth.
            </p>
            <Link href="/experience" className="btn-premium">
              Explore the Space
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PATIO PALOOZA ===== */}
      <section data-narrate="home-palooza" className="bg-[#111111] py-12 sm:py-20 border-y border-[#E8601C]/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="fade-scale rounded-xl overflow-hidden border border-[#E8601C]/30 shadow-2xl shadow-black/40">
              <img
                src="/patio-palooza.jpg"
                alt="Patio Palooza every Friday night at Spunkmeyers, featuring DJ B Watts"
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
            <div className="fade-right text-center lg:text-left" style={{ transitionDelay: "120ms" }}>
              <span className="inline-flex items-center gap-2 bg-[#E8601C]/15 border border-[#E8601C]/40 text-[#E8601C] font-heading text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
                <span className="w-2 h-2 rounded-full bg-[#E8601C] animate-pulse" />
                New &middot; Every Friday Night
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-[1.05] tracking-tight">
                Patio Palooza
              </h2>
              <p className="text-lg text-[#F5F0EB]/80 mb-4 leading-relaxed">
                The patio comes alive every Friday night. Live DJ sets, cold drinks, and the best
                crowd in Wadsworth out under the lights on the Buck Naked Bar patio.
              </p>
              <p className="text-[#E8601C] font-heading text-sm uppercase tracking-wider mb-8">
                Featuring DJ B Watts &amp; Chris from Last Call Entertainment
              </p>
              <Link href="/events" className="btn-premium">
                See What's Happening
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE TICKER ===== */}
      <section className="bg-[#111111] py-5 overflow-hidden border-y border-[#E8601C]/20">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="font-heading text-xl sm:text-2xl uppercase tracking-[0.2em] text-[#E8601C] whitespace-nowrap px-4"
            >
              {christmas ? `MERRY EVERYTHING · CHRISTMAS AT SPUNKS · ${marqueeText}` : marqueeText}
            </span>
          ))}
        </div>
      </section>

      {/* ===== FOOD FEATURE ===== */}
      <section data-narrate="home-food" className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
          <div className="fade-scale relative h-[50vh] lg:h-auto overflow-hidden">
            <FoodShowcase />
          </div>
          <div className="flex items-center px-6 sm:px-12 lg:px-16 py-10 sm:py-16 lg:py-24">
            <div className="fade-up max-w-lg">
              <h2 className="text-4xl sm:text-5xl font-bold text-[#F5F0EB] mb-6 leading-[1.05] tracking-tight">
                Smashed to Order.
              </h2>
              <p className="text-[#999] text-lg leading-relaxed mb-8">
                Fresh off the flat top every time. Bold flavors, brioche buns, and the kind of food that keeps regulars coming back.
              </p>
              <Link href="/menu" className="btn-premium">
                See the Full Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {christmas && <div className="christmas-section-note"><Snowflake aria-hidden="true" /> Good food. Great company. All the Christmas. <Snowflake aria-hidden="true" /></div>}
      {/* ===== REVIEWS - ARROW CAROUSEL ===== */}
      <section className="bg-[#111111] py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 fade-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#F5F0EB] tracking-tight">
              Straight from Our Guests
            </h2>
          </div>
          <ReviewCarousel />
          <div className="text-center mt-10">
            <a
              href={LINKS.googleReview}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm py-3 px-8"
            >
              Leave Us a Review on Google
            </a>
          </div>
        </div>
      </section>

      {/* ===== PHOTO STRIP ===== */}
      <section className="fade-up bg-[#1a1a1a] py-4 overflow-hidden">
        <div className="photo-strip-track">
          {[...PHOTO_STRIP, ...PHOTO_STRIP].map((img, i) => (
            <div key={i} className="flex-shrink-0 h-[280px] sm:h-[350px] w-[400px] sm:w-[500px] mx-2 img-zoom">
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {christmas && <ChristmasLights className="christmas-section-lights" />}
      {/* ===== ON THE BIG SCREENS (live schedule) ===== */}
      <BigScreens />

      {/* ===== BROWNS BACKER BAR ===== */}
      <BrownsBackerBar />

      {/* ===== CLEVELAND GUARDIANS ===== */}
      <CavsSection />

      {/* ===== GAME DAY - OHIO SPORTS CAROUSEL ===== */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <SportsCarousel />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 w-full">
          <div className="max-w-xl ml-auto text-right fade-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Your Game Day<br />Headquarters.
            </h2>
            <p className="text-lg text-[#F5F0EB]/80 mb-4 leading-relaxed">
              Every screen. Every game. The energy you only get when the whole bar is locked in.
            </p>
            <p className="text-[#E8601C] font-heading text-lg uppercase tracking-wider mb-8">
              Browns · Guardians · Cavs · Buckeyes
            </p>
            <Link href="/events" className="btn-premium">
              See What's Coming Up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCurrentHours(): string {
  const today = getCurrentDayName();
  const hours = BUSINESS.hours.find((h) => h.day === today);
  return hours ? `${today}: ${hours.hours}` : "";
}
