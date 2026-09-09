// Spunkmeyers Pub & Grill - Asset URLs and Business Info
// ALL images are client-provided originals. No AI-generated photos.

// Every asset is self-hosted from client/public/img. The Manus CDN that
// previously served these (d2xsxph8kpxj0f.cloudfront.net) started returning
// 403 on every object in Aug 2026, which broke the site's media sitewide.
export const IMAGES = {
  logo: "/img/logo.webp",
  patioColorful: "/img/patio-colorful.jpg",
  staffThree: "/img/staff-three.jpg",
  tapFatheads: "/img/tap-fatheads.jpg",
  barInterior: "/img/bar-interior.jpg",
  tapBusch: "/img/tap-busch.jpg",
  bartenderBeer: "/img/bartender-beer.jpg",
  bartenderTaps: "/img/bartender-taps.jpg",
  bingoGuys: "/img/bingo-guys.jpg",
  bingoGroup: "/img/bingo-group.jpg",
  bingoXmas: "/img/bingo-xmas.jpg",
  bingoInterior: "/img/bingo-interior.jpg",
  bingoBooth: "/img/bingo-booth.jpg",
  storefront: "/img/storefront.jpg",
  doordashLogo: "/img/doordash-logo.png",
  patioCollage: "/img/patio-collage.jpeg",
  bartenderOutdoor: "/img/bartender-outdoor.webp",
  staffDuo: "/img/staff-duo.webp",
  stPaddys: "/img/st-paddys.webp",
  beerPerspective: "/img/beer-perspective.webp",
  tailgateBus: "/img/tailgate-bus.jpg",
  pourDraft: "/img/pour-draft.jpeg",
  // Food photos
  shrimpGrits: "/img/shrimp-grits.jpg",
  smashBurgersLineup: "/img/smash-burgers-lineup.jpg",
  burgerCloseup: "/img/burger-closeup.jpg",
  drinksSpread: "/img/drinks-spread.jpg",
  greenBeer: "/img/green-beer.jpg",
  pierogies: "/img/pierogies.jpg",
  nachos: "/img/nachos.jpg",
  storefrontDawgs: "/img/storefront-dawgs.jpg",
  cocktail: "/img/cocktail-raspberry.jpg",
  wings: "/img/wings.jpg",
  // Ohio Sports
  guardians: "/guardians-field.jpg",
  cavs: "/img/cavs.webp",
  osu: "/img/osu.webp",
  browns: "/img/browns.webp",
  brownsHelmets: "/img/browns.webp",
  // Cleveland Guardians assets
  guardiansField: "/guardians-field.jpg",
  guardiansPlayer: "/img/guardians-player.webp",
} as const;

export const SPORTS_IMAGES = [
  { src: IMAGES.browns, label: "Cleveland Browns", team: "Browns Backer Bar" },
  { src: IMAGES.guardians, label: "Cleveland Guardians", team: "Guardians" },
  { src: IMAGES.cavs, label: "Cleveland Cavaliers", team: "Cavaliers" },
  { src: IMAGES.osu, label: "Ohio State Buckeyes", team: "OH-IO" },
] as const;

export const FOOD_IMAGES = [
  { src: IMAGES.wings, label: "Sauced Wings" },
  { src: IMAGES.nachos, label: "Loaded Nachos" },
  { src: IMAGES.pierogies, label: "Pierogies & Kielbasa" },
  { src: IMAGES.smashBurgersLineup, label: "Smash Burgers" },
  { src: IMAGES.shrimpGrits, label: "Shrimp & Grits" },
  { src: IMAGES.burgerCloseup, label: "The Spunks Smash" },
] as const;

export const PHOTO_STRIP = [
  { src: IMAGES.patioColorful, label: "Patio Vibes" },
  { src: IMAGES.wings, label: "Wings" },
  { src: IMAGES.bartenderOutdoor, label: "Buck Naked Bar" },
  { src: IMAGES.nachos, label: "Nachos" },
  { src: IMAGES.greenBeer, label: "St. Paddy's" },
  { src: IMAGES.barInterior, label: "Inside" },
  { src: IMAGES.cocktail, label: "Cocktails" },
  { src: IMAGES.storefrontDawgs, label: "Dawgs Gotta Eat" },
  { src: IMAGES.pierogies, label: "Pierogies" },
  { src: IMAGES.staffDuo, label: "The Crew" },
  { src: IMAGES.beerPerspective, label: "Cheers" },
  { src: IMAGES.smashBurgersLineup, label: "Smash Burgers" },
] as const;

export const VIDEO = "/img/hero.mp4";

// SPX American Lager: the pub's own lager. Photo + teaser reel from Spunks (Sep 2026).
export const SPX = {
  photo: "/img/spx-lager.jpg",
  video: "/img/spx-lager.mp4",
  poster: "/img/spx-lager-poster.jpg",
} as const;

export const LINKS = {
  doordash: "https://www.doordash.com/store/spunkmeyers-pub-&-grill-wadsworth-32307611/49163347/?utm_source=mx_share",
  beerList: "https://untappd.com/v/spunkmeyers-pub/173860",
  facebook: "https://www.facebook.com/SpunkmeyersPub/",
  instagram: "https://www.instagram.com/spunkmeyerspubandgrill/",
  googleReview: "https://www.google.com/maps/place/Spunkmeyers+Pub+%26+Grill/@41.0498303,-81.7276839,17z/data=!3m1!4b1!4m6!3m5!1s0x8830cdcea34b6951:0x8011aa27530832b9!8m2!3d41.0498303!4d-81.7276839!16s%2Fg%2F1tmg75x4",
  directions: "https://www.google.com/maps/dir//Spunkmeyers+Pub+%26+Grill,+993+High+St,+Wadsworth,+OH+44281",
} as const;

export const BUSINESS = {
  name: "Spunkmeyers Pub & Grill",
  address: "993 High St, Wadsworth, OH 44281",
  phone: "(330) 334-5080",
  phoneLink: "tel:3303345080",
  hours: [
    { day: "Sunday", hours: "11am - 10pm" },
    { day: "Monday", hours: "4pm - 12am" },
    { day: "Tuesday", hours: "4pm - 12am" },
    { day: "Wednesday", hours: "11am - 12am" },
    { day: "Thursday", hours: "11am - 2am" },
    { day: "Friday", hours: "11am - 2am" },
    { day: "Saturday", hours: "11am - 2am" },
  ],
} as const;

// Helper to get current day name
export function getCurrentDayName(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}
