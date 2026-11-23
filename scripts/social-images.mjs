/** Real restaurant photography arranged into 1200x630 share cards.
 * This is a code-authored SVG layout; original photographs are unchanged.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
const publicDir = path.resolve("client/public");
const destination = path.join(publicDir, "social");
mkdirSync(destination, { recursive: true });
const imageCache = new Map();
const image = file => imageCache.get(file);
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const cards = [
  {
    file: "spunkmeyers-restaurant",
    photos: ["img/burger-closeup.jpg", "img/patio-colorful.jpg"],
    title: "COLD BEER. HOT FOOD.",
    line: "Your neighborhood pub & grill in Wadsworth, Ohio.",
  },
  {
    file: "spunkmeyers-menu",
    photos: ["img/wings.jpg", "img/burger-closeup.jpg"],
    title: "BURGERS, WINGS & MORE.",
    line: "Explore the menu. Find your new favorite.",
  },
  {
    file: "spunkmeyers-experience",
    photos: ["img/patio-colorful.jpg", "img/bar-interior.jpg"],
    title: "PULL UP A STOOL.",
    line: "The Buck Naked Bar patio. Game days. Good company.",
  },
  {
    file: "spunkmeyers-events",
    photos: ["img/bingo-xmas.jpg"],
    title: "MAKE A NIGHT OF IT.",
    line: "Bingo, live entertainment & game days in Wadsworth.",
  },
  {
    file: "spunkmeyers-visit",
    photos: ["img/storefront.jpg"],
    align: "xMidYMin",
    title: "COME ON OVER.",
    line: "993 High Street · Wadsworth, OH · (330) 334-5080",
  },
  {
    file: "spunkmeyers-careers",
    photos: ["img/staff-three.jpg", "img/bar-interior.jpg"],
    align: "xMidYMin",
    title: "JOIN THE SPUNKS CREW.",
    line: "Restaurant & bar opportunities in Wadsworth, Ohio.",
  },
  {
    file: "spunkmeyers-christmas-2026",
    photos: ["holiday/christmas-at-spunks.webp", "img/wings.jpg"],
    title: "CHRISTMAS AT SPUNKS.",
    line: "Wadsworth’s Christmas pop-up bar · Cold beer. Hot food.",
  },
];
// SVG renderers do not consistently decode embedded WebP. Normalize embedded
// source bytes to JPEG without changing the files used by the actual website.
for (const file of new Set([
  "img/logo.webp",
  ...cards.flatMap(card => card.photos),
])) {
  const jpeg = await sharp(path.join(publicDir, file))
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({ background: "#111510" })
    .jpeg({ quality: 95 })
    .toBuffer();
  imageCache.set(file, `data:image/jpeg;base64,${jpeg.toString("base64")}`);
}
for (const card of cards) {
  const width = 1200 / card.photos.length;
  const photos = card.photos
    .map(
      (file, i) =>
        `<svg x="${i * width}" width="${width}" height="456" viewBox="0 0 ${width} 456"><image href="${image(file)}" width="${width}" height="456" preserveAspectRatio="${card.align ?? "xMidYMid"} slice"/></svg>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#111510"/>
    ${photos}
    <rect y="456" width="1200" height="6" fill="${card.file.includes("christmas") ? "#d3b579" : "#e8601c"}"/>
    <image href="${image("img/logo.webp")}" x="24" y="478" width="268" height="130" preserveAspectRatio="xMidYMid meet"/>
    <path d="M317 489v111" stroke="#ffffff" stroke-opacity=".22"/>
    <text x="351" y="515" fill="#fff8ec" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" letter-spacing=".4">${esc(card.title)}</text>
    <text x="351" y="554" fill="#e7dfd3" font-family="Arial,Helvetica,sans-serif" font-size="22">${esc(card.line)}</text>
    <text x="351" y="598" fill="#eec891" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="700" letter-spacing="1.6">SPUNKMEYERS.PUB</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(destination, `${card.file}.jpg`));
  console.log(`social: ${card.file}.jpg`);
}
