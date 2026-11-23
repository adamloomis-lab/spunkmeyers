import { isChristmasSeason } from "../../shared/season.ts";

// Serve the same fully rendered homepage to people and crawlers, without
// freezing the Christmas campaign into the HTML after midnight January 1.
export default function homeSeason(request: Request) {
  if (isChristmasSeason()) return new URL("/home-christmas.html", request.url);
}

export const config = { path: "/" };
