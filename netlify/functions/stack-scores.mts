// Spunks Stack leaderboard, stored in Netlify Blobs.
//   GET  /api/stack-scores            -> { all, today, day }
//   POST /api/stack-scores {name, score, time} -> { ok, rankAll, rankToday, all, today, day }
//
// Two boards: all-time (top 100 kept, top 10 shown) and tonight (keyed by
// the pub's local date, top 50 kept, top 10 shown). Scores are only
// initials + number, no personal data.

import { getStore } from "@netlify/blobs";

const KEEP_ALL = 100;
const KEEP_DAY = 50;
const SHOW = 10;
const MAX_SCORE = 2_000_000;
const MIN_TIME = 5; // seconds; you cannot score 100 faster than this
const MAX_TIME = 3600;
// A four-line clear at level 20 is 1200 x 21 = 25,200 points every few
// seconds. Anything past this rate is a fake.
const MAX_RATE = 9000;
const RATE_LIMIT_MS = 10_000;

const BLOCKED = new Set([
  "ASS", "FUK", "FUC", "FCK", "FUQ", "FKU", "SHT", "CUM", "DIK", "DIC", "COK", "KKK",
  "NIG", "NGR", "FAG", "TIT", "SEX", "JIZ", "VAG", "KYS", "WTF", "HOE", "XXX", "GAY",
]);

interface Entry {
  name: string;
  score: number;
  time: number;
  date: string;
  id: string;
}

type PublicEntry = Pick<Entry, "name" | "score" | "date">;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Today's date at the pub (America/New_York), as YYYY-MM-DD. */
function pubDay(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function cleanName(n: unknown): string {
  return String(n ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
}

function validate(body: { name?: unknown; score?: unknown; time?: unknown }):
  | { error: string }
  | { entry: Omit<Entry, "date" | "id"> } {
  const name = cleanName(body.name);
  if (!name) return { error: "Enter 1 to 3 letters." };
  if (BLOCKED.has(name)) return { error: "Pick different initials." };
  const score = Number(body.score);
  const time = Number(body.time);
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) return { error: "That score does not look right." };
  if (!Number.isFinite(time) || time < MIN_TIME || time > MAX_TIME) return { error: "That run does not look right." };
  if (score > time * MAX_RATE + 400) return { error: "That score does not look right." };
  return { entry: { name, score, time: Math.round(time * 10) / 10 } };
}

function insert(list: unknown, entry: Omit<Entry, "date" | "id">, keep: number, day: string): { list: Entry[]; rank: number } {
  const e: Entry = {
    ...entry,
    date: day,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  };
  const next = [...(Array.isArray(list) ? (list as Entry[]) : []), e]
    .sort((a, b) => b.score - a.score || a.time - b.time)
    .slice(0, keep);
  return { list: next, rank: next.findIndex((x) => x.id === e.id) + 1 };
}

function publicList(list: unknown): PublicEntry[] {
  return (Array.isArray(list) ? (list as Entry[]) : []).slice(0, SHOW).map(({ name, score, date }) => ({ name, score, date }));
}

async function hash(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (req: Request, context: { ip?: string }): Promise<Response> => {
  const store = getStore({ name: "spunks-stack", consistency: "strong" });
  const day = pubDay();
  const dayKey = `day-${day}`;

  if (req.method === "GET") {
    const [all, today] = await Promise.all([store.get("all", { type: "json" }), store.get(dayKey, { type: "json" })]);
    return json({ all: publicList(all), today: publicList(today), day });
  }

  if (req.method === "POST") {
    let body: { name?: unknown; score?: unknown; time?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Bad request." }, 400);
    }
    const v = validate(body);
    if ("error" in v) return json({ error: v.error }, 400);

    // One save every few seconds per phone.
    const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "anon";
    const rateKey = `rate-${await hash(ip)}`;
    const last = Number(await store.get(rateKey)) || 0;
    if (Date.now() - last < RATE_LIMIT_MS) return json({ error: "Slow down! Try again in a few seconds." }, 429);
    await store.set(rateKey, String(Date.now()));

    const [allRaw, todayRaw] = await Promise.all([store.get("all", { type: "json" }), store.get(dayKey, { type: "json" })]);
    const all = insert(allRaw, v.entry, KEEP_ALL, day);
    const today = insert(todayRaw, v.entry, KEEP_DAY, day);
    await Promise.all([store.setJSON("all", all.list), store.setJSON(dayKey, today.list)]);

    return json({
      ok: true,
      rankAll: all.rank,
      rankToday: today.rank,
      all: publicList(all.list),
      today: publicList(today.list),
      day,
    });
  }

  return json({ error: "Method not allowed." }, 405);
};
