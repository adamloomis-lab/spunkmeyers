/**
 * Spunks Pub Crawl sprite sheet. Hand-drawn pixel art as palette strings; see
 * pixelart.ts for the palette. Everything faces the direction it moves:
 * Kevin runs right, obstacles come from the right facing left.
 */
import { flipSprite, makeSprite, type Sprite } from "./pixelart";

/* ---------------- Kevin ---------------- */

// Hat, head, and torso shared by every standing frame; legs differ.
// Cowboy hat with an orange band, beard, orange Spunks shirt, jeans, boots.
const KEVIN_BODY = [
  "......DDDDD.......",
  "......DDDDD.......",
  "......XXXXX.......",
  "..DDDDDDDDDDDD....",
  "....TTTTTTTT......",
  "....TTTTTKTT......",
  "....TTTTTTTTt.....",
  "....BTTTTTTT......",
  "....BBTTTTBB......",
  ".....TTTTT........",
  "....XXXXXXXX......",
  "...XXXXXXXXXXX....",
  "...XXXXWWXXXXX....",
  "..TXXXXWWXXXXXT...",
  "..T.XXXXXXXXX.T...",
  "....XXXXXXXXX.....",
  "....uuuuuuuuu.....",
  "....uuuuOuuuu.....",
];

const LEGS_RUN_A = [
  "....uuuuuuuuu.....",
  "...uuuu..uuuuu....",
  "..uuuu....uuuu....",
  ".uuuu......uuuu...",
  ".uuu........uuuu..",
  "uuu..........uuu..",
  "DD............DDD.",
  "DDD...........DDDD",
];

const LEGS_RUN_B = [
  "....uuuuuuuuu.....",
  ".....uuuuuuuu.....",
  ".....uuuu.uuu.....",
  ".....uuu..uuu.....",
  ".....uuu...uuu....",
  ".....uuu...uuu....",
  ".....DDD...DDD....",
  ".....DDDD..DDDD...",
];

const LEGS_JUMP = [
  "....uuuuuuuuu.....",
  "....uuuuuuuuuu....",
  "...uuuu...uuuuu...",
  "...uuu.....uuu....",
  "..DDDD.....DDDD...",
  "..DDD.......DDD...",
  "..................",
  "..................",
];

// Baseball slide: hat on, feet first, low enough to get under a goose.
const KEVIN_DUCK = [
  "..........DDDDD...........",
  "..........DDDDD...........",
  "..........XXXXX...........",
  "......DDDDDDDDDDDDD.......",
  "........TTTTTTTT..........",
  "........TTTTTKTT..........",
  "........BTTTTTTTt.........",
  "........BBTTTTBB..........",
  "...TXXXXXXXXXXuuuuuuuuu...",
  "..TXXXXXXXXXXXuuuuuuuuuDD.",
  "..XXXXXXXXXXXXuuuuuuuuuDDD",
  "...XXXXXXXXXXuuuuuuu...DDD",
  "....uuuuuuuu..............",
  "....DDD...................",
];

function withEye(rows: string[], from: string, to: string): string[] {
  return rows.map((r) => r.replace(from, to));
}

export interface HeroSprites {
  runA: Sprite;
  runB: Sprite;
  jump: Sprite;
  duck: Sprite;
  dead: Sprite;
  idle: Sprite;
}

export function buildKevin(): HeroSprites {
  const runA = makeSprite([...KEVIN_BODY, ...LEGS_RUN_A]);
  const runB = makeSprite([...KEVIN_BODY, ...LEGS_RUN_B]);
  const jump = makeSprite([...KEVIN_BODY, ...LEGS_JUMP]);
  const idle = makeSprite([...KEVIN_BODY, ...LEGS_RUN_B]);
  // Wrecked: eyes go crossed.
  const dead = makeSprite([...withEye(KEVIN_BODY, "TTTTTKTT", "TTTKTKTT"), ...LEGS_RUN_B]);
  const duck = makeSprite(KEVIN_DUCK);
  return { runA, runB, jump, duck, dead, idle };
}

/* ---------------- Obstacles ---------------- */

// Smash burger: sesame bun, cheese, double patty, tomato, lettuce.
const BURGER = [
  "....nnnnnnnn....",
  "..nnWnnnnnWnnn..",
  ".nnnnnnWnnnnnnn.",
  "nnnnnnnnnnnnnnnn",
  "nnnnnnnnnnnnnnnn",
  "qqqqqqqqqqqqqqqq",
  ".qq.qq.qq.qq.qq.",
  "mmmmmmmmmmmmmmmm",
  "mmmmmmmmmmmmmmmm",
  "RRRRRRRRRRRRRRRR",
  "l.ll.lll.ll.lll.",
  ".nnnnnnnnnnnnnn.",
  ".nnnnnnnnnnnnnn.",
  "..nnnnnnnnnnnn..",
];

// A basket of sauced wings on checkered paper.
const WINGS = [
  "......XX....XX......",
  ".....XXXx..XXXx.XX..",
  "....XXXXx.XXXXxXXXx.",
  "...XXXXXXxXXXXXXXXx.",
  "..xXXXXXXXXXXXXXXXx.",
  "RWRWRWRWRWRWRWRWRWRW",
  "WRWRWRWRWRWRWRWRWRWR",
  "RWRWRWRWRWRWRWRWRWRW",
  ".WRWRWRWRWRWRWRWRWR.",
  ".RWRWRWRWRWRWRWRWRW.",
  "..WRWRWRWRWRWRWRWR..",
  "..RRRRRRRRRRRRRRRR..",
];

// A full mug of lager, foam over the rim.
const BEER = [
  "WWWWWWWWW...",
  "WWWWWWWWWW..",
  "GhhhhhhhG...",
  "GhhhhhhhGGG.",
  "GhhWhhhhG.G.",
  "GhhWhhhhG.G.",
  "GhhWhhhhG.G.",
  "GhhWhhhhGGG.",
  "GhhhhhhhG...",
  "GhhihhhhG...",
  "GhhiihhhG...",
  "GhiiiihhG...",
  "GGGGGGGGG...",
];

// An SPX keg with a tap coupler on top.
const KEG = [
  "......gg........",
  "......gg........",
  "..GGGGGGGGGGGG..",
  ".GGGGGGGGGGGGGG.",
  ".gGGGGGGGGGGGGg.",
  ".GGGGGGGGGGGGGG.",
  ".KKKKKKKKKKKKKK.",
  ".KKXXKXXKKXKXKK.",
  ".KXKKKXKXKXKXKK.",
  ".KKXKKXXKKKXKKK.",
  ".KKKXKXKKKXKXKK.",
  ".KXXKKXKKKXKXKK.",
  ".KKKKKKKKKKKKKK.",
  ".GGGGGGGGGGGGGG.",
  ".GGGGGGGGGGGGGG.",
  ".gGGGGGGGGGGGGg.",
  ".GGGGGGGGGGGGGG.",
  ".GGGGGGGGGGGGGG.",
  ".gGGGGGGGGGGGGg.",
  "..GGGGGGGGGGGG..",
  "..gggggggggggg..",
];

// Bar stool. Comes in rows of one to three.
const STOOL = [
  ".DDDDDDDD.",
  "DDDDDDDDDD",
  "DRRRRRRRRD",
  ".MMMMMMMM.",
  "..MM..MM..",
  "..MM..MM..",
  "..MM..MM..",
  "..MMMMMM..",
  "..MM..MM..",
  "..MM..MM..",
  "..MM..MM..",
  "..MM..MM..",
  ".MMM..MMM.",
];

const PUMPKIN = [
  ".....EE.....",
  "....eE......",
  "..PPPpPPPP..",
  ".PPpPPPpPPP.",
  "PPpPPPPpPPPP",
  "PPpPPPPpPPPP",
  "PPpPPPPpPPPP",
  ".PPpPPPpPPP.",
  "..PppPPppP..",
  "...pppppp...",
];

/* ---------------- The band (face left, toward Kevin) ---------------- */

// Arene, lead vocals: cowboy hat, long hair, mic on a stand.
const SINGER = [
  "....DDDDD...",
  "....DDDDD...",
  "....XXXXX...",
  ".DDDDDDDDDD.",
  "..KKTTTTTKK.",
  "..KKTKTTTKK.",
  "..KtTTTTTKK.",
  "..KKTTTTTKK.",
  "..KK.TTTT.K.",
  "..K..TTTT.K.",
  "K..MMMMMM...",
  "KK.MMMMMMMM.",
  "K.TMMMMMMMMT",
  "K..MMMMMMMM.",
  "K..MMMMMMMM.",
  "K..uuuuuuuu.",
  "K..uuuuuuuu.",
  "K..uuu..uuu.",
  "K..uuu..uuu.",
  "K..uuu..uuu.",
  "K..uuu..uuu.",
  "KKKDDD..DDD.",
];

// Chris, guitar: red shirt, guitar slung low.
const GUITAR = [
  ".....KKKK.....",
  "....KKKKKK....",
  "....TTTTTT....",
  "....TKTTTT....",
  "...tTTTTTT....",
  "....TTTTTT....",
  ".....TTTT.....",
  "...RRRRRRRR...",
  "..RRRRRRRRRR..",
  "..RRRRRRRRRRT.",
  "..RRRRRRRRRRT.",
  "KBBBBBBDDDDDR.",
  "..T...DDDDDDD.",
  "......DDODDDD.",
  ".......DDDDD..",
  "....uuuuuuuu..",
  "....uuuuuuuu..",
  "....uuu..uuu..",
  "....uuu..uuu..",
  "....uuu..uuu..",
  "....uuu..uuu..",
  "...DDDD..DDDD.",
];

// Bass player: ball cap, blue shirt, long-neck bass.
const BASS = [
  "....BBBBBB....",
  "..BBBBBBBB....",
  "....TTTTTT....",
  "....TKTTTT....",
  "...tTTTTTT....",
  "....TTTTTT....",
  ".....TTTT.....",
  "...UUUUUUUU...",
  "..UUUUUUUUUU..",
  "..UUUUUUUUUUT.",
  "..UUUUUUUUUUT.",
  "KDDDDDDDMMMMU.",
  "..T....MMMMMM.",
  ".......MMMMMM.",
  "........MMMM..",
  "....uuuuuuuu..",
  "....uuuuuuuu..",
  "....uuu..uuu..",
  "....uuu..uuu..",
  "....uuu..uuu..",
  "....uuu..uuu..",
  "...DDDD..DDDD.",
];

// Kevin's drum kit, nobody behind it (Kevin is busy running): cymbals,
// snare, floor tom, and the kick with the orange X.
const DRUMS = [
  "GGGGGGG..........GGGGGGG",
  "...g.....KWWWWWWK....g..",
  "...g....KWWWWWWWWK...g..",
  "...g....KWWXWWXWWK...g..",
  "...g....KWWWXXWWWK...g..",
  "..ggg...KWWWXXWWWK..ggg.",
  "........KWWXWWXWWK......",
  "........KWWWWWWWWK......",
  ".........KWWWWWWK.......",
  "..........KKKKKK........",
  "...MM....MMMMMM....MM...",
];

// Bob, keys: behind a keyboard on a stand.
const KEYS = [
  "..........KKKK........",
  ".........KKKKKK.......",
  ".........TTTTTT.......",
  ".........TKTTTT.......",
  "........tTTTTTT.......",
  ".........TTTTTT.......",
  "..........TTTT........",
  "........XXXXXXXX......",
  ".......XXXXXXXXXX.....",
  "......TXXXXXXXXXXT....",
  "......T.XXXXXXXX.T....",
  ".MMMMMMMMMMMMMMMMMMMM.",
  ".MWKWKWWKWKWKWWKWKWKM.",
  ".MWWWWWWWWWWWWWWWWWWM.",
  ".MMMMMMMMMMMMMMMMMMMM.",
  "...gg....uuuuuu...gg..",
  "...gg....uuuuuu...gg..",
  "..g..g...uuu.uuu.g..g.",
  "..g..g...uuu.uuu.g..g.",
  ".g....g..uuu.uuu.g...g",
  ".g....g..DDD.DDD......",
];

/* ---------------- The Spunks crew (face left, toward Kevin) ---------------- */

// DJ Brian: headphones on, behind a table with two turntables.
const BRIAN = [
  ".........KKKKKK.........",
  "........KKKKKKKK........",
  "........KKKKKKKK........",
  ".......gKTTTTTTKg.......",
  ".......g.TKTTTT.g.......",
  ".......g.TTTTTT.g.......",
  ".........TTTTTT.........",
  "..........TTTT..........",
  ".......XXXXXXXXXX.......",
  "......XXXXXXXXXXXX......",
  ".....TXXXXWWWWXXXXT.....",
  ".....T.XXXXWWXXXX.T.....",
  ".MMMMMMMMMMMMMMMMMMMMMM.",
  ".MggKKKgg.MMMM.ggKKKggM.",
  ".MgKKKKKg.MMMM.gKKKKKgM.",
  ".MggKKKgg.MXXM.ggKKKggM.",
  ".MMMMMMMMMMMMMMMMMMMMMM.",
  "..gg...............gg...",
  "..gg...............gg...",
  "..gg...............gg...",
  "..gg...............gg...",
  ".gggg.............gggg..",
];

// Peyton, the bartender: Spunks shirt, towel on the shoulder, tray of beers.
const PEYTON = [
  "....KKKKK...",
  "...KKKKKKK..",
  "...KTTTTTK..",
  "...KTKTTTK..",
  "..tTTTTTTK..",
  "...TTTTTTK..",
  "....TTTT....",
  "...XXXXXXWW.",
  "..XXXXXXXXW.",
  "..XXXXXXXXX.",
  "hhh.XXXXXXXT",
  "WWWWTXXXXXXT",
  "....XXXXXX..",
  "....XXXXXX..",
  "....MMMMMM..",
  "....MMMMMM..",
  "....MMMMMM..",
  "....MM..MM..",
  "....MM..MM..",
  "....MM..MM..",
  "....MM..MM..",
  "....MM..MM..",
  "...KKK..KKK.",
];

// Mick, the regular: parked on his stool, beer in hand, not moving.
const MICK = [
  ".....GGGG.....",
  "....GGGGGG....",
  "....TTTTTT....",
  "....TKTTTT....",
  "...tTTTTTT....",
  "....BBBBBB....",
  ".....BBBB.....",
  "...UUUUUUUU...",
  "..UUUUUUUUUU..",
  "..UUUUUUUUUUT.",
  "..TUUUUUUUUWW.",
  "..T.UUUUUUUhh.",
  "....UUUUUUUhh.",
  "....uuuuuuuu..",
  "..uuuuuuuuuu..",
  "..uu..........",
  "..uu.RRRRRR...",
  "..uu.MMMMMM...",
  ".KK..M....M...",
  ".....M....M...",
  ".....M....M...",
  ".....M....M...",
  "....MM....MM..",
];

// Luke, the other regular: ball cap, flannel, pitcher under one arm.
const LUKE = [
  ".....BBBBBB...",
  "...BBBBBBBB...",
  ".....TTTTTT...",
  ".....TKTTTT...",
  "....tTTTTTT...",
  ".....TTTTTT...",
  "......TTTT....",
  "....RKRRKRRK..",
  "...RRKRRKRRKR.",
  "...KKKKKKKKKKT",
  "...RRKRRKRRKWW",
  "...TRKRRKRRGhh",
  "...T.KKKKKKGhh",
  ".....RRKRRKGhh",
  ".....uuuuuuGGG",
  ".....uuuuuuu..",
  ".....uuu..uuu.",
  ".....uuu..uuu.",
  ".....uuu..uuu.",
  ".....uuu..uuu.",
  ".....uuu..uuu.",
  "....DDDD..DDDD",
];

/* ---------------- Goose (flies left) ---------------- */

const GOOSE_A = [
  "..........BB........",
  ".........BBB........",
  "........BBBB........",
  ".......BBBB.........",
  "......BBBB....KKK...",
  ".....DBBBBBBBKWWKK..",
  "..DDBBBBBBBBKKK..K..",
  "..DBBBBBBBBBBK......",
  "...DWWWWBBBB........",
  "....WWWWW...........",
  "....................",
  "....................",
  "....................",
  "....................",
  "....................",
];

const GOOSE_B = [
  "....................",
  "....................",
  "....................",
  "....................",
  "..............KKK...",
  ".....DBBBBBBBKWWKK..",
  "..DDBBBBBBBBKKK..K..",
  "..DBBBBBBBBBBK......",
  "...DWWWWBBBB........",
  "....WWWWW...........",
  ".......BBBB.........",
  "........BBBB........",
  ".........BBB........",
  "..........BB........",
  "....................",
];

/* ---------------- Football (spirals in, dives, climbs away) ---------------- */

const FOOTBALL_A = [
  "....BBBBBB....",
  "..BBBBBBBBBB..",
  ".BBBWWWWWWBBB.",
  "WBBBBWBWBWBBBW",
  "WBBBBBBBBBBBBW",
  ".BBBBBBBBBBBB.",
  "..BBBBBBBBBB..",
  "....BBBBBB....",
];

const FOOTBALL_B = [
  "....BBBBBB....",
  "..BBBBBBBBBB..",
  ".BBBBBBBBBBBB.",
  "WBBBBBBBBBBBBW",
  "WBBBBWBWBWBBBW",
  ".BBBWWWWWWBBB.",
  "..BBBBBBBBBB..",
  "....BBBBBB....",
];

export interface ObstacleSprites {
  stool: Sprite;
  burger: Sprite;
  wings: Sprite;
  beer: Sprite;
  keg: Sprite;
  pumpkin: Sprite;
  singer: Sprite;
  guitar: Sprite;
  bass: Sprite;
  drums: Sprite;
  keys: Sprite;
  brian: Sprite;
  peyton: Sprite;
  mick: Sprite;
  luke: Sprite;
  gooseA: Sprite;
  gooseB: Sprite;
  footballA: Sprite;
  footballB: Sprite;
}

export function buildObstacles(): ObstacleSprites {
  return {
    stool: makeSprite(STOOL),
    burger: makeSprite(BURGER),
    wings: makeSprite(WINGS),
    beer: makeSprite(BEER),
    keg: makeSprite(KEG),
    pumpkin: makeSprite(PUMPKIN),
    singer: makeSprite(SINGER),
    guitar: makeSprite(GUITAR),
    bass: makeSprite(BASS),
    drums: makeSprite(DRUMS),
    keys: makeSprite(KEYS),
    brian: makeSprite(BRIAN),
    peyton: makeSprite(PEYTON),
    mick: makeSprite(MICK),
    luke: makeSprite(LUKE),
    // The goose art is drawn facing right; it flies toward Kevin, so flip it.
    gooseA: flipSprite(makeSprite(GOOSE_A)),
    gooseB: flipSprite(makeSprite(GOOSE_B)),
    footballA: makeSprite(FOOTBALL_A),
    footballB: makeSprite(FOOTBALL_B),
  };
}

/* ---------------- Scenery ---------------- */

const CLOUD = [
  "......WWWW........",
  "....WWWWWWWW..WW..",
  "..WWWWWWWWWWWWWWW.",
  ".WWWWWWWWWWWWWWWWW",
  "WWWWWWWWWWWWWWWWWW",
  ".WWWWWWWWWWWWWWWW.",
];

const TREE = [
  ".....EE.....",
  "....EEEE....",
  "...EEeEEE...",
  "..EEEEEEEE..",
  ".EEeEEEEeEE.",
  "EEEEEEEEEEEE",
  ".EEEEeEEEEE.",
  "..EEEEEEEE..",
  "....dddd....",
  "....dddd....",
  "....dddd....",
];

const BUSH = [
  "...EEEE...",
  ".EEEeEEEE.",
  "EEEEEEEEeE",
  ".EEeEEEEE.",
];

export interface ScenerySprites {
  cloud: Sprite;
  tree: Sprite;
  bush: Sprite;
}

export function buildScenery(): ScenerySprites {
  return {
    cloud: makeSprite(CLOUD),
    tree: makeSprite(TREE),
    bush: makeSprite(BUSH),
  };
}
