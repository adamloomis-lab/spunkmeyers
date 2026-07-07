/*
 * Spunkmeyers Pub & Grill - Events Page
 * DESIGN: Cinematic Editorial - Premium event showcase
 * Fonts: Oswald headlines, Lora body (global via CSS)
 * All photos are client-provided originals only
 */
import { IMAGES, LINKS } from "@/lib/constants";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import ReserveForm from "@/components/ReserveForm";
import { useEffect, useRef } from "react";

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>(".fade-up");
    if (!els || els.length === 0) return;
    const check = () => {
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 30) el.classList.add("visible");
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    const fallback = setTimeout(() => els.forEach((el) => el.classList.add("visible")), 1000);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("scroll", check);
    };
  }, []);
  return ref;
}

export default function Events() {
  const fadeRef = useFadeUp();

  return (
    <div ref={fadeRef} className="min-h-screen bg-[#1a1a1a]">
      <SEO
        title="Events | Spunkmeyers Pub & Grill - Bingo, Live Music, Game Day in Wadsworth"
        description="Upcoming events at Spunkmeyers Pub & Grill in Wadsworth, OH. Weekly bingo nights, live music, game day watch parties, and seasonal events. Follow us on Facebook for the latest."
        path="/events"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/491686385_1179562424068372_2438442177184449531_n_a3a3b568.jpg"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Events", url: "https://spunkmeyers.pub/events" }
        ])}
      />

      {/* Hero */}
      <section className="relative h-[35vh] sm:h-[50vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center kenburns"
          style={{ backgroundImage: `url(${IMAGES.bingoXmas})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#1a1a1a]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-3 block">
            What's Happening
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            Events
          </h1>
        </div>
      </section>

      {/* Main Events Content */}
      <section className="py-12 sm:py-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured: Patio Palooza */}
          <div className="fade-up mb-12 sm:mb-20">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-[#E8601C]/15 border border-[#E8601C]/40 text-[#E8601C] font-heading text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#E8601C] animate-pulse" />
                New &middot; Every Friday Night
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#E8601C]/30 shadow-2xl shadow-[#E8601C]/10">
              <img
                src="/patio-palooza.jpg"
                alt="Patio Palooza every Friday night at Spunkmeyers Pub & Grill, featuring DJ B Watts on the patio"
                className="w-full h-auto block"
              />
            </div>
            <div className="mt-7 text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl sm:text-4xl text-[#F5F0EB] tracking-tight mb-3">
                Patio Palooza
              </h2>
              <p className="text-[#999] text-base sm:text-lg leading-relaxed mb-4">
                Our patio turns into the best Friday night in Wadsworth. Live DJ sets, cold drinks,
                and good vibes all night long on the Buck Naked Bar patio.
              </p>
              <p className="text-[#E8601C] font-heading text-sm uppercase tracking-wider">
                Featuring DJ B Watts &amp; Chris from Last Call Entertainment
              </p>
            </div>
          </div>

          {/* Recurring Events - Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {/* Bingo Nights */}
            <div className="event-card-premium p-8 sm:p-10 fade-up">
              <div className="event-card-icon">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl text-[#F5F0EB] mb-3 tracking-tight">
                Bingo Nights
              </h3>
              <p className="text-[#999] text-base leading-relaxed mb-6">
                Cash prizes, cold drinks, and a packed house every time. One of the most popular nights at Spunkmeyers.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-[#E8601C]" />
                <span className="text-[#E8601C] font-heading text-sm uppercase tracking-wider">Check Facebook for Dates</span>
              </div>
            </div>

            {/* Live Music */}
            <div className="event-card-premium p-8 sm:p-10 fade-up" style={{ transitionDelay: "100ms" }}>
              <div className="event-card-icon">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl text-[#F5F0EB] mb-3 tracking-tight">
                Live Music
              </h3>
              <p className="text-[#999] text-base leading-relaxed mb-6">
                Local bands and great sound on the Buck Naked Bar stage. The best outdoor live music spot in Wadsworth.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-[#E8601C]" />
                <span className="text-[#E8601C] font-heading text-sm uppercase tracking-wider">Seasonal Lineups</span>
              </div>
            </div>

            {/* Game Day */}
            <div className="event-card-premium p-8 sm:p-10 fade-up" style={{ transitionDelay: "200ms" }}>
              <div className="event-card-icon">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl text-[#F5F0EB] mb-3 tracking-tight">
                Game Day Watch Parties
              </h3>
              <p className="text-[#999] text-base leading-relaxed mb-6">
                Every screen. Every game. Browns, Guardians, Cavs, and Buckeyes. Official Browns Backer Bar.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-[#E8601C]" />
                <span className="text-[#E8601C] font-heading text-sm uppercase tracking-wider">Every Big Game</span>
              </div>
            </div>

            {/* Specials & Themed Nights */}
            <div className="event-card-premium p-8 sm:p-10 fade-up" style={{ transitionDelay: "300ms" }}>
              <div className="event-card-icon">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl text-[#F5F0EB] mb-3 tracking-tight">
                Specials & Themed Nights
              </h3>
              <p className="text-[#999] text-base leading-relaxed mb-6">
                Holiday parties, seasonal specials, and themed nights throughout the year. There's always something going on.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-[#E8601C]" />
                <span className="text-[#E8601C] font-heading text-sm uppercase tracking-wider">Year-Round Fun</span>
              </div>
            </div>
          </div>

          {/* Photo Showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 sm:mb-20 fade-up">
            <div className="overflow-hidden aspect-square img-zoom">
              <img src={IMAGES.bingoGuys} alt="Bingo night at Spunkmeyers" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square img-zoom">
              <img src={IMAGES.bingoBooth} alt="Friends at Spunkmeyers" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square img-zoom">
              <img src={IMAGES.bingoGroup} alt="Group night at Spunkmeyers" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden aspect-square img-zoom">
              <img src={IMAGES.stPaddys} alt="St. Patrick's Day at Spunkmeyers" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Reserve for the Game */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 sm:mb-20 fade-up">
            <div className="lg:col-span-2">
              <span className="font-heading text-sm text-[#E8601C] uppercase tracking-[0.3em] mb-3 block">
                Big Group? Big Game?
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0EB] mb-4 tracking-tight">
                Reserve for the Game
              </h2>
              <p className="text-[#999] text-base leading-relaxed mb-4">
                Rolling deep for the Browns game, a birthday, or Patio Palooza? Tell us when and
                how many, and we'll make sure there's a spot with a good view of the screens.
              </p>
              <p className="text-[#777] text-sm leading-relaxed">
                We'll call or text to confirm. Prefer to talk?{" "}
                <a href="tel:3303345080" className="text-[#E8601C] hover:text-[#F07A3A]">
                  (330) 334-5080
                </a>
              </p>
            </div>
            <div className="lg:col-span-3 bg-[#181818] border border-white/5 p-6 sm:p-8">
              <ReserveForm />
            </div>
          </div>

          {/* Facebook CTA Section */}
          <div className="events-cta-section p-10 sm:p-16 text-center fade-up">
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F0EB] mb-4 tracking-tight">
                Stay in the Loop
              </h2>
              <p className="text-[#999] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Follow us on Facebook for the latest event announcements, live music lineups, and specials.
              </p>
              <a
                href={LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium inline-flex items-center gap-3 text-base py-4 px-10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Follow Us on Facebook
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom spacer for mobile sticky button */}
      <div className="h-20 bg-[#1a1a1a] lg:hidden" />
    </div>
  );
}
