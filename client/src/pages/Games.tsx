import { Link } from "wouter";
import SEO, { breadcrumbSchema } from "@/components/SEO";
import PixelArt from "@/components/PixelArt";
import StackArt from "@/components/StackArt";
import ScoreBoard from "@/components/PubCrawlBoard";

/**
 * /games — the Spunks Arcade: every phone game the pub has, with the live
 * leaderboards. Scan a sign at the bar or come here from the menu.
 */
export default function Games() {
  return (
    <div className="pt-24 sm:pt-32 pb-16 bg-[#111111] min-h-screen">
      <SEO
        title="Spunks Arcade | Free Phone Games at Spunkmeyers Pub & Grill"
        description="Play Spunks Pub Crawl and Spunks Stack on your phone at Spunkmeyers in Wadsworth. Free, no app, bragging rights only. Get your initials on the pub leaderboards."
        path="/games"
        ogImage="https://spunkmeyers.pub/img/og-arcade.png"
        jsonLd={breadcrumbSchema([
          { name: "Home", url: "https://spunkmeyers.pub/" },
          { name: "Spunks Arcade", url: "https://spunkmeyers.pub/games" },
        ])}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-[#E8601C] mb-3">Free · No app · Bragging rights only</div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.0] tracking-tight">
            Spunks <span className="text-[#E8601C]">Arcade</span>
          </h1>
          <p className="mt-5 text-lg text-[#F5F0EB]/80 leading-relaxed">
            Two games, one leaderboard wall. Play them right here on your phone, then look for your initials on the TVs at the bar.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pub Crawl */}
          <section className="bg-black border border-white/10 rounded-2xl overflow-hidden">
            <Link href="/pub-crawl" className="block bg-[#F5F0EB] px-6 pt-8 pb-5" aria-label="Play Spunks Pub Crawl">
              <div className="flex items-end justify-center gap-4">
                <PixelArt name="jump" scale={5} className="block" />
                <PixelArt name="burger" scale={4} className="block" />
                <PixelArt name="singer" scale={4} className="block" />
              </div>
            </Link>
            <div className="p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Spunks <span className="text-[#E8601C]">Pub Crawl</span>
              </h2>
              <p className="mt-3 text-[#F5F0EB]/80 leading-relaxed">
                Kevin's on the run down High Street. Tap right to jump, hold left to slide. Hop the band and the crew, dodge the burgers and wings, grab an SPX, catch the football.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/pub-crawl" className="btn-premium">
                  Play Pub Crawl
                </Link>
                <a href="/pub-crawl-sign.html" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-heading text-sm font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
                  Print the QR sign
                </a>
              </div>
              <ScoreBoard className="mt-6" endpoint="/api/pub-crawl-scores" href="/pub-crawl" minScore={50} />
            </div>
          </section>

          {/* Stack */}
          <section className="bg-black border border-white/10 rounded-2xl overflow-hidden">
            <Link href="/stack" className="block bg-[#111] border-b border-white/10 px-6 pt-8 pb-5" aria-label="Play Spunks Stack">
              <div className="flex items-end justify-center">
                <StackArt scale={5} className="block" />
              </div>
            </Link>
            <div className="p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Spunks <span className="text-[#E8601C]">Stack</span>
              </h2>
              <p className="mt-3 text-[#F5F0EB]/80 leading-relaxed">
                Old-school falling blocks. Swipe to move, tap to spin, flick down to drop. Clear lines, climb levels, and try to outlast last call.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/stack" className="btn-premium">
                  Play Stack
                </Link>
                <a href="/stack-sign.html" className="inline-flex items-center justify-center px-6 py-3 rounded-md font-heading text-sm font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors">
                  Print the QR sign
                </a>
              </div>
              <ScoreBoard className="mt-6" endpoint="/api/stack-scores" href="/stack" minScore={100} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
