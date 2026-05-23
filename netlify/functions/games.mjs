/*
 * Live game schedule for "On The Big Screens".
 * Pulls Browns / Guardians / Cavaliers / Buckeyes schedules from ESPN's
 * public site API, normalizes upcoming games, and caches at the CDN edge.
 * No API key required.
 */

const TEAMS = [
  { key: "browns", name: "Browns", league: "NFL", path: "football/nfl/teams/cle" },
  { key: "guardians", name: "Guardians", league: "MLB", path: "baseball/mlb/teams/cle" },
  { key: "cavaliers", name: "Cavaliers", league: "NBA", path: "basketball/nba/teams/cle" },
  { key: "buckeyes", name: "Buckeyes", league: "NCAAF", path: "football/college-football/teams/194" },
];

async function fetchTeam(team) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${team.path}/schedule`;
  const res = await fetch(url, { headers: { "User-Agent": "spunkmeyers-pub-site" } });
  if (!res.ok) return [];
  const data = await res.json();
  const ourId = data?.team?.id;
  const ourAbbr = data?.team?.abbreviation;
  const games = [];

  for (const event of data.events || []) {
    const comp = (event.competitions || [])[0];
    if (!comp) continue;

    const state = comp.status?.type?.state; // "pre" | "in" | "post"
    if (state === "post") continue; // already played

    const ms = Date.parse(event.date);
    if (Number.isNaN(ms) || ms < Date.now() - 5 * 60 * 60 * 1000) continue; // skip well-past

    const competitors = comp.competitors || [];
    const us =
      competitors.find((c) => c.team?.id === ourId || c.team?.abbreviation === ourAbbr) ||
      competitors.find((c) => c.homeAway === "home");
    const them = competitors.find((c) => c !== us) || {};
    const opp = them.team || {};

    games.push({
      key: team.key,
      team: team.name,
      league: team.league,
      date: event.date,
      homeAway: us?.homeAway || "home",
      opponent: opp.shortDisplayName || opp.displayName || opp.name || "TBD",
      opponentLogo: opp.logo || opp.logos?.[0]?.href || "",
      tbd: comp.status?.type?.name === "STATUS_SCHEDULED" && /T00:00/.test(event.date),
    });
  }
  return games;
}

export async function handler() {
  try {
    const results = await Promise.allSettled(TEAMS.map(fetchTeam));
    let all = [];
    for (const r of results) {
      if (r.status === "fulfilled") all = all.concat(r.value);
    }
    all.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    const now = Date.now();
    const weekOut = now + 8 * 24 * 60 * 60 * 1000;
    const thisWeek = all.filter((g) => Date.parse(g.date) <= weekOut).slice(0, 8);

    // Soonest upcoming game per team (so all four teams stay represented year-round).
    const nextByTeam = [];
    for (const t of TEAMS) {
      const next = all.find((g) => g.key === t.key);
      if (next) nextByTeam.push(next);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
      body: JSON.stringify({ generatedAt: new Date().toISOString(), thisWeek, nextByTeam }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({ generatedAt: new Date().toISOString(), thisWeek: [], nextByTeam: [], error: String(err) }),
    };
  }
}
