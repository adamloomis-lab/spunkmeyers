// Pre-generates the "Listen to this page" narration audio in Spunkmeyers'
// ElevenLabs voice. Run after `pnpm run build`:
//
//   NARRATE_ENDPOINT="https://spunkmeyers.pub/api/tts" node scripts/narrate.mjs
//   (or)  ELEVENLABS_API_KEY="..." node scripts/narrate.mjs
//
// This site is a plain Vite SPA (no server bundle), so instead of importing a
// prerender bundle we transpile client/src/data/narration.ts with esbuild and
// import the compiled module. Single source of truth: the same narration the
// React player renders.
//
// Cost control: each section's text is hashed into manifest.json; only new or
// edited sections ever call the API. Output: public/audio/narration/<page>/<section>.mp3

import { build } from "esbuild";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// Vite publicDir is client/public; static assets committed there ship as-is.
const OUT = join(ROOT, "client", "public", "audio", "narration");
const MANIFEST = join(OUT, "manifest.json");

const VOICE_ID = "XAc0FruUymIjvICmNYkM";
const MODEL_ID = "eleven_turbo_v2_5";

const key = process.env.ELEVENLABS_API_KEY;
const endpoint = process.env.NARRATE_ENDPOINT;
if (!key && !endpoint) {
  console.error(
    'Set ELEVENLABS_API_KEY or NARRATE_ENDPOINT. Example:\n  NARRATE_ENDPOINT="https://spunkmeyers.pub/api/tts" node scripts/narrate.mjs',
  );
  process.exit(1);
}

// Transpile the TS narration module (resolves its ../lib/constants import) to a
// temp ESM file, import it, then clean up.
const tmp = join(ROOT, ".narration.compiled.mjs");
await build({
  entryPoints: [join(ROOT, "client", "src", "data", "narration.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: tmp,
  logLevel: "silent",
});
const { narration } = await import(pathToFileURL(tmp).href);
rmSync(tmp, { force: true });

const slugFor = (path) => (path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-"));

// Same abbreviation expansion the live /api/tts applies, so the hash matches
// what actually gets synthesized.
const expandForSpeech = (t) =>
  t
    .replace(/\bBlvd\.?\b/g, "Boulevard")
    .replace(/\bAve\.?\b/g, "Avenue")
    .replace(/\bRd\.?\b/g, "Road")
    .replace(/\bSt\.?\b/g, "Street")
    .replace(/\bOH\b/g, "Ohio")
    .replace(/&/g, " and ")
    .replace(/\(?(\d{3})\)?[ .-]?(\d{3})[-.](\d{4})\b/g, (_, a, b, c) =>
      [a, b, c].map((g) => g.split("").join(" ")).join(", "))
    .replace(/\b(\d{5})\b/g, (_, z) => z.split("").join(" "));
const hash = (text) => createHash("sha1").update(expandForSpeech(text)).digest("hex").slice(0, 12);

let manifest = {};
if (existsSync(MANIFEST)) {
  try {
    manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    manifest = {};
  }
}

let generated = 0;
let skipped = 0;
let chars = 0;

for (const [path, page] of Object.entries(narration)) {
  const slug = slugFor(path);
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });

  for (const section of page.sections) {
    const file = join(dir, `${section.id}.mp3`);
    const id = `${slug}/${section.id}`;
    const h = hash(section.text);
    if (manifest[id] === h && existsSync(file)) {
      skipped += 1;
      continue;
    }

    process.stdout.write(`generating ${id} (${section.text.length} chars)... `);
    const res = endpoint
      ? await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: section.text }),
        })
      : await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": key, "content-type": "application/json" },
          body: JSON.stringify({
            text: expandForSpeech(section.text),
            model_id: MODEL_ID,
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });
    if (!res.ok) {
      console.error(`FAILED (${res.status}): ${await res.text().catch(() => "")}`);
      process.exit(1);
    }
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    manifest[id] = h;
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
    generated += 1;
    chars += section.text.length;
    console.log("done");
  }
}

console.log(
  `\nNarration audio complete: ${generated} generated (${chars.toLocaleString()} chars billed), ${skipped} unchanged.`,
);
