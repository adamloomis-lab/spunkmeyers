import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  MapPin,
  Pause,
  Play,
  Snowflake,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { BUSINESS, LINKS } from "@/lib/constants";
import { ChristmasGarland, ChristmasOrnaments } from "./ChristmasDecor";

export default function ChristmasHero({
  paused,
  setPaused,
}: {
  paused: boolean;
  setPaused: (value: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (!paused && !connection?.saveData) setLoadVideo(true);
  }, [paused]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => {
      if (paused || !inView || document.hidden) video.pause();
      else if (loadVideo) video.play().catch(() => {});
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [paused, inView, loadVideo]);

  function togglePlayback() {
    setLoadVideo(true);
    if (playing) setPaused(true);
    else {
      setPaused(false);
      videoRef.current?.play().catch(() => {});
    }
  }

  return (
    <section
      className="christmas-hero"
      aria-labelledby="christmas-heading"
      data-narrate="home-hero"
    >
      <ChristmasGarland />
      <ChristmasOrnaments />
      <div className="christmas-hero-inner">
        <div className="christmas-copy">
          <p className="christmas-eyebrow">
            <Snowflake size={17} aria-hidden="true" /> Wadsworth’s Christmas
            pop-up bar
          </p>
          <span className="christmas-script">Christmas at Spunks</span>
          <h1 id="christmas-heading">
            MERRY
            <br />
            <span>EVERYTHING.</span>
          </h1>
          <p className="christmas-intro">
            We went a little overboard.
            <br />
            Okay. A <em>lot</em> overboard.
          </p>
          <p className="christmas-description">
            Wall-to-wall Christmas. Lights on lights. Holiday cheer in every
            corner. Come get lost in it.
          </p>
          <div className="christmas-actions">
            <Link href="/menu" className="btn-premium">
              View Menu
            </Link>
            <a href="#christmas-tour" className="btn-ghost">
              <Play size={16} aria-hidden="true" /> Take a Look Inside
            </a>
          </div>
        </div>
        <div className="christmas-hero-media">
          <div className="christmas-photo-peek">
            <img
              src="/holiday/christmas-at-spunks.webp"
              alt="Santa, oversized Christmas lights, gift-wrapped walls and a garland arch inside Spunkmeyers"
              width="1200"
              height="1600"
            />
          </div>
          <figure className="christmas-film">
            <div className="christmas-film-label">
              <Sparkles size={14} aria-hidden="true" /> A whole lot of Christmas
            </div>
            <video
              ref={videoRef}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              src={loadVideo ? "/holiday/holiday-2026.mp4" : undefined}
              poster="/holiday/holiday-2026-poster.jpg"
              width="540"
              height="960"
              aria-label="Christmas at Spunkmeyers: a close-up tour of the lights, ornaments, decorated rooms and holiday characters"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            ></video>
            <div className="christmas-film-controls">
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={
                  playing ? "Pause Christmas video" : "Play Christmas video"
                }
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
                <span>{playing ? "Pause" : "Play"}</span>
              </button>
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                aria-label={
                  muted
                    ? "Turn Christmas video sound on"
                    : "Mute Christmas video"
                }
                aria-pressed={!muted}
              >
                {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                <span>{muted ? "Sound on" : "Mute"}</span>
              </button>
            </div>
            <figcaption>Actual Spunks. Actual Christmas overload.</figcaption>
          </figure>
          <div className="christmas-seal" aria-hidden="true">
            <Snowflake />
            <span>
              ALL DECKED
              <br />
              OUT.
            </span>
            <small>SPUNKS · 2026</small>
          </div>
          <span className="christmas-handnote" aria-hidden="true">
            Yes, this is our bar.
          </span>
        </div>
        <div className="christmas-basics">
          <div className="christmas-original-copy">
            <strong>Wadsworth’s Favorite Pub.</strong>
            <span>Cold Beer. Hot Food. The Best Patio in Town.</span>
            <a href={LINKS.doordash} target="_blank" rel="noopener noreferrer">
              Order Online
            </a>
          </div>
          <a
            href={LINKS.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="christmas-address"
          >
            <MapPin size={16} aria-hidden="true" /> {BUSINESS.address}
          </a>
        </div>
      </div>
      <div
        className="christmas-ribbon"
        aria-label="Eat, drink and be merry at Spunkmeyers"
      >
        <span>Eat, drink &amp; be merry</span>
        <Snowflake aria-hidden="true" />
        <span>Christmas has entered the chat</span>
        <Snowflake aria-hidden="true" />
        <span>Only at Spunks</span>
      </div>
    </section>
  );
}

export function ChristmasTour() {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (loaded) videoRef.current?.play().catch(() => {});
  }, [loaded]);
  return (
    <section
      id="christmas-tour"
      className="christmas-tour"
      aria-labelledby="christmas-tour-heading"
    >
      <div className="christmas-tour-inner">
        <div className="christmas-tour-copy">
          <p className="christmas-eyebrow">
            <Sparkles size={18} aria-hidden="true" /> Decked out is an
            understatement
          </p>
          <h2 id="christmas-tour-heading">
            CHRISTMAS
            <br />
            TURNED{" "}
            <em>
              ALL
              <br />
              THE WAY UP.
            </em>
          </h2>
          <p>
            Step through the garland and into our Christmas pop-up. Ceiling to
            floor, corner to corner—Spunkmeyers is dressed for the most
            wonderful time of the year.
          </p>
          <p>
            Bring your favorite people. Wear your loudest Christmas sweater.
            We’ll bring the cold beer, hot food, and a whole lot of holiday
            spirit.
          </p>
          <div className="christmas-actions">
            <Link href="/events" className="btn-premium">
              Plan Your Night
            </Link>
            <a
              href={LINKS.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Get Directions
            </a>
          </div>
          <p className="christmas-small-note">
            993 High Street · Wadsworth, Ohio
          </p>
        </div>
        <figure className="christmas-tour-video">
          <div className="christmas-tour-screen">
            {loaded ? (
              <video
                ref={videoRef}
                src="/holiday/holiday-tour.mp4"
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster="/holiday/holiday-tour-poster.jpg"
                width="540"
                height="960"
                aria-label="Expedition CLE’s walk-through of the Spunkmeyers Christmas pop-up, with holiday decorations and themed rooms"
              />
            ) : (
              <img
                src="/holiday/holiday-tour-poster.jpg"
                alt="A first look at the lights and decorations in the Christmas walk-through video"
                width="540"
                height="960"
                loading="lazy"
              />
            )}
            {!loaded && (
              <button
                type="button"
                className="christmas-play-tour"
                onClick={() => setLoaded(true)}
                aria-label="Play the full Christmas walk-through video"
              >
                <Play size={28} fill="currentColor" />
                <span>Watch the walk-through</span>
              </button>
            )}
          </div>
          <figcaption>
            A look around Spunks · Video by Expedition CLE
          </figcaption>
        </figure>
        <figure className="christmas-tour-photo">
          <img
            src="/holiday/christmas-at-spunks.webp"
            width="1200"
            height="1600"
            loading="lazy"
            alt="The entrance to Spunkmeyers transformed with a Santa, giant colored bulbs, Christmas presents and red and green tinsel"
          />
          <figcaption>Come on in. We saved you some Christmas.</figcaption>
        </figure>
      </div>
    </section>
  );
}
