/*
 * Spunkmeyers Pub & Grill - Homepage
 * Fonts: Oswald headlines, Lora body (global via CSS)
 * All photos are client-provided originals only
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { IMAGES, VIDEO, LINKS, BUSINESS, SPORTS_IMAGES, FOOD_IMAGES, PHOTO_STRIP, getCurrentDayName } from "@/lib/constants";

import { Link } from "wouter";
import { Beer, Flame, Sun, Calendar, ChevronLeft, ChevronRight, Star, ChevronDown } from "lucide-react";
import SEO, { localBusinessSchema } from "@/components/SEO";
import BigScreens from "@/components/BigScreens";

function usePageEffects() {
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
  }, []);
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
                    ? "bg-green-900/15 border-l-2 border-green-500"
                    : game.result === "L"
                    ? "bg-red-900/10 border-l-2 border-red-500/50"
                    : "bg-white/5 border-l-2 border-white/10"
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

// Full 2026 Guardians game-by-game schedule
const guardiansFullSchedule: { date: string; opponent: string; time: string; home: boolean }[] = [
  // March
  { date: "2026-03-22", opponent: "Seattle Mariners", time: "10:10 PM", home: false },
  { date: "2026-03-23", opponent: "Seattle Mariners", time: "10:10 PM", home: false },
  { date: "2026-03-24", opponent: "Seattle Mariners", time: "10:10 PM", home: false },
  { date: "2026-03-26", opponent: "Oakland Athletics", time: "10:10 PM", home: false },
  { date: "2026-03-27", opponent: "Oakland Athletics", time: "9:45 PM", home: false },
  { date: "2026-03-28", opponent: "Oakland Athletics", time: "9:40 PM", home: false },
  { date: "2026-03-29", opponent: "Seattle Mariners", time: "7:20 PM", home: false },
  { date: "2026-03-30", opponent: "L.A. Dodgers", time: "10:10 PM", home: false },
  { date: "2026-03-31", opponent: "L.A. Dodgers", time: "10:10 PM", home: false },
  // April
  { date: "2026-04-01", opponent: "L.A. Dodgers", time: "8:20 PM", home: false },
  { date: "2026-04-03", opponent: "Chicago Cubs", time: "4:10 PM", home: false },
  { date: "2026-04-04", opponent: "Chicago Cubs", time: "7:15 PM", home: false },
  { date: "2026-04-05", opponent: "Chicago Cubs", time: "1:40 PM", home: true },
  { date: "2026-04-06", opponent: "Kansas City Royals", time: "6:10 PM", home: true },
  { date: "2026-04-07", opponent: "Kansas City Royals", time: "6:10 PM", home: true },
  { date: "2026-04-08", opponent: "Kansas City Royals", time: "1:10 PM", home: true },
  { date: "2026-04-09", opponent: "Kansas City Royals", time: "1:10 PM", home: true },
  { date: "2026-04-10", opponent: "Atlanta Braves", time: "7:15 PM", home: true },
  { date: "2026-04-11", opponent: "Atlanta Braves", time: "7:15 PM", home: true },
  { date: "2026-04-12", opponent: "Atlanta Braves", time: "7:20 PM", home: false },
  { date: "2026-04-13", opponent: "St. Louis Cardinals", time: "7:45 PM", home: false },
  { date: "2026-04-14", opponent: "St. Louis Cardinals", time: "7:45 PM", home: false },
  { date: "2026-04-15", opponent: "St. Louis Cardinals", time: "1:15 PM", home: false },
  { date: "2026-04-16", opponent: "Baltimore Orioles", time: "6:10 PM", home: true },
  { date: "2026-04-17", opponent: "Baltimore Orioles", time: "6:10 PM", home: true },
  { date: "2026-04-18", opponent: "Baltimore Orioles", time: "6:10 PM", home: true },
  { date: "2026-04-19", opponent: "Baltimore Orioles", time: "1:40 PM", home: true },
  { date: "2026-04-20", opponent: "Houston Astros", time: "6:10 PM", home: true },
  { date: "2026-04-21", opponent: "Houston Astros", time: "6:10 PM", home: true },
  { date: "2026-04-22", opponent: "Houston Astros", time: "1:10 PM", home: true },
  { date: "2026-04-24", opponent: "Toronto Blue Jays", time: "7:07 PM", home: false },
  { date: "2026-04-25", opponent: "Toronto Blue Jays", time: "3:07 PM", home: false },
  { date: "2026-04-26", opponent: "Toronto Blue Jays", time: "1:37 PM", home: false },
  { date: "2026-04-27", opponent: "Tampa Bay Rays", time: "6:10 PM", home: true },
  { date: "2026-04-28", opponent: "Tampa Bay Rays", time: "6:10 PM", home: true },
  { date: "2026-04-29", opponent: "Tampa Bay Rays", time: "1:10 PM", home: true },
  // May
  { date: "2026-05-01", opponent: "Oakland Athletics", time: "9:40 PM", home: false },
  { date: "2026-05-02", opponent: "Oakland Athletics", time: "4:05 PM", home: false },
  { date: "2026-05-03", opponent: "Oakland Athletics", time: "4:05 PM", home: false },
  { date: "2026-05-04", opponent: "Kansas City Royals", time: "7:40 PM", home: false },
  { date: "2026-05-05", opponent: "Kansas City Royals", time: "7:40 PM", home: false },
  { date: "2026-05-06", opponent: "Kansas City Royals", time: "7:40 PM", home: false },
  { date: "2026-05-07", opponent: "Kansas City Royals", time: "2:10 PM", home: false },
  { date: "2026-05-08", opponent: "Minnesota Twins", time: "7:10 PM", home: false },
  { date: "2026-05-09", opponent: "Minnesota Twins", time: "6:10 PM", home: false },
  { date: "2026-05-10", opponent: "L.A. Angels", time: "1:40 PM", home: true },
  { date: "2026-05-11", opponent: "L.A. Angels", time: "6:10 PM", home: true },
  { date: "2026-05-12", opponent: "L.A. Angels", time: "6:10 PM", home: true },
  { date: "2026-05-13", opponent: "L.A. Angels", time: "1:10 PM", home: true },
  { date: "2026-05-15", opponent: "Cincinnati Reds", time: "7:10 PM", home: true },
  { date: "2026-05-16", opponent: "Cincinnati Reds", time: "6:10 PM", home: true },
  { date: "2026-05-17", opponent: "Cincinnati Reds", time: "1:40 PM", home: true },
  { date: "2026-05-18", opponent: "Detroit Tigers", time: "6:40 PM", home: true },
  { date: "2026-05-19", opponent: "Detroit Tigers", time: "6:40 PM", home: true },
  { date: "2026-05-20", opponent: "Detroit Tigers", time: "6:40 PM", home: true },
  { date: "2026-05-21", opponent: "Detroit Tigers", time: "1:10 PM", home: true },
  { date: "2026-05-22", opponent: "Philadelphia Phillies", time: "6:40 PM", home: false },
  { date: "2026-05-23", opponent: "Philadelphia Phillies", time: "4:05 PM", home: false },
  { date: "2026-05-24", opponent: "Philadelphia Phillies", time: "1:35 PM", home: false },
  { date: "2026-05-25", opponent: "Washington Nationals", time: "6:10 PM", home: true },
  { date: "2026-05-26", opponent: "Washington Nationals", time: "6:10 PM", home: true },
  { date: "2026-05-27", opponent: "Washington Nationals", time: "1:10 PM", home: true },
  { date: "2026-05-29", opponent: "Boston Red Sox", time: "7:10 PM", home: false },
  { date: "2026-05-30", opponent: "Boston Red Sox", time: "4:10 PM", home: false },
  { date: "2026-05-31", opponent: "Boston Red Sox", time: "1:40 PM", home: false },
  // June
  { date: "2026-06-01", opponent: "N.Y. Yankees", time: "1:40 PM", home: false },
  { date: "2026-06-02", opponent: "N.Y. Yankees", time: "7:05 PM", home: false },
  { date: "2026-06-03", opponent: "N.Y. Yankees", time: "7:05 PM", home: false },
  { date: "2026-06-04", opponent: "N.Y. Yankees", time: "1:35 PM", home: false },
  { date: "2026-06-05", opponent: "Texas Rangers", time: "8:15 PM", home: false },
  { date: "2026-06-06", opponent: "Texas Rangers", time: "7:35 PM", home: false },
  { date: "2026-06-07", opponent: "Texas Rangers", time: "2:35 PM", home: false },
  { date: "2026-06-08", opponent: "N.Y. Yankees", time: "6:40 PM", home: true },
  { date: "2026-06-09", opponent: "N.Y. Yankees", time: "6:40 PM", home: true },
  { date: "2026-06-10", opponent: "N.Y. Yankees", time: "1:10 PM", home: true },
  { date: "2026-06-11", opponent: "Detroit Tigers", time: "7:10 PM", home: true },
  { date: "2026-06-12", opponent: "Detroit Tigers", time: "7:10 PM", home: false },
  { date: "2026-06-13", opponent: "Detroit Tigers", time: "4:10 PM", home: false },
  { date: "2026-06-14", opponent: "Detroit Tigers", time: "1:40 PM", home: false },
  { date: "2026-06-16", opponent: "Milwaukee Brewers", time: "7:40 PM", home: true },
  { date: "2026-06-17", opponent: "Milwaukee Brewers", time: "7:40 PM", home: true },
  { date: "2026-06-18", opponent: "Milwaukee Brewers", time: "2:10 PM", home: true },
  { date: "2026-06-19", opponent: "Houston Astros", time: "8:10 PM", home: false },
  { date: "2026-06-20", opponent: "Houston Astros", time: "7:15 PM", home: false },
  { date: "2026-06-21", opponent: "Houston Astros", time: "2:10 PM", home: false },
  { date: "2026-06-22", opponent: "Chicago White Sox", time: "7:40 PM", home: true },
  { date: "2026-06-23", opponent: "Chicago White Sox", time: "7:40 PM", home: true },
  { date: "2026-06-24", opponent: "Chicago White Sox", time: "2:10 PM", home: true },
  { date: "2026-06-25", opponent: "Chicago White Sox", time: "1:10 PM", home: true },
  { date: "2026-06-26", opponent: "Seattle Mariners", time: "7:10 PM", home: true },
  { date: "2026-06-27", opponent: "Seattle Mariners", time: "7:10 PM", home: true },
  { date: "2026-06-28", opponent: "Seattle Mariners", time: "1:40 PM", home: true },
  { date: "2026-06-29", opponent: "Texas Rangers", time: "7:10 PM", home: true },
  { date: "2026-06-30", opponent: "Texas Rangers", time: "6:40 PM", home: true },
  // July
  { date: "2026-07-01", opponent: "Chicago White Sox", time: "1:10 PM", home: true },
  { date: "2026-07-02", opponent: "Chicago White Sox", time: "6:40 PM", home: true },
  { date: "2026-07-03", opponent: "Chicago White Sox", time: "7:10 PM", home: true },
  { date: "2026-07-04", opponent: "Chicago White Sox", time: "7:10 PM", home: true },
  { date: "2026-07-05", opponent: "Chicago White Sox", time: "2:00 PM", home: true },
  { date: "2026-07-07", opponent: "Minnesota Twins", time: "7:40 PM", home: false },
  { date: "2026-07-08", opponent: "Minnesota Twins", time: "7:40 PM", home: false },
  { date: "2026-07-09", opponent: "Minnesota Twins", time: "1:40 PM", home: false },
  { date: "2026-07-10", opponent: "Miami Marlins", time: "7:10 PM", home: true },
  { date: "2026-07-11", opponent: "Miami Marlins", time: "4:10 PM", home: true },
  { date: "2026-07-12", opponent: "Miami Marlins", time: "1:40 PM", home: true },
  // All-Star Break ~Jul 13-16
  { date: "2026-07-17", opponent: "Pittsburgh Pirates", time: "7:10 PM", home: true },
  { date: "2026-07-18", opponent: "Pittsburgh Pirates", time: "4:10 PM", home: true },
  { date: "2026-07-19", opponent: "Pittsburgh Pirates", time: "1:40 PM", home: true },
  { date: "2026-07-20", opponent: "Minnesota Twins", time: "6:40 PM", home: true },
  { date: "2026-07-21", opponent: "Minnesota Twins", time: "6:40 PM", home: true },
  { date: "2026-07-22", opponent: "Minnesota Twins", time: "6:40 PM", home: true },
  { date: "2026-07-23", opponent: "Minnesota Twins", time: "1:10 PM", home: true },
  { date: "2026-07-24", opponent: "Tampa Bay Rays", time: "7:10 PM", home: false },
  { date: "2026-07-25", opponent: "Tampa Bay Rays", time: "6:10 PM", home: false },
  { date: "2026-07-26", opponent: "Tampa Bay Rays", time: "12:15 PM", home: false },
  { date: "2026-07-27", opponent: "Cincinnati Reds", time: "7:10 PM", home: true },
  { date: "2026-07-28", opponent: "Cincinnati Reds", time: "7:10 PM", home: true },
  { date: "2026-07-29", opponent: "Cincinnati Reds", time: "7:10 PM", home: true },
  { date: "2026-07-30", opponent: "Arizona Diamondbacks", time: "7:10 PM", home: false },
  { date: "2026-07-31", opponent: "Arizona Diamondbacks", time: "7:10 PM", home: true },
  // August
  { date: "2026-08-01", opponent: "Arizona Diamondbacks", time: "7:15 PM", home: true },
  { date: "2026-08-02", opponent: "Arizona Diamondbacks", time: "1:40 PM", home: true },
  { date: "2026-08-04", opponent: "N.Y. Mets", time: "6:40 PM", home: true },
  { date: "2026-08-05", opponent: "N.Y. Mets", time: "6:40 PM", home: true },
  { date: "2026-08-06", opponent: "N.Y. Mets", time: "1:10 PM", home: true },
  { date: "2026-08-07", opponent: "Chicago White Sox", time: "7:40 PM", home: false },
  { date: "2026-08-08", opponent: "Chicago White Sox", time: "7:10 PM", home: false },
  { date: "2026-08-09", opponent: "Chicago White Sox", time: "2:10 PM", home: false },
  { date: "2026-08-11", opponent: "Detroit Tigers", time: "6:40 PM", home: true },
  { date: "2026-08-12", opponent: "Detroit Tigers", time: "6:40 PM", home: true },
  { date: "2026-08-13", opponent: "Detroit Tigers", time: "1:10 PM", home: true },
  { date: "2026-08-14", opponent: "San Diego Padres", time: "7:10 PM", home: true },
  { date: "2026-08-15", opponent: "San Diego Padres", time: "7:10 PM", home: true },
  { date: "2026-08-16", opponent: "San Diego Padres", time: "1:40 PM", home: true },
  { date: "2026-08-18", opponent: "San Francisco Giants", time: "6:40 PM", home: true },
  { date: "2026-08-19", opponent: "San Francisco Giants", time: "6:40 PM", home: true },
  { date: "2026-08-20", opponent: "San Francisco Giants", time: "1:10 PM", home: true },
  { date: "2026-08-21", opponent: "Colorado Rockies", time: "8:40 PM", home: false },
  { date: "2026-08-22", opponent: "Colorado Rockies", time: "8:10 PM", home: false },
  { date: "2026-08-23", opponent: "Colorado Rockies", time: "3:10 PM", home: false },
  { date: "2026-08-24", opponent: "L.A. Angels", time: "9:38 PM", home: false },
  { date: "2026-08-25", opponent: "L.A. Angels", time: "9:38 PM", home: false },
  { date: "2026-08-26", opponent: "L.A. Angels", time: "4:07 PM", home: false },
  { date: "2026-08-28", opponent: "Kansas City Royals", time: "7:10 PM", home: true },
  { date: "2026-08-29", opponent: "Kansas City Royals", time: "4:10 PM", home: true },
  { date: "2026-08-30", opponent: "Kansas City Royals", time: "1:40 PM", home: true },
  { date: "2026-08-31", opponent: "Kansas City Royals", time: "1:40 PM", home: true },
  // September
  { date: "2026-09-01", opponent: "Toronto Blue Jays", time: "6:40 PM", home: true },
  { date: "2026-09-02", opponent: "Toronto Blue Jays", time: "6:40 PM", home: true },
  { date: "2026-09-03", opponent: "Toronto Blue Jays", time: "1:10 PM", home: true },
  { date: "2026-09-04", opponent: "Detroit Tigers", time: "7:10 PM", home: true },
  { date: "2026-09-05", opponent: "Detroit Tigers", time: "7:15 PM", home: true },
  { date: "2026-09-06", opponent: "Detroit Tigers", time: "1:40 PM", home: true },
  { date: "2026-09-07", opponent: "Baltimore Orioles", time: "1:35 PM", home: false },
  { date: "2026-09-08", opponent: "Baltimore Orioles", time: "6:35 PM", home: false },
  { date: "2026-09-09", opponent: "Baltimore Orioles", time: "6:35 PM", home: false },
  { date: "2026-09-11", opponent: "Minnesota Twins", time: "8:10 PM", home: false },
  { date: "2026-09-12", opponent: "Minnesota Twins", time: "4:10 PM", home: false },
  { date: "2026-09-13", opponent: "Minnesota Twins", time: "2:10 PM", home: false },
  { date: "2026-09-14", opponent: "Chicago White Sox", time: "6:40 PM", home: true },
  { date: "2026-09-15", opponent: "Chicago White Sox", time: "6:40 PM", home: true },
  { date: "2026-09-16", opponent: "Chicago White Sox", time: "1:10 PM", home: true },
  { date: "2026-09-18", opponent: "Oakland Athletics", time: "7:10 PM", home: true },
  { date: "2026-09-19", opponent: "Oakland Athletics", time: "6:10 PM", home: true },
  { date: "2026-09-20", opponent: "Oakland Athletics", time: "1:40 PM", home: true },
  { date: "2026-09-22", opponent: "Boston Red Sox", time: "6:45 PM", home: false },
  { date: "2026-09-23", opponent: "Boston Red Sox", time: "7:10 PM", home: true },
  { date: "2026-09-24", opponent: "Boston Red Sox", time: "6:45 PM", home: false },
  { date: "2026-09-25", opponent: "Kansas City Royals", time: "7:40 PM", home: true },
  { date: "2026-09-26", opponent: "Kansas City Royals", time: "7:10 PM", home: true },
  { date: "2026-09-27", opponent: "Kansas City Royals", time: "3:10 PM", home: true },
];

// Home games only for the accordion
const guardiansHomeGames = guardiansFullSchedule.filter(g => g.home);

// Get today's game or next upcoming game
function getGuardiansGameStatus() {
  const now = new Date();
  const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  
  // Check if there's a game today
  const todayGame = guardiansFullSchedule.find(g => g.date === todayStr);
  if (todayGame) {
    return { label: "TODAY'S GAME", game: todayGame, isToday: true };
  }
  
  // Find next upcoming game
  const upcoming = guardiansFullSchedule.find(g => g.date > todayStr);
  if (upcoming) {
    // Calculate days until
    const gameDate = new Date(upcoming.date + 'T12:00:00');
    const diffMs = gameDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const dayLabel = diffDays === 1 ? 'TOMORROW' : `IN ${diffDays} DAYS`;
    return { label: `NEXT GAME - ${dayLabel}`, game: upcoming, isToday: false };
  }
  
  // Season is over
  return null;
}

function GuardiansScheduleAccordion() {
  const [open, setOpen] = useState(false);

  // Group home games by month for better display
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  
  return (
    <div className="border border-red-600/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#1a1a1a] hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-heading text-base sm:text-lg text-white uppercase tracking-wide">
            2026 Home Schedule
          </span>
          <span className="text-white/40 text-sm hidden sm:inline">({guardiansHomeGames.length} games)</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-red-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="bg-[#111] px-3 sm:px-5 py-4">
          <div className="grid gap-1">
            {guardiansHomeGames.map((game, i) => {
              const d = new Date(game.date + 'T12:00:00');
              const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3 rounded text-sm sm:text-base bg-white/5 border-l-2 border-red-500/40 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-red-400/80 text-xs w-24 sm:w-28">{dateLabel}</span>
                    <span className="text-white/90">vs {game.opponent}</span>
                  </div>
                  <span className="text-white/50 font-mono text-xs sm:text-sm">{game.time}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <a
              href="https://www.mlb.com/guardians/schedule"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 text-sm font-heading uppercase tracking-wider transition-colors"
            >
              Full Schedule on MLB.com &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function GuardiansSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background: Progressive Field with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${IMAGES.guardiansField})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/93 via-[#0a1020]/90 to-[#1a1a1a]" />

      {/* Navy/red accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="fade-up text-center mb-10 sm:mb-14">
          {/* Guardians C logo via SVG */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-900/40">
            <span className="font-heading text-4xl sm:text-5xl text-white font-bold">C</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight mb-4">
            Cleveland Guardians
          </h2>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Catch every pitch at Spunkmeyers. Cold beer, hot food, and every Guardians game on our screens.
          </p>
        </div>

        {/* Two-column: Player photo + Schedule info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-10 sm:mb-14">
          {/* Player photo */}
          <div className="fade-left flex justify-center">
            <div className="relative w-64 h-80 sm:w-80 sm:h-[26rem] rounded-lg overflow-hidden border-2 border-red-600/30 shadow-2xl shadow-black/50">
              <img
                src={IMAGES.guardiansPlayer}
                alt="Cleveland Guardians player"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
          </div>

          {/* Dynamic Game Status Banner */}
          <div className="fade-right text-center lg:text-left" style={{ transitionDelay: "120ms" }}>
            {(() => {
              const status = getGuardiansGameStatus();
              if (!status) {
                return (
                  <div className="bg-red-600/10 border border-red-600/20 rounded-lg px-6 py-5 mb-6">
                    <p className="font-heading text-sm text-red-400 uppercase tracking-[0.2em] mb-2">2026 Season</p>
                    <p className="font-heading text-2xl sm:text-3xl text-white uppercase">Season Complete</p>
                    <p className="text-white/70 text-lg mt-2">Thanks for watching with us all season.</p>
                  </div>
                );
              }
              const gameDate = new Date(status.game.date + 'T12:00:00');
              const dateFormatted = gameDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
              return (
                <div className={`rounded-lg overflow-hidden mb-6 border ${
                  status.isToday 
                    ? 'border-red-500 shadow-lg shadow-red-900/30' 
                    : 'border-red-600/20'
                }`}>
                  {/* Status header bar */}
                  <div className={`px-5 py-2.5 flex items-center gap-2 ${
                    status.isToday 
                      ? 'bg-red-600' 
                      : 'bg-red-600/20'
                  }`}>
                    {status.isToday && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    )}
                    <span className="font-heading text-sm text-white uppercase tracking-[0.2em]">
                      {status.label}
                    </span>
                  </div>
                  {/* Game details */}
                  <div className="bg-[#0a1628]/80 px-5 py-5">
                    <p className="text-white/50 text-sm mb-1">{dateFormatted}</p>
                    <p className="font-heading text-2xl sm:text-3xl text-white uppercase leading-tight">
                      {status.game.home ? '' : '@ '}{status.game.opponent}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="font-heading text-lg text-red-400">{status.game.time} ET</span>
                      <span className={`text-xs font-heading uppercase tracking-wider px-2 py-0.5 rounded ${
                        status.game.home 
                          ? 'bg-red-600/20 text-red-400' 
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {status.game.home ? 'HOME' : 'AWAY'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Miller Lite Game Day Special - Hero Promo */}
            <div className="relative rounded-xl overflow-hidden mb-6 border border-yellow-400/30 shadow-lg shadow-yellow-900/20 group hover:shadow-yellow-500/30 transition-shadow duration-500">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#1a2744] to-[#0a1628]" />
              {/* Subtle gold shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent group-hover:via-yellow-400/10 transition-all duration-700" />
              
              <div className="relative flex items-center gap-5 sm:gap-8 px-5 sm:px-8 py-5">
                {/* Miller Lite Can - tilted with glow */}
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full scale-150 group-hover:bg-yellow-400/30 transition-all duration-500" />
                  <img
                    src={IMAGES.millerLiteCan}
                    alt="Miller Lite 16oz can"
                    className="relative w-16 sm:w-20 h-auto drop-shadow-[0_4px_20px_rgba(250,204,21,0.3)] -rotate-6 group-hover:-rotate-3 transition-transform duration-500"
                  />
                </div>
                
                {/* Promo text */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-[10px] sm:text-xs uppercase tracking-[0.25em] text-yellow-400/80 mb-1">Game Day Special</p>
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span className="font-heading text-3xl sm:text-4xl lg:text-5xl text-yellow-400 font-bold leading-none">$2</span>
                    <div>
                      <p className="font-heading text-base sm:text-lg lg:text-xl text-white uppercase leading-tight">Miller Lite</p>
                      <p className="text-white/60 text-sm sm:text-base">16oz cans &middot; Every Guardians game</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-white/80 text-base">Every game on our big screens</span>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-white/80 text-base">The best bar atmosphere in Wadsworth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Accordion */}
        <div className="fade-up max-w-3xl mx-auto">
          <GuardiansScheduleAccordion />
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
          <img
            src={IMAGES.brownsBackers}
            alt="Cleveland Browns Backers Worldwide"
            className="w-40 sm:w-52 mx-auto mb-6 drop-shadow-2xl"
          />
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
              src={IMAGES.brownsPlayer3}
              alt="Browns player #3"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="w-32 h-44 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 border-[#E8601C]/30 shadow-xl shadow-black/40 rotate-1 hover:rotate-0 transition-transform duration-500 mt-4">
            <img
              src={IMAGES.brownsPlayer95}
              alt="Browns player #95"
              className="w-full h-full object-cover object-top"
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
  const pageRef = usePageEffects();

  return (
    <div ref={pageRef}>
      <SEO
        title="Spunkmeyers Pub & Grill | Wadsworth, OH - Cold Beer, Hot Food, Best Patio"
        description="Wadsworth's favorite pub. 18 beers on tap, smash burgers, wings, the Buck Naked outdoor bar, and every big game on screen. Official Browns Backer Bar. 993 High St, Wadsworth, OH."
        path="/"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/489455792_1173083864716228_1455366668806752534_n_7eab823c.jpg"
        jsonLd={localBusinessSchema}
      />
      {/* ===== HERO - VIDEO BACKGROUND ===== */}
      <section data-narrate="home-hero" className="relative h-screen w-full overflow-hidden">
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
            <div className="w-1.5 h-3 bg-[#E8601C] rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== QUICK INFO STRIP ===== */}
      <section className="relative overflow-hidden">
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
              {marqueeText}
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
              <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
                From Our Kitchen
              </span>
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

      {/* ===== REVIEWS - ARROW CAROUSEL ===== */}
      <section className="bg-[#111111] py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 fade-up">
            <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
              What People Say
            </span>
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

      {/* ===== ON THE BIG SCREENS (live schedule) ===== */}
      <BigScreens />

      {/* ===== BROWNS BACKER BAR ===== */}
      <BrownsBackerBar />

      {/* ===== CLEVELAND GUARDIANS ===== */}
      <GuardiansSection />

      {/* ===== GAME DAY - OHIO SPORTS CAROUSEL ===== */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <SportsCarousel />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24 w-full">
          <div className="max-w-xl ml-auto text-right fade-up">
            <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
              Ohio Sports HQ
            </span>
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
