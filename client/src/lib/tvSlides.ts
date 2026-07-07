/*
 * ============================================================================
 * SPUNKMEYERS TV BOARD — SLIDE DATA
 * ============================================================================
 * This file drives the in-bar TV slideshow at /tv.
 *
 * HOW TO EDIT (no other file needs to change):
 *   - Add / remove / reorder slides in the SLIDES array below.
 *   - Each slide has a `type` that controls how it looks.
 *   - Slides play top-to-bottom, then loop forever.
 *
 * SLIDE TYPES:
 *   special  — a food or drink deal (title, price, when, detail)
 *   event    — a recurring event (title, when, detail, optional image)
 *   games    — the live "on the big screens" game board (auto-updates)
 *   promo    — a brand message (order online, follow us, hours)
 *   ad       — a paid sponsor slot (see "SELLING AD SPACE" below)
 *
 * SELLING AD SPACE (the vision):
 *   Add an { type: "ad", ... } slide. Set `until` to the last day it should
 *   run (YYYY-MM-DD) and it removes ITSELF automatically after that date.
 *   Give the advertiser a `sponsor`, a short `tagline`, and optionally an
 *   `image` (logo or photo) — drop the file in client/public and reference
 *   it as "/their-logo.jpg".
 *
 * CONTENT NOTE: The `special` slides below marked SAMPLE are placeholders —
 * replace the wording/prices with Spunkmeyers' real specials before this
 * goes on the TV. Everything else uses already-confirmed content.
 * ============================================================================
 */

export type Slide =
  | {
      type: "welcome";
      id: string;
    }
  | {
      type: "special";
      id: string;
      title: string;
      price?: string;
      when?: string; // e.g. "Every Wednesday"
      detail?: string;
      sample?: boolean; // true = placeholder, replace before going live
    }
  | {
      type: "event";
      id: string;
      title: string;
      when: string;
      detail?: string;
      image?: string;
    }
  | {
      type: "games";
      id: string;
    }
  | {
      type: "weather";
      id: string;
    }
  | {
      type: "promo";
      id: string;
      kicker: string;
      title: string;
      detail?: string;
      footer?: string;
    }
  | {
      type: "ad";
      id: string;
      sponsor: string;
      tagline?: string;
      detail?: string;
      image?: string; // "/sponsor-logo.jpg" from client/public
      until?: string; // YYYY-MM-DD — auto-hides after this date
    };

// How long each slide stays on screen (ms). Individual slides can't override
// yet; keep this comfortable for reading across a room.
export const SLIDE_MS = 9000;

// ---------------------------------------------------------------------------
// TICKER MESSAGES — the "SPUNKS" scroll along the bottom of the board.
// Edit these lines freely. The sports ticker (scores/schedule) and the events
// ticker are generated automatically from the game feed + event slides above.
// ---------------------------------------------------------------------------
export const TICKER_MESSAGES: string[] = [
  "18 Beers on Tap — Always Something New",
  "Official Cleveland Browns Backer Bar",
  "The Best Patio in Wadsworth — the Buck Naked Bar",
  "Order Online on DoorDash",
  "Follow @spunkmeyerspubandgrill",
];

export const SLIDES: Slide[] = [
  // ---- Branded open: logo + today's hours ----
  { type: "welcome", id: "welcome" },

  // ---- Signature recurring event (client-confirmed) ----
  {
    type: "event",
    id: "patio-palooza",
    title: "Patio Palooza",
    when: "Every Friday Night",
    detail: "Live DJ sets with DJ B Watts & Chris from Last Call Entertainment. Good vibes, cold drinks, best patio in Wadsworth.",
    image: "/patio-palooza.jpg",
  },

  // ---- Live game board (auto-updates from ESPN) ----
  { type: "games", id: "big-screens" },

  // ---- Live weather + 3-day forecast (auto-updates; hidden if unavailable) ----
  { type: "weather", id: "weather" },

  // ---- SAMPLE specials: replace wording/prices with real Spunks specials ----
  {
    type: "special",
    id: "sample-wing-day",
    title: "Wing Wednesday",
    price: "Ask your server",
    when: "Every Wednesday",
    detail: "SAMPLE SLIDE — replace with your real wing-night deal.",
    sample: true,
  },
  {
    type: "special",
    id: "sample-gameday-beer",
    title: "Game Day Beer Special",
    price: "$2",
    when: "Every Guardians Game",
    detail: "SAMPLE SLIDE — confirm the beer, size & price before this runs.",
    sample: true,
  },

  // ---- More recurring events (from the Events page) ----
  {
    type: "event",
    id: "bingo",
    title: "Bingo Nights",
    when: "Check Facebook for Dates",
    detail: "Cash prizes, cold drinks, and a packed house every time.",
  },
  {
    type: "event",
    id: "game-day",
    title: "Game Day Watch Parties",
    when: "Every Big Game",
    detail: "Official Cleveland Browns Backer Bar. Browns, Guardians, Cavs & Buckeyes on every screen.",
  },

  // ---- Ad slot: this is where sold sponsorships go ----
  {
    type: "ad",
    id: "ad-slot-open",
    sponsor: "Your Business Here",
    tagline: "Advertise on our screens",
    detail: "Local business? Reach every guest at Spunkmeyers. Ask a manager about sponsoring this board.",
    // until: "2026-12-31",  // set an end date on real, sold ads
  },

  // ---- Brand promos ----
  {
    type: "promo",
    id: "order-online",
    kicker: "Can't Stay?",
    title: "Order Online",
    detail: "Get Spunks delivered on DoorDash.",
    footer: "spunkmeyers.pub",
  },
  {
    type: "promo",
    id: "follow-us",
    kicker: "Stay in the Loop",
    title: "Follow Us",
    detail: "@spunkmeyerspubandgrill on Facebook & Instagram for events, specials & lineups.",
    footer: "spunkmeyers.pub",
  },
];
