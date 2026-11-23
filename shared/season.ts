// One-time 2026 campaign. The normal homepage returns at midnight in Wadsworth.
export const CHRISTMAS_START = Date.parse("2026-11-23T00:00:00-05:00");
export const CHRISTMAS_END = Date.parse("2027-01-01T00:00:00-05:00");
export function isChristmasSeason(now = Date.now()) {
  return now >= CHRISTMAS_START && now < CHRISTMAS_END;
}
