import { useEffect, useState } from "react";

// One-time 2026 campaign. The normal homepage returns at midnight in Wadsworth.
export const CHRISTMAS_START = Date.parse("2026-11-23T00:00:00-05:00");
export const CHRISTMAS_END = Date.parse("2027-01-01T00:00:00-05:00");
export function isChristmasSeason(now = Date.now()) {
  return now >= CHRISTMAS_START && now < CHRISTMAS_END;
}
export function useChristmasSeason() {
  const [active, setActive] = useState(() => isChristmasSeason());
  useEffect(() => {
    const update = () => setActive(isChristmasSeason());
    const timer = window.setInterval(update, 30_000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  return active;
}
