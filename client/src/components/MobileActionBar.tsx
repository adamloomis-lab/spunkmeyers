import { Phone, Navigation, ShoppingBag } from "lucide-react";
import { BUSINESS, LINKS } from "@/lib/constants";

/**
 * Sticky mobile action bar. Always-visible one-thumb access to Call, Directions,
 * and Order Online. Desktop is unaffected (lg:hidden).
 */
export default function MobileActionBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-[#111111]/95 backdrop-blur-md border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Quick actions"
    >
      <div className="grid grid-cols-3 divide-x divide-white/10">
        <a
          href={BUSINESS.phoneLink}
          className="flex flex-col items-center justify-center gap-1 py-3 text-[#F5F0EB] active:bg-white/5 transition-colors"
          aria-label={`Call ${BUSINESS.name}`}
        >
          <Phone className="w-5 h-5 text-[#E8601C]" />
          <span className="font-heading text-[11px] uppercase tracking-[0.15em]">Call</span>
        </a>
        <a
          href={LINKS.directions}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-3 text-[#F5F0EB] active:bg-white/5 transition-colors"
          aria-label="Get directions to Spunkmeyers"
        >
          <Navigation className="w-5 h-5 text-[#E8601C]" />
          <span className="font-heading text-[11px] uppercase tracking-[0.15em]">Directions</span>
        </a>
        <a
          href={LINKS.doordash}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-3 bg-[#E8601C] text-white active:bg-[#d4540f] transition-colors"
          aria-label="Order online on DoorDash"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-heading text-[11px] uppercase tracking-[0.15em]">Order</span>
        </a>
      </div>
    </div>
  );
}
