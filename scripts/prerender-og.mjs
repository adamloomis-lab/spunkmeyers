/** Render real page content and metadata for every public route.
 * Social and answer-engine crawlers get the same content as visitors without
 * requiring JavaScript. The client takes over normally after startup.
 */
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { build } from "esbuild";

const dist = path.resolve("dist/public");
const bundle = path.resolve("dist/render-pages.cjs");
await build({
  entryPoints: ["scripts/render-pages.tsx"],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  jsx: "automatic",
  loader: { ".css": "empty" },
  alias: { "@": path.resolve("client/src"), "@shared": path.resolve("shared") },
  define: { "import.meta.env.DEV": "false" },
  logLevel: "warning",
});
const { renderPage, PAGE_METADATA } = createRequire(import.meta.url)(bundle);
const base = readFileSync(path.join(dist, "index.html"), "utf8");
if (
  !base.includes("<!-- prerender:head -->") ||
  !base.includes('<div id="root"></div>')
)
  throw new Error("Missing HTML prerender placeholders");

function writePage(route, file, christmas = false) {
  const tags = [];
  let body = renderPage(route, christmas);
  // React 19 hoists metadata to the start of a fragment render. Move it into
  // the template head, marking it for removal when React takes ownership.
  body = body.replace(
    /<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*\/?\s*>|<link\b[^>]*\/?\s*>|<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,
    tag => {
      // Don't preload the entire below-the-fold image gallery.
      if (!tag.includes('rel="preload"'))
        tags.push(
          tag.replace(/^<(title|meta|link|script)/, '<$1 data-prerender="true"')
        );
      return "";
    }
  );
  const html = base
    .replace('<html lang="en">', '<html lang="en" class="dark">')
    .replace("<!-- prerender:head -->", tags.join("\n"))
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-static="true">${body}</div>`
    );
  writeFileSync(path.join(dist, file), html);
  console.log(`prerender: ${route} -> ${file}`);
}
for (const route of Object.keys(PAGE_METADATA))
  writePage(route, route === "/" ? "index.html" : `${route.slice(1)}.html`);
writePage("/", "home-christmas.html", true);
rmSync(bundle);

// This date records the actual content/metadata revision, not every build time.
const lastmod = "2026-11-23";
const urls = Object.entries(PAGE_METADATA)
  .filter(([, data]) => !data.noindex)
  .map(
    ([route]) =>
      `  <url><loc>https://spunkmeyers.pub${route}</loc><lastmod>${lastmod}</lastmod></url>`
  );
writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);
