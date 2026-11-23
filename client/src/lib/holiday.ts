import { createContext, useContext, useEffect, useState } from "react";
import { isChristmasSeason } from "@shared/season";
export {
  CHRISTMAS_START,
  CHRISTMAS_END,
  isChristmasSeason,
} from "@shared/season";

// Static rendering produces both seasonal variants. Browsers use the live clock.
export const ChristmasSeasonContext = createContext<boolean | undefined>(
  undefined
);

export function useChristmasSeason() {
  const override = useContext(ChristmasSeasonContext);
  const [active, setActive] = useState(() => override ?? isChristmasSeason());
  useEffect(() => {
    const update = () => setActive(isChristmasSeason());
    const timer = window.setInterval(update, 30_000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  return override ?? active;
}
