import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { IMAGES, LINKS } from "@/lib/constants";
import { Menu, X, MapPin, ShoppingBag } from "lucide-react";

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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#111111]/98 backdrop-blur-lg transition-all duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 pt-20">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-2xl font-bold uppercase tracking-widest text-[#F5F0EB] hover:text-[#E8601C] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`font-heading text-2xl font-bold uppercase tracking-widest transition-colors ${
                  location === link.href ? "text-[#E8601C]" : "text-[#F5F0EB] hover:text-[#E8601C]"
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
            className="btn-premium text-lg py-4 px-10 mt-4"
          >
            Order Online
          </a>
        </div>
      </div>

      {/* Mobile-only sticky bottom bar - two compact buttons, not full width */}
      {scrolled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex gap-3 lg:hidden">
          <a
            href={LINKS.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#222222]/95 backdrop-blur-md border border-white/10 text-[#F5F0EB] font-heading text-sm font-semibold uppercase tracking-wider rounded-md shadow-lg shadow-black/40 transition-all duration-300 active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            Directions
          </a>
          <a
            href={LINKS.doordash}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-b from-[#F07A3A] to-[#d4540f] text-white font-heading text-sm font-semibold uppercase tracking-wider rounded-md shadow-lg shadow-black/40 transition-all duration-300 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Order Online
          </a>
        </div>
      )}
    </>
  );
}
