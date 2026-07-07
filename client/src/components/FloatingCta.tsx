import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LINKS } from "@/lib/constants";

/**
 * Desktop-only floating "Order Online" pill. Appears after scrolling past the
 * hero, hides again near the footer so it never overlaps footer content.
 * Mobile already has the sticky action bar, so this renders lg+ only.
 */
export default function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.8;
      const doc = document.documentElement;
      const nearBottom = window.scrollY + window.innerHeight > doc.scrollHeight - 420;
      setShow(pastHero && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={LINKS.doordash}
      target="_blank"
      rel="noopener noreferrer"
      className={`floating-cta hidden lg:inline-flex ${show ? "show" : ""}`}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      <ShoppingBag className="w-4 h-4" />
      Order Online
    </a>
  );
}
