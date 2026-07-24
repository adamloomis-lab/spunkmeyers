import { BUSINESS } from "../lib/constants";

// Spoken narration for the main pages: the "Listen to this page" audio tour.
// Every fact here is composed from the site's own published copy (constants.ts
// plus what the pages already say), so the narration can never state something
// the site does not. Audio is pre-generated once per section by
// scripts/narrate.mjs (hash-cached, so only edited sections re-bill); the
// player falls back to the browser voice for any section whose file is missing.
//
// anchor = the [data-narrate] attribute of the section the player scrolls to
// and gently highlights while that part plays.

export type NarrationSection = {
  id: string;
  title: string;
  text: string;
  anchor?: string;
};

export type PageNarration = {
  title: string;
  sections: NarrationSection[];
};

// "11am - 10pm" -> "11 AM to 10 PM", derived from the same hours the site shows.
const spokenTime = (h: string) =>
  h
    .replace(/(\d)\s*am/gi, "$1 AM")
    .replace(/(\d)\s*pm/gi, "$1 PM")
    .replace(/12 AM/g, "midnight")
    .replace(/\s*-\s*/, " to ");

const hoursSpoken = `Our hours: ${BUSINESS.hours
  .map((h) => `${h.day}, ${spokenTime(h.hours)}`)
  .join(". ")}.`;

const addressSpoken = BUSINESS.address; // "993 High St, Wadsworth, OH 44281" (tts.mjs expands St and OH)

export const narration: Record<string, PageNarration> = {
  "/": {
    title: "Welcome to Spunkmeyers",
    sections: [
      {
        id: "welcome",
        title: "Welcome",
        anchor: "home-hero",
        text: `Welcome to Spunkmeyers Pub and Grill, Wadsworth's favorite pub. Cold beer, hot food, and the best patio in town. You will find us at ${addressSpoken}, and you can reach us at ${BUSINESS.phone}.`,
      },
      {
        id: "patio",
        title: "The Buck Naked Bar",
        anchor: "home-patio",
        text: `The Buck Naked Bar is our outdoor patio. String lights, palm trees, and cold beer under the open sky. This is where summer lives in Wadsworth.`,
      },
      {
        id: "palooza",
        title: "Patio Palooza",
        anchor: "home-palooza",
        text: `Every Friday night, Patio Palooza takes over the patio with live DJ sets, cold drinks, and the best crowd in town, featuring DJ B Watts and Chris from Last Call Entertainment.`,
      },
      {
        id: "food",
        title: "From our kitchen",
        anchor: "home-food",
        text: `From our kitchen: smash burgers cooked to order, wings, loaded fries, and more, made fresh every day. Take a look at the full menu any time.`,
      },
      {
        id: "sports",
        title: "Ohio sports headquarters",
        anchor: "home-sports",
        text: `We are your Ohio sports headquarters and the official Cleveland Browns Backer Bar. Every Browns, Guardians, Cavaliers, and Ohio State game, on every screen. Come watch with us.`,
      },
    ],
  },
  "/menu": {
    title: "Our menu",
    sections: [
      {
        id: "summer",
        title: "Summer Menu",
        anchor: "menu-hero",
        text: `Here is our menu. Right now we have a limited-time Summer Menu, with summer shareables, salads and sandwiches, and entrees like Island Salmon and blackened chicken and shrimp rice bowls.`,
      },
      {
        id: "core",
        title: "The full menu",
        text: `Our core menu has wings with a big list of sauces and rubs, smash burgers, pizzas, Philly melts, tacos, handhelds, loaded fries, and more. Everything is cooked to order and made fresh daily, and we pour 18 beers on tap.`,
      },
    ],
  },
  "/events": {
    title: "Events at Spunkmeyers",
    sections: [
      {
        id: "palooza",
        title: "Patio Palooza",
        anchor: "events-palooza",
        text: `Patio Palooza happens every Friday night on the patio, with live DJ sets from DJ B Watts and Chris from Last Call Entertainment. Good vibes, cold drinks, and great times.`,
      },
      {
        id: "recurring",
        title: "What's happening",
        anchor: "events-recurring",
        text: `We also host bingo nights with cash prizes, live music on the Buck Naked Bar stage, and game day watch parties for every big game. As the official Browns Backer Bar, we are your home for the game.`,
      },
      {
        id: "reserve",
        title: "Reserve for the game",
        anchor: "events-reserve",
        text: `Bringing a big group or planning a game day? Request a spot right here on this page, and we will call or text to confirm. You can also reach us at ${BUSINESS.phone}.`,
      },
    ],
  },
  "/experience": {
    title: "The Spunkmeyers experience",
    sections: [
      {
        id: "patio",
        title: "The patio",
        anchor: "exp-hero",
        text: `Welcome to the Spunkmeyers experience. The Buck Naked Bar is the best patio in Wadsworth: open air, string lights, cold drinks, and the whole neighborhood out having a good time.`,
      },
      {
        id: "gameday",
        title: "Game day",
        anchor: "exp-sports",
        text: `Inside, every screen is on the game. We are your Ohio sports headquarters and the official Cleveland Browns Backer Bar, with the best crowd in town when the Browns, Guardians, Cavaliers, or Buckeyes are playing.`,
      },
    ],
  },
  "/contact": {
    title: "Contact us",
    sections: [
      {
        id: "reach",
        title: "How to reach us",
        anchor: "contact-hero",
        text: `We would love to hear from you. Call us at ${BUSINESS.phone}, or use the form on this page to send a message, ask a question, or book a big group, and we will get back to you.`,
      },
      {
        id: "visit",
        title: "Where to find us",
        anchor: "contact-map",
        text: `You will find us at ${addressSpoken}. ${hoursSpoken}`,
      },
    ],
  },
};
