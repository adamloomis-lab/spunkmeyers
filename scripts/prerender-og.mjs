/*
 * Social-share previews for the arcade pages.
 *
 * Facebook, iMessage, Slack, and friends read the static HTML and never run
 * the React app, so every shared link used to show the site's generic card.
 * After `vite build`, this writes dist/public/<route>/index.html for each
 * route below: a copy of the built index.html with that page's title,
 * description, canonical URL, and Open Graph / Twitter image swapped in.
 * Netlify serves the file at /<route> before the SPA fallback kicks in, and
 * the React app boots from it exactly as it would from index.html.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE = "https://spunkmeyers.pub";
const dist = path.resolve(process.cwd(), "dist/public");

const PAGES = [
  {
    route: "pub-crawl",
    title: "Spunks Pub Crawl | Spunkmeyers Pub & Grill",
    description:
      "Kevin runs down High Street. Tap to jump the band, slide under the geese, grab an SPX, and get your initials on the pub leaderboard. Free phone game from Spunkmeyers in Wadsworth.",
    image: "/img/og-pub-crawl.png",
  },
  {
    route: "stack",
    title: "Spunks Stack | Spunkmeyers Pub & Grill",
    description:
      "Old-school falling blocks on your phone. Drag, spin, drop, clear lines, outlast last call. Free game from Spunkmeyers in Wadsworth, with a pub leaderboard.",
    image: "/img/og-stack.png",
  },
  {
    route: "games",
    title: "Spunks Arcade | Free Phone Games at Spunkmeyers",
    description:
      "Two free games on your phone at Spunkmeyers in Wadsworth: Spunks Pub Crawl and Spunks Stack. No app. Top scores go up on the bar TVs.",
    image: "/img/og-arcade.png",
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender-og: tag not found: ${pattern}`);
  return html.replace(pattern, replacement);
}

const base = readFileSync(path.join(dist, "index.html"), "utf8");

for (const p of PAGES) {
  const url = `${SITE}/${p.route}`;
  const image = `${SITE}${p.image}`;
  let html = base;
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(p.description)}" />`);
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(p.title)}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(p.description)}" />`);
  html = setTag(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${image}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(p.title)}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(p.description)}" />`);
  html = setTag(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${image}" />`);
  const dir = path.join(dist, p.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), html);
  console.log(`prerender-og: wrote /${p.route}/index.html`);
}
