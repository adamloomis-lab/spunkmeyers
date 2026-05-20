import { IMAGES, LINKS, BUSINESS, getCurrentDayName } from "@/lib/constants";
import { Link } from "wouter";

export default function Footer() {
  const today = getCurrentDayName();

  return (
    <footer className="bg-[#111111] border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & About */}
          <div>
            <img
              src={IMAGES.logo}
              alt="Spunkmeyers Pub & Grill"
              className="h-20 w-auto mb-6"
            />
            <p className="text-[#999] text-sm leading-relaxed">
              Wadsworth's favorite pub. Cold beer, hot food, and the best patio in town.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading text-[#E8601C] text-sm uppercase tracking-widest mb-4">
              Navigate
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/menu" className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm">Menu</Link>
              <Link href="/experience" className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm">Experience</Link>
              <Link href="/events" className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm">Events</Link>
              <a href={LINKS.beerList} target="_blank" rel="noopener noreferrer" className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm">Beer List</a>
              <Link href="/contact" className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm">Contact</Link>
              <Link href="/careers" className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm">Careers</Link>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-heading text-[#E8601C] text-sm uppercase tracking-widest mb-4">
              Location
            </h4>
            <p className="text-[#F5F0EB] mb-2">{BUSINESS.address}</p>
            <a
              href={BUSINESS.phoneLink}
              className="text-[#E8601C] font-semibold text-lg hover:text-[#F07A3A] transition-colors"
            >
              {BUSINESS.phone}
            </a>
          </div>

          {/* Hours with current day highlighted */}
          <div>
            <h4 className="font-heading text-[#E8601C] text-sm uppercase tracking-widest mb-4">
              Hours
            </h4>
            <div className="space-y-1">
              {BUSINESS.hours.map((h) => {
                const isToday = h.day === today;
                return (
                  <div
                    key={h.day}
                    className={`hours-row flex justify-between text-sm py-0.5 ${isToday ? "today" : ""}`}
                  >
                    <span className={`hours-day ${isToday ? "" : "text-[#999]"}`}>{h.day}</span>
                    <span className={`hours-time ${isToday ? "" : "text-[#F5F0EB]"}`}>{h.hours}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-heading text-[#E8601C] text-sm uppercase tracking-widest mb-4">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
              <a
                href={LINKS.doordash}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5F0EB] hover:text-[#E8601C] transition-colors text-sm flex items-center gap-2"
              >
                <img src={IMAGES.doordashLogo} alt="DoorDash" className="w-5 h-5 object-contain brightness-0 invert" />
                Order on DoorDash
              </a>
              <Link
                href="/careers"
                className="text-[#E8601C] hover:text-[#F07A3A] transition-colors text-sm flex items-center gap-2 font-semibold mt-2"
              >
                We're Hiring &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col items-center gap-2">
          <p className="text-[#666] text-sm">
            &copy; {new Date().getFullYear()} Spunkmeyers Pub & Grill. All rights reserved.
          </p>
          <a
            href="https://adamloomis.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] hover:text-[#E8601C] transition-colors text-xs"
          >
            website by adamloomis.online
          </a>
        </div>
      </div>
    </footer>
  );
}
