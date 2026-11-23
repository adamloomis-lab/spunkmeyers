/*
 * DESIGN: Cinematic Editorial - Dark magazine spread
 * Tabbed menu with dark cards, orange category headers, GF/SPX badges
 */
import { useState, useRef, useEffect } from "react";
import { IMAGES, LINKS } from "@/lib/constants";
import SEO from "@/components/SEO";
import { Download, Expand } from "lucide-react";
import MenuLightbox, { type MenuPage } from "@/components/MenuLightbox";

// The actual printed menu (scanned front and back), for people who want to
// see or download it exactly as it reads in the restaurant. Kept separate
// from the itemized list below, which is the same content laid out for the
// web.
const MENU_PDF = "/menu/spunkmeyers-menu.pdf";
const MENU_PAGES: MenuPage[] = [
  {
    src: "/img/menu-page-1.jpg",
    alt: "Spunkmeyers Pub & Grill menu, page 1 of 2: wings, sauces, starters, overloaded fries, salads and soups",
  },
  {
    src: "/img/menu-page-2.jpg",
    alt: "Spunkmeyers Pub & Grill menu, page 2 of 2: pizzas, smash burgers, build your own, handhelds, Philly melts, tacos, entrees",
  },
];
const MENU_SPREADS = [
  "/img/menu-page-1-spread.jpg",
  "/img/menu-page-2-spread.jpg",
];

import { menuData } from "@/data/menu";

export default function Menu() {
  const [activeTab, setActiveTab] = useState("wings");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            if (id) setActiveTab(id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Keep the active category centered in the mobile scroll strip (no-op when it wraps on desktop).
  useEffect(() => {
    const container = tabsRef.current;
    const btn = tabBtnRefs.current[activeTab];
    if (!container || !btn) return;
    if (container.scrollWidth <= container.clientWidth) return;
    const target =
      btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeTab]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <SEO path="/menu" />
      {/* Hero */}
      <section
        data-narrate="menu-hero"
        className="relative h-[35vh] sm:h-[50vh] flex items-end overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.wings})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#1a1a1a]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            Our Menu
          </h1>
        </div>
      </section>

      {/* ===== THE ACTUAL PRINTED MENU: view or download it as-is ===== */}
      <section className="relative bg-[#111111] border-b border-[#E8601C]/15 py-14 sm:py-20 overflow-hidden">
        {/* Warm glow behind the spread, same treatment as the SPX band on Home */}
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[85vw] h-[55vw] max-w-[1100px] max-h-[700px] rounded-full bg-[#E8601C]/10 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              Our Menu Here
            </h2>
            <p className="text-[#F5F0EB]/70 text-lg mt-4 leading-relaxed">
              Click a page to read it full-screen, or take the PDF with you.
            </p>
            <a
              href={MENU_PDF}
              download
              className="btn-premium inline-flex items-center justify-center gap-2 mt-7"
            >
              <Download className="w-4 h-4" />
              Download the Menu (PDF)
            </a>
          </div>

          {/* An open menu laid on the table: two pages meeting at a center fold */}
          <div className="relative mx-auto w-full max-w-[1150px] grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-0 shadow-[0_40px_90px_-25px_rgba(0,0,0,0.9)]">
            {MENU_PAGES.map((page, i) => (
              <button
                key={page.src}
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`View page ${i + 1} of the menu full-screen`}
                className="group relative block aspect-[792/1224] overflow-hidden ring-1 ring-white/10 hover:ring-[#E8601C]/60 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8601C]"
              >
                <img
                  src={MENU_SPREADS[i]}
                  alt={page.alt}
                  loading="lazy"
                  width={1200}
                  height={1855}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 flex flex-col items-center justify-center gap-3">
                  <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="font-heading text-sm uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Read Page {i + 1}
                  </span>
                </div>
                <span className="sm:hidden absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-heading uppercase tracking-wider px-2 py-1">
                  Page {i + 1}
                </span>
              </button>
            ))}

            {/* Center fold: sells the open-menu illusion on desktop only */}
            <div
              aria-hidden="true"
              className="hidden sm:block absolute inset-y-0 left-1/2 w-20 -translate-x-1/2 pointer-events-none bg-gradient-to-r from-transparent via-black/50 to-transparent"
            />
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <MenuLightbox
          pages={MENU_PAGES}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          downloadHref={MENU_PDF}
        />
      )}

      {/* Sticky category nav: wraps so every category is visible on desktop; swipeable strip on mobile */}
      <div className="sticky top-20 z-30 bg-[#111111]/95 backdrop-blur-md border-b border-white/5">
        <div className="relative max-w-[1400px] mx-auto">
          <div
            ref={tabsRef}
            className="px-4 sm:px-6 lg:px-8 py-3 flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide lg:flex-wrap lg:justify-center lg:overflow-visible"
          >
            {menuData.map(cat => (
              <button
                key={cat.id}
                ref={el => {
                  tabBtnRefs.current[cat.id] = el;
                }}
                onClick={() => scrollToSection(cat.id)}
                className={`menu-tab ${activeTab === cat.id ? "active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Right-edge fade to hint there's more to swipe (mobile only) */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#111111] to-transparent lg:hidden" />
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {menuData.map(category => (
          <div
            key={category.id}
            data-section={category.id}
            ref={el => {
              sectionRefs.current[category.id] = el;
            }}
            className="mb-10 sm:mb-16"
          >
            <div className="mb-6 border-b border-[#E8601C]/30 pb-3">
              <h2 className="font-heading text-3xl sm:text-4xl text-[#E8601C]">
                {category.label}
              </h2>
              {category.note && (
                <p className="text-[#999] text-sm mt-2 italic">
                  {category.note}
                </p>
              )}
            </div>

            {category.id === "sauces" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#222] px-4 py-3 border border-white/5 flex items-center gap-2"
                  >
                    <span className="text-[#F5F0EB] text-sm">{item.name}</span>
                    {item.spx && (
                      <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm flex-shrink-0">
                        SPX
                      </span>
                    )}
                  </div>
                ))}
                <div className="col-span-full mt-4">
                  <p className="text-[#E8601C] font-heading text-sm uppercase tracking-wider mb-2">
                    Dry Rubs
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Bourbon",
                      "Cajun",
                      "Jerk",
                      "Parmesan Ranch",
                      "Lemon Pepper",
                    ].map(rub => (
                      <span
                        key={rub}
                        className="bg-[#222] px-4 py-2 border border-white/5 text-[#F5F0EB] text-sm"
                      >
                        {rub}{" "}
                        {rub === "Bourbon" && (
                          <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm ml-1">
                            SPX
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#222] p-5 border border-white/5 hover:border-[#E8601C]/20 transition-colors duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[#F5F0EB] font-semibold text-base group-hover:text-[#E8601C] transition-colors">
                          {item.name}
                        </h3>
                        {item.topSeller && (
                          <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-2 py-0.5 rounded-sm">
                            Top Seller
                          </span>
                        )}
                        {item.gf && (
                          <span className="text-[8px] font-heading uppercase tracking-wider border border-green-500/50 text-green-400 px-1.5 py-0.5 rounded-sm">
                            GF
                          </span>
                        )}
                        {item.spx && (
                          <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm">
                            SPX
                          </span>
                        )}
                      </div>
                      {item.price && (
                        <span className="text-[#E8601C] font-heading text-lg font-bold flex-shrink-0">
                          {item.price}
                        </span>
                      )}
                    </div>
                    {item.desc && (
                      <p className="text-[#999] text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="border-t border-white/10 pt-6 mt-8 flex flex-wrap gap-6 text-sm text-[#999]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-heading uppercase tracking-wider border border-green-500/50 text-green-400 px-1.5 py-0.5 rounded-sm">
              GF
            </span>
            <span>Gluten Sensitive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm">
              SPX
            </span>
            <span>Spunkmeyers Original</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky button */}
      <div className="h-20 bg-[#1a1a1a] lg:hidden" />
    </div>
  );
}
