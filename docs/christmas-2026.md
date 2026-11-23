# Christmas homepage, 2026

The homepage switches to Christmas from November 23, 2026 until January 1,
2027 at midnight America/New_York (05:00 UTC). `client/src/lib/holiday.ts`
controls the campaign. The hook checks on load, focus, and every 30 seconds,
so a tab left open also returns to the original homepage. No scheduled deploy
or removal of original content is required.

The existing hero, original footage, remaining section content, links, forms, arcade,
and backend functions are retained. Christmas styles are scoped to the home
route. The automatic arcade pop-up is removed from the homepage year-round.
The navigation and inline game sections still provide access to both games.

## Media

Assets in `client/public/holiday/` derive from the two owner-supplied videos
and the owner-supplied photograph (November 23). Both videos retain their
complete runtime and original audio. H.264/AAC MP4, fast-start, 540 × 960.
The first film plays muted and pauses when offscreen or the tab is hidden.
Reduced-motion and data-saving visitors receive a poster until they choose
to play. The second film downloads only on request, retains its embedded
creator credit, and is captioned with Expedition CLE attribution.

## Footer profiles

Verified November 23, 2026 for Spunkmeyers at 993 High St, Wadsworth, OH:

- Facebook and Instagram: existing links on the official spunkmeyers.pub site.
- Google Maps: existing business-specific place link on the official site.
- Yelp: https://www.yelp.com/biz/spunkmeyers-pub-and-grill-wadsworth-2
  (claimed profile, matching name, address and phone).
- Tripadvisor: https://www.tripadvisor.com/Attraction_Review-g51089-d5847258-Reviews-Spunkmeyers_Pub-Wadsworth_Ohio.html
  (matching name and 993 High St address).
- Untappd: https://untappd.com/v/spunkmeyers-pub/173860
  (verified venue, matching address and phone).

No official business TikTok profile was verified. The supplied tour is by
Expedition CLE, which is not presented as the business's social account.
No review ratings or tracking embeds were added.

## Cavaliers feature

The Guardians section, hardcoded 2026 baseball schedule, and associated Miller
Lite special have been removed. A year-round Cavs feature uses the supplied
November 23 photograph and links to the official Cavaliers schedule at
https://www.nba.com/cavaliers/schedule (verified November 23). The Cavs change
remains after the Christmas campaign ends. No game-day offers were carried over.

## Validation

TypeScript and production build pass. The campaign start, final second of New
Year's Eve, January 1 midnight Eastern cutoff, and non-recurring behavior were
checked directly. Browser review covered 1440px desktop, 390px mobile, and 320px
narrow mobile; video playback, pause controls, links, badge containment, hero
spacing, and the unthemed menu route were checked. Netlify preview serves both
MP4s and the Cavs image correctly; both existing arcade score APIs return 200.

## Full-homepage snowfall

A single fixed, non-interactive snow layer continues through the homepage and
footer, behind foreground content. CSS transform animations use 44 flakes on
desktop and 28 on mobile; travel distance follows viewport height. The existing
Pause holiday motion button pauses all flakes. Reduced-motion preferences
hide snowfall, and the seasonal cutoff and route unmount remove it normally.
