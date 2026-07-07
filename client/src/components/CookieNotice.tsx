import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";

const STORAGE_KEY = "spunkmeyers.cookieNoticeDismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        // Small delay so the banner doesn't fight the hero on first paint.
        const t = setTimeout(() => setVisible(true), 900);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked; skip showing so we never break the page.
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      // Sit above the mobile action bar on small screens; bottom-right on desktop.
      className="fixed z-40 left-4 right-4 bottom-24 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md"
      role="dialog"
      aria-label="Cookie notice"
    >
      <div className="bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl shadow-black/50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <p className="text-[#F5F0EB] text-sm leading-relaxed flex-1">
            We use minimal cookies to make the site work and understand what people love. See our{" "}
            <Link href="/privacy" className="text-[#E8601C] hover:text-[#F07A3A] underline">
              Privacy Policy
            </Link>
            .
          </p>
          <button
            onClick={dismiss}
            className="text-[#888] hover:text-[#F5F0EB] transition-colors -mt-1 -mr-1 p-1"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={dismiss}
            className="font-heading text-xs uppercase tracking-[0.15em] bg-[#E8601C] hover:bg-[#F07A3A] text-white px-4 py-2 rounded transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
