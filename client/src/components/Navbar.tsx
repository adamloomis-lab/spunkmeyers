import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BUSINESS, IMAGES, LINKS } from "@/lib/constants";
import { Menu, X, Phone } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const navLinks = [
    { label: "Menu", href: "/menu" },
    { label: "Experience", href: "/experience" },
    { label: "Events", href: "/events" },
    { label: "Beer List", href: LINKS.beerList, external: true },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#111111]/95 backdrop-blur-md shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img
                src={IMAGES.logo}
                alt="Spunkmeyers Pub & Grill"
                className="h-16 sm:h-20 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-heading text-sm font-semibold uppercase tracking-widest text-[#F5F0EB] hover:text-[#E8601C] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`font-heading text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
                      location === link.href
                        ? "text-[#E8601C]"
                        : "text-[#F5F0EB] hover:text-[#E8601C]"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <a
                href={LINKS.doordash}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium btn-premium-pulse text-sm py-3 px-6"
              >
                Order Online
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-[#F5F0EB] p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu: dimmed overlay + full-height slide-in panel */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-40 w-full max-w-sm bg-[#111111] border-l border-white/10 shadow-2xl shadow-black/60 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="flex-1 flex flex-col justify-center px-8 gap-1 pt-20">
          {navLinks.map((link, i) => {
            const itemClass = `mobile-nav-link font-heading text-3xl font-bold uppercase tracking-wide py-2.5 block ${
              !link.external && location === link.href
                ? "text-[#E8601C]"
                : "text-[#F5F0EB] hover:text-[#E8601C]"
            } ${mobileOpen ? "open" : ""}`;
            const style = { transitionDelay: mobileOpen ? `${120 + i * 55}ms` : "0ms" };
            return link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClass}
                style={style}
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className={itemClass} style={style}>
                {link.label}
              </Link>
            );
          })}
          <a
            href={LINKS.doordash}
            target="_blank"
            rel="noopener noreferrer"
            className={`mobile-nav-link btn-premium text-base py-4 px-8 mt-6 self-start ${mobileOpen ? "open" : ""}`}
            style={{ transitionDelay: mobileOpen ? `${120 + navLinks.length * 55}ms` : "0ms" }}
          >
            Order Online
          </a>
        </div>

        {/* Panel footer: quick contact */}
        <div
          className={`mobile-nav-link px-8 pb-8 pt-6 border-t border-white/10 ${mobileOpen ? "open" : ""}`}
          style={{ transitionDelay: mobileOpen ? `${180 + navLinks.length * 55}ms` : "0ms" }}
        >
          <a href={BUSINESS.phoneLink} className="flex items-center gap-2 text-[#E8601C] font-heading text-lg mb-2">
            <Phone className="w-4 h-4" />
            {BUSINESS.phone}
          </a>
          <p className="text-[#888] text-sm">{BUSINESS.address}</p>
          <div className="flex gap-5 mt-4">
            <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-[#999] hover:text-[#E8601C] text-sm transition-colors">
              Facebook
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-[#999] hover:text-[#E8601C] text-sm transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
