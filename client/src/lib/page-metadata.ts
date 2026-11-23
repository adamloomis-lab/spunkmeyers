export const SITE_URL = "https://spunkmeyers.pub";
export const SITE_NAME = "Spunkmeyers Pub & Grill";

export interface PageMetadata {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  label: string;
  noindex?: boolean;
}
const restaurantImage = "/social/spunkmeyers-restaurant.jpg";
const restaurantAlt =
  "Spunkmeyers Pub & Grill smash burgers and the Buck Naked Bar patio in Wadsworth, Ohio";
export const PAGE_METADATA: Record<string, PageMetadata> = {
  "/": {
    title: "Spunkmeyers Pub & Grill | Restaurant & Bar in Wadsworth, OH",
    description:
      "Visit Spunkmeyers Pub & Grill at 993 High St in Wadsworth, Ohio. Smash burgers, wings, 18 beers on tap, an outdoor patio and Cleveland sports. View menu and hours.",
    image: restaurantImage,
    imageAlt: restaurantAlt,
    label: "Home",
  },
  "/menu": {
    title: "Menu: Burgers, Wings & More | Spunkmeyers Pub & Grill",
    description:
      "Explore the Spunkmeyers menu in Wadsworth: smash burgers, wings, loaded fries, pizzas, sandwiches and more. Browse food prices, download the menu or order delivery.",
    image: "/social/spunkmeyers-menu.jpg",
    imageAlt:
      "Wings and smash burgers served at Spunkmeyers Pub & Grill in Wadsworth",
    label: "Menu",
  },
  "/experience": {
    title: "Patio, Sports & Pub Atmosphere | Spunkmeyers in Wadsworth",
    description:
      "See inside Spunkmeyers Pub & Grill in Wadsworth, Ohio. Explore the Buck Naked Bar patio, Cleveland game days, live entertainment and the neighborhood pub atmosphere.",
    image: "/social/spunkmeyers-experience.jpg",
    imageAlt:
      "The colorful Buck Naked Bar patio and bar seating at Spunkmeyers Pub & Grill",
    label: "Experience",
  },
  "/events": {
    title: "Events, Bingo & Game Days | Spunkmeyers Pub & Grill",
    description:
      "Plan a night at Spunkmeyers in Wadsworth with bingo, live entertainment, Cleveland sports and seasonal events. Check the latest lineup or send a party request.",
    image: "/social/spunkmeyers-events.jpg",
    imageAlt: "Guests enjoying an event inside Spunkmeyers Pub & Grill",
    label: "Events",
  },
  "/contact": {
    title: "Hours, Location & Contact | Spunkmeyers in Wadsworth, OH",
    description:
      "Find Spunkmeyers Pub & Grill at 993 High St, Wadsworth, OH 44281. View daily opening hours, get directions or call (330) 334-5080. Open seven days a week.",
    image: "/social/spunkmeyers-visit.jpg",
    imageAlt:
      "The Spunkmeyers Pub & Grill storefront at 993 High Street in Wadsworth, Ohio",
    label: "Contact",
  },
  "/careers": {
    title: "Restaurant & Bar Jobs | Spunkmeyers Pub & Grill, Wadsworth",
    description:
      "Apply to join Spunkmeyers Pub & Grill in Wadsworth, Ohio. Explore bartending, serving and kitchen roles and send your availability and experience to our team.",
    image: "/social/spunkmeyers-careers.jpg",
    imageAlt: "Team members and the bar at Spunkmeyers Pub & Grill",
    label: "Careers",
  },
  "/games": {
    title: "Spunks Arcade | Free Phone Games at Spunkmeyers",
    description:
      "Play Spunks Pub Crawl and Spunks Stack, two free phone games from Spunkmeyers Pub & Grill in Wadsworth. No app download. Compete on the pub leaderboards.",
    image: "/img/og-arcade.png",
    imageAlt:
      "Spunks Arcade: Pub Crawl and Stack games from Spunkmeyers Pub & Grill",
    label: "Games",
  },
  "/pub-crawl": {
    title: "Spunks Pub Crawl | Spunkmeyers Pub & Grill",
    description:
      "Run down High Street, jump obstacles and grab an SPX in Spunks Pub Crawl. A free phone game from Spunkmeyers Pub & Grill in Wadsworth, with a pub leaderboard.",
    image: "/img/og-pub-crawl.png",
    imageAlt: "Spunks Pub Crawl, the Spunkmeyers phone game set on High Street",
    label: "Spunks Pub Crawl",
  },
  "/stack": {
    title: "Spunks Stack | Spunkmeyers Pub & Grill",
    description:
      "Play Spunks Stack: falling blocks on your phone from Spunkmeyers Pub & Grill in Wadsworth. Swipe, spin, drop, clear lines and climb the pub leaderboard.",
    image: "/img/og-stack.png",
    imageAlt: "Spunks Stack, the free falling-blocks game from Spunkmeyers",
    label: "Spunks Stack",
  },
  "/privacy": {
    title: "Privacy Policy | Spunkmeyers Pub & Grill",
    description:
      "How Spunkmeyers Pub & Grill uses and protects information shared through our website and forms.",
    image: restaurantImage,
    imageAlt: restaurantAlt,
    label: "Privacy Policy",
  },
  "/terms": {
    title: "Terms of Use | Spunkmeyers Pub & Grill",
    description:
      "Terms for using the Spunkmeyers Pub & Grill website, online forms and arcade games.",
    image: restaurantImage,
    imageAlt: restaurantAlt,
    label: "Terms of Use",
  },
  "/accessibility": {
    title: "Accessibility | Spunkmeyers Pub & Grill",
    description:
      "Website accessibility information and ways to contact Spunkmeyers Pub & Grill in Wadsworth if you need help.",
    image: restaurantImage,
    imageAlt: restaurantAlt,
    label: "Accessibility",
  },
  "/tv": {
    title: "Spunkmeyers TV Board",
    description: "In-bar display board for Spunkmeyers Pub & Grill.",
    image: restaurantImage,
    imageAlt: restaurantAlt,
    label: "TV Board",
    noindex: true,
  },
  "/404": {
    title: "Page Not Found | Spunkmeyers Pub & Grill",
    description:
      "This page could not be found. Visit the Spunkmeyers homepage, menu or contact page.",
    image: restaurantImage,
    imageAlt: restaurantAlt,
    label: "Page Not Found",
    noindex: true,
  },
};

export function getPageMetadata(path: string, christmas = false): PageMetadata {
  const base = PAGE_METADATA[path] ?? PAGE_METADATA["/404"];
  if (path === "/" && christmas)
    return {
      ...base,
      title: "Christmas Pop-Up Bar in Wadsworth | Spunkmeyers Pub & Grill",
      description:
        "Visit Spunkmeyers Pub & Grill in Wadsworth, Ohio, for wall-to-wall Christmas, smash burgers, wings and cold beer. See our menu, hours and directions.",
      image: "/social/spunkmeyers-christmas-2026.jpg",
      imageAlt:
        "Christmas decorations and wings at Spunkmeyers Pub & Grill, Wadsworth's Christmas pop-up bar",
    };
  return base;
}
