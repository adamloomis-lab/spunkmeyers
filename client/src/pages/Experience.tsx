/*
 * Spunkmeyers Pub & Grill - Experience Page
 * Fonts: Oswald headlines, Lora body (global via CSS)
 * All photos are client-provided originals only
 */
import { useEffect, useRef, useState } from "react";
import { IMAGES, SPORTS_IMAGES, VIDEO } from "@/lib/constants";
import { Link } from "wouter";
import SEO, { breadcrumbSchema } from "@/components/SEO";

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fadeEls = ref.current?.querySelectorAll<HTMLElement>(".fade-up");
    if (!fadeEls || fadeEls.length === 0) return;
    const checkVisibility = () => {
      fadeEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 30) {
          el.classList.add("visible");
        }
      });
    };
    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    const fallback = setTimeout(() => {
      fadeEls.forEach((el) => el.classList.add("visible"));
    }, 1000);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("scroll", checkVisibility);
    };
  }, []);
  return ref;
}

function SportsGrid() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SPORTS_IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      {SPORTS_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`relative overflow-hidden h-[200px] sm:h-[240px] transition-all duration-700 ${
            i === activeIndex ? "ring-2 ring-[#E8601C] scale-[1.02]" : "opacity-60 grayscale-[40%]"
          }`}
        >
          <img
            src={img.src}
            alt={img.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <span className="font-heading text-xs uppercase tracking-wider text-white">{img.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Experience() {
  const fadeRef = useFadeUp();

  return (
    <div ref={fadeRef} className="min-h-screen bg-[#1a1a1a]">
      <SEO
        title="The Experience | Spunkmeyers Pub & Grill - Buck Naked Bar, Game Day, Live Events"
        description="Explore Spunkmeyers Pub & Grill in Wadsworth, OH. The Buck Naked outdoor bar, bingo nights, live music, Ohio sports on every screen, and the best patio in town. Official Browns Backer Bar."
        path="/experience"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/488745002_1173083834716231_4189979829948856344_n_e8e7f678.jpg"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Experience", url: "https://spunkmeyers.pub/experience" }
        ])}
      />
      {/* Hero */}
      <section data-narrate="exp-hero" className="relative h-[35vh] sm:h-[60vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.patioColorful})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#1a1a1a]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-3 block">
            Step Inside
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            The Experience
          </h1>
        </div>
      </section>

      {/* ===== THE BUCK NAKED BAR ===== */}
      <section data-narrate="exp-sports" className="bg-[#1a1a1a] py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="fade-up">
              <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
                The Outdoor Bar
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#F5F0EB] mb-6 leading-[1.05] tracking-tight">
                The Buck Naked Bar
              </h2>
              <p className="text-[#999] text-lg leading-relaxed mb-6">
                String lights, palm trees, and the best bartenders in Wadsworth pouring cold ones under the open sky. This is where summer lives.
              </p>
              <p className="text-[#999] text-lg leading-relaxed">
                Catch a game on the outdoor screens, grab drinks after work, or settle in for a long Saturday afternoon. Cold beer, warm vibes.
              </p>
            </div>
            <div className="fade-up" style={{ transitionDelay: "200ms" }}>
              <img
                src={IMAGES.patioCollage}
                alt="The Buck Naked Bar patio"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CINEMATIC VIDEO SECTION ===== */}
      <section className="relative bg-black py-0 overflow-hidden">
        {/* Ambient glow behind the video */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80%] h-[60%] bg-[#E8601C]/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* Section header */}
          <div className="text-center mb-8 sm:mb-12 px-4 fade-up">
            <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-3 block">
              Take the Tour
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-[#F5F0EB] mb-4 tracking-tight">
              See It for Yourself
            </h2>
            <p className="text-[#999] text-lg max-w-xl mx-auto">
              The energy, the people, the vibe. Hit play and get a taste of what a night at Spunkmeyers feels like.
            </p>
          </div>

          {/* Video container with cinematic frame */}
          <div className="fade-up relative group" style={{ transitionDelay: '200ms' }}>
            {/* Cinematic letterbox bars */}
            <div className="hidden sm:block absolute -top-4 left-4 right-4 h-4 bg-gradient-to-b from-black to-transparent z-20" />
            <div className="hidden sm:block absolute -bottom-4 left-4 right-4 h-4 bg-gradient-to-t from-black to-transparent z-20" />

            {/* Orange accent frame lines */}
            <div className="hidden sm:block absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#E8601C]/30 to-transparent z-20" />
            <div className="hidden sm:block absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#E8601C]/30 to-transparent z-20" />

            {/* The video player */}
            <div className="relative sm:mx-4 overflow-hidden sm:rounded-lg shadow-2xl shadow-black/50">
              <video
                className="w-full aspect-video bg-black"
                controls
                playsInline
                preload="metadata"
                poster={IMAGES.patioColorful}
              >
                <source src={VIDEO} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Reflection effect under video */}
            <div className="hidden sm:block h-24 mx-4 overflow-hidden rounded-b-lg opacity-20">
              <video
                className="w-full aspect-video bg-black scale-y-[-1] blur-sm"
                muted
                aria-hidden="true"
              >
                <source src={VIDEO} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INSIDE THE PUB - bingo night interior shot ===== */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.bingoInterior})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="max-w-xl fade-up">
            <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
              The Main Room
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Inside the Pub
            </h2>
            <p className="text-lg text-[#F5F0EB]/80 leading-relaxed">
              Walk in and you're home. Screens everywhere, cold beer on tap, and staff that knows your name. Grab a stool or post up in a booth.
            </p>
          </div>
        </div>
      </section>

      {/* ===== STAFF PHOTOS ===== */}
      <section className="bg-[#111111] py-10 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="fade-up overflow-hidden h-[350px] img-zoom">
              <img
                src={IMAGES.bartenderOutdoor}
                alt="Bartender at the outdoor bar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="fade-up overflow-hidden h-[350px] img-zoom" style={{ transitionDelay: "100ms" }}>
              <img
                src={IMAGES.staffDuo}
                alt="Spunkmeyers staff"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="fade-up overflow-hidden h-[350px] img-zoom" style={{ transitionDelay: "200ms" }}>
              <img
                src={IMAGES.staffThree}
                alt="The Spunkmeyers team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== GAME DAY - OHIO SPORTS ONLY ===== */}
      <section className="bg-[#1a1a1a] py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1 fade-up" style={{ transitionDelay: "200ms" }}>
              <SportsGrid />
            </div>
            <div className="order-1 lg:order-2 fade-up">
              <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
                Official Browns Backer Bar
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-[#F5F0EB] mb-6 leading-[1.05] tracking-tight">
                Game Day at Spunks
              </h2>
              <p className="text-[#999] text-lg leading-relaxed mb-6">
                When the Browns kick off, the Guardians take the field, or the Buckeyes run out of the tunnel, there's only one place to be. Multiple screens, cold pitchers, and a packed house.
              </p>
              <p className="text-[#E8601C] font-heading text-lg uppercase tracking-wider mb-6">
                Browns · Guardians · Cavs · Buckeyes
              </p>
              <p className="text-[#999] text-lg leading-relaxed">
                Not a chain with the game on in the background. A pub full of people who care. Grab a seat early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LIVE EVENTS TEASER ===== */}
      <section className="relative py-12 sm:py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${IMAGES.bingoGroup})` }}
        />
        <div className="absolute inset-0 bg-[#1a1a1a]/40" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-up max-w-2xl mx-auto">
            <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-4 block">
              Always Something Happening
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#F5F0EB] mb-6 tracking-tight">
              Live Events
            </h2>
            <p className="text-[#999] text-lg leading-relaxed mb-10">
              Bingo nights, live music, themed parties. We keep the calendar full.
            </p>
            <Link href="/events" className="btn-premium">
              See What's Coming Up
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom spacer for mobile sticky button */}
      <div className="h-20 bg-[#1a1a1a] lg:hidden" />
    </div>
  );
}
