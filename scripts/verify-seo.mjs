import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
const dist = path.resolve("dist/public");
const site = "https://spunkmeyers.pub";
const routes = [
  "",
  "menu",
  "experience",
  "events",
  "contact",
  "careers",
  "games",
  "pub-crawl",
  "stack",
  "privacy",
  "terms",
  "accessibility",
  "tv",
  "404",
];
const decode = str =>
  str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
let menuItems = 0;
for (const route of [...routes, "home-christmas"]) {
  const html = readFileSync(
    path.join(dist, `${route || "index"}.html`),
    "utf8"
  );
  const title = [...html.matchAll(/<title\b[^>]*>(.*?)<\/title>/g)];
  assert.equal(title.length, 1, `${route}: one title`);
  const canonical = [
    ...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g),
  ];
  assert.equal(canonical.length, 1, `${route}: one canonical`);
  const canonicalPath = route === "home-christmas" ? "" : route;
  assert.equal(canonical[0][1], `${site}/${canonicalPath}`);
  assert.equal((html.match(/property="og:title"/g) || []).length, 1);
  assert.equal((html.match(/property="og:image"/g) || []).length, 1);
  if (route !== "tv")
    assert.equal(
      (html.match(/<h1\b/g) || []).length,
      1,
      `${route}: one visible primary heading`
    );
  assert.match(html, /Spunkmeyers/i);
  const image = /property="og:image" content="([^"]+)"/.exec(html)?.[1];
  assert.ok(image?.startsWith(site));
  const imageMeta = await sharp(
    path.join(dist, image.slice(site.length))
  ).metadata();
  assert.equal(imageMeta.width, 1200, `${route}: image width`);
  assert.equal(imageMeta.height, 630, `${route}: image height`);
  assert.match(html, /property="og:image:alt" content="[^"]+"/);
  const schemas = [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g
    ),
  ].map(m => JSON.parse(m[1]));
  if (["tv", "404"].includes(route)) {
    assert.match(html, /name="robots" content="noindex, follow"/);
  } else {
    assert.equal(schemas.length, 1, `${route}: one schema graph`);
    const business = schemas[0]["@graph"].find(
      n => n["@id"] === `${site}/#business`
    );
    assert.ok(business["@type"].includes("Restaurant"));
    assert.equal(business.address.streetAddress, "993 High St");
    assert.equal(business.openingHoursSpecification.length, 7);
    assert.equal(business.aggregateRating, undefined);
    if (route === "menu") {
      const menu = schemas[0]["@graph"].find(n => n["@type"] === "Menu");
      for (const section of menu.hasMenuSection)
        for (const item of section.hasMenuItem) {
          assert.ok(
            decode(html).includes(item.name),
            `Menu item is visible: ${item.name}`
          );
          menuItems++;
        }
    }
    if (route === "contact") {
      const faq = schemas[0]["@graph"].find(
        n => Array.isArray(n["@type"]) && n["@type"].includes("FAQPage")
      );
      assert.equal(faq.mainEntity.length, 8);
      for (const item of faq.mainEntity)
        assert.ok(decode(html).includes(item.name));
      assert.doesNotMatch(html, /Open daily for lunch and dinner/);
    }
  }
}
const regular = readFileSync(path.join(dist, "index.html"), "utf8");
const christmas = readFileSync(path.join(dist, "home-christmas.html"), "utf8");
assert.match(regular, /spunkmeyers-restaurant.jpg/);
assert.doesNotMatch(regular, /class="christmas-hero"/);
assert.match(christmas, /spunkmeyers-christmas-2026.jpg/);
assert.match(christmas, /class="christmas-hero"/);
const sitemap = readFileSync(path.join(dist, "sitemap.xml"), "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, 12);
assert.doesNotMatch(sitemap, /\/tv<|\/404</);
console.log(
  `SEO checks passed: 15 rendered variants, unique metadata, full content, 1200x630 share images, ${menuItems} visible menu items, eight matching visitor answers, seasonal variants, sitemap and noindex rules.`
);
