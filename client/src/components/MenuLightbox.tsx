/*
 * Full-screen viewer for the actual scanned pages of the printed
 * Spunkmeyers menu. Keyboard (arrows + Escape), backdrop click, and a
 * focus trap so it meets the site's WCAG 2.1 AA bar.
 */
import { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export interface MenuPage {
  src: string;
  alt: string;
}

interface MenuLightboxProps {
  pages: MenuPage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  downloadHref: string;
}

export default function MenuLightbox({
  pages,
  index,
  onIndexChange,
  onClose,
  downloadHref,
}: MenuLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Fit-to-screen is unreadable for an 11x17 menu, so zoomed mode blows the
  // page up past the viewport and lets the container scroll to pan.
  const [zoomed, setZoomed] = useState(false);
  // Mirror of `zoomed` for the keydown listener, which is bound per page and
  // would otherwise close over a stale value.
  const zoomedRef = useRef(false);
  useEffect(() => {
    zoomedRef.current = zoomed;
  }, [zoomed]);

  const go = (delta: number) => {
    onIndexChange((index + delta + pages.length) % pages.length);
  };

  const toggleZoom = () => {
    setZoomed((z) => {
      if (!z) {
        // Land in the middle of the page rather than the top-left corner.
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        });
      }
      return !z;
    });
  };

  useEffect(() => {
    setZoomed(false);
  }, [index]);

  useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomedRef.current) setZoomed(false);
        else onClose();
      }
      // While zoomed the arrows belong to the scroll container, for panning.
      else if (e.key === "ArrowRight" && !zoomedRef.current) go(1);
      else if (e.key === "ArrowLeft" && !zoomedRef.current) go(-1);
      else if (e.key === "Tab") {
        // Simple focus trap: the dialog only has a few focusable children.
        const focusables =
          dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const page = pages[index];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Spunkmeyers menu, page ${index + 1} of ${pages.length}`}
      ref={dialogRef}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0">
        <span className="text-white/70 font-heading text-sm uppercase tracking-wider">
          Page {index + 1} of {pages.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleZoom}
            aria-pressed={zoomed}
            className="inline-flex items-center gap-2 text-white/80 hover:text-[#E8601C] text-sm font-heading uppercase tracking-wider px-3 py-2 transition-colors"
          >
            {zoomed ? (
              <ZoomOut className="w-4 h-4" />
            ) : (
              <ZoomIn className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {zoomed ? "Fit to screen" : "Zoom in"}
            </span>
          </button>
          <a
            href={downloadHref}
            download
            className="inline-flex items-center gap-2 text-white/80 hover:text-[#E8601C] text-sm font-heading uppercase tracking-wider px-3 py-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu viewer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className={
            zoomed
              ? "absolute inset-0 overflow-auto overscroll-contain px-2 pb-4"
              : "absolute inset-0 flex items-center justify-center px-2 sm:px-16 pb-4"
          }
        >
          <img
            src={page.src}
            alt={page.alt}
            onClick={toggleZoom}
            className={
              zoomed
                ? "w-[1600px] max-w-none mx-auto shadow-2xl cursor-zoom-out"
                : "max-h-full max-w-full object-contain shadow-2xl cursor-zoom-in"
            }
          />
        </div>

        {pages.length > 1 && !zoomed && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous page"
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[#E8601C] hover:border-[#E8601C] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next page"
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[#E8601C] hover:border-[#E8601C] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {!zoomed && (
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-white/45 text-xs font-heading uppercase tracking-[0.2em]">
            Click the menu to zoom in
          </span>
        )}
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-5 flex-shrink-0">
          {pages.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === index ? "bg-[#E8601C] w-6" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
