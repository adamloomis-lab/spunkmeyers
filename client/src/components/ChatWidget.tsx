import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { X, Send, ArrowRight, Volume2, Square, Mic, Beer } from "lucide-react";

type Chip = { href: string; label: string };
type Msg = { role: "user" | "assistant"; content: string; chips?: Chip[] };

// The model appends [[link:/path|Label]] directives; strip them from prose
// and keep only safe internal paths as navigation chips.
function extractChips(text: string): { content: string; chips: Chip[] } {
  const chips: Chip[] = [];
  const content = text
    .replace(/\[\[link:([^\]|]+)\|([^\]]+)\]\]/g, (_, href: string, label: string) => {
      if (href.startsWith("/") && !href.startsWith("//") && chips.length < 2) {
        chips.push({ href: href.trim(), label: label.trim() });
      }
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { content, chips };
}

// The opener greets by the visitor's own clock, like a bartender would.
function makeOpener(): Msg {
  const h = new Date().getHours();
  const greeting =
    h < 12
      ? "Good morning! Hope your day is off to a great start."
      : h < 17
        ? "Hey, great to see you! Hope you're having a good afternoon."
        : "Good evening! Thanks for stopping by.";
  return {
    role: "assistant",
    content: `${greeting} Ask me about our menu, hours, events, or the patio. To order, hit Order Online, or call us at (330) 334-5080.`,
  };
}

const STARTERS = ["What are your hours?", "What's on the patio Friday?", "What's on the menu?"];

// Read-aloud: answers are spoken in Spunkmeyers' own ElevenLabs voice via
// /api/tts. If that call fails for any reason, the browser's built-in speech
// engine takes over, so the button always works.
import { speech, pickVoice, warmVoices } from "../lib/readAloud";

// Voice input: tap the mic, ask out loud, and the words land in the box.
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
const RecognitionCtor =
  typeof window !== "undefined"
    ? ((window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition)
    : undefined;

// Floating pub assistant. Talks to /api/chat (Netlify function backed by the
// Anthropic API, grounded strictly on verified site facts). Labeled launcher,
// large type, a Listen button that reads any answer aloud, and voice input.
export default function ChatWidget() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => [makeOpener()]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => warmVoices(), []);

  // Mic (voice input): render only after mount so SSR and client agree.
  const [micReady, setMicReady] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  useEffect(() => {
    setMicReady(Boolean(RecognitionCtor));
  }, []);

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    if (!RecognitionCtor) return;
    const rec = new (RecognitionCtor as new () => SpeechRecognitionLike)();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const t = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join("");
      setDraft(t);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    rec.onerror = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  // ONE persistent audio element, reused for every playback. The first tap
  // unlocks it on iOS; later src changes inherit that permission, so the
  // voice never silently downgrades to the system voice on mobile.
  const stopSpeaking = () => {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.onplaying = null;
      a.pause();
    }
    speech?.cancel();
    setSpeakingIdx(null);
  };

  // Never keep talking (or listening) after the chat closes or unmounts.
  useEffect(() => {
    if (!open) {
      stopSpeaking();
      setLoadingIdx(null);
      recRef.current?.abort();
    }
    return () => {
      stopSpeaking();
      recRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Browser-voice fallback, used only when /api/tts is unavailable.
  function speakWithBrowser(text: string, idx: number) {
    if (!speech) return;
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => setSpeakingIdx((s) => (s === idx ? null : s));
    u.onerror = () => setSpeakingIdx((s) => (s === idx ? null : s));
    setSpeakingIdx(idx);
    speech.speak(u);
  }

  function toggleSpeak(text: string, idx: number) {
    if (speakingIdx === idx || loadingIdx === idx) {
      stopSpeaking();
      setLoadingIdx(null);
      return;
    }
    stopSpeaking();
    setLoadingIdx(idx);
    let a = audioRef.current;
    if (!a) {
      a = new Audio();
      audioRef.current = a;
    }
    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      setLoadingIdx((v) => (v === idx ? null : v));
      speakWithBrowser(text, idx);
    };
    a.onended = () => {
      if (audioRef.current === a) stopSpeaking();
    };
    a.onerror = fallback;
    a.onplaying = () => {
      setLoadingIdx((v) => (v === idx ? null : v));
      setSpeakingIdx(idx);
    };
    // Direct GET src: playback starts inside the tap gesture itself, which is
    // what iOS requires; the request streams while the element buffers.
    a.src = `/api/tts?text=${encodeURIComponent(text)}`;
    a.play().catch(fallback);
  }

  // First-visit nudge: reveal what the chat button is, once the visitor has
  // settled in (scrolled deep or dwelled a while). Shown once per session.
  useEffect(() => {
    if (open) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("spunkbot-greeted") === "1";
    } catch {
      /* private mode: just show it */
    }
    if (seen) return;

    let done = false;
    const cleanup = () => {
      clearTimeout(dwell);
      window.removeEventListener("scroll", onScroll);
    };
    const reveal = () => {
      if (done) return;
      done = true;
      setShowGreeting(true);
      cleanup();
    };
    const onScroll = () => {
      if (window.scrollY > 700) reveal();
    };
    const dwell = setTimeout(reveal, 12000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, [open]);

  const dismissGreeting = () => {
    setShowGreeting(false);
    try {
      sessionStorage.setItem("spunkbot-greeted", "1");
    } catch {
      /* ignore */
    }
  };

  const toggleOpen = () => {
    setOpen((v) => !v);
    dismissGreeting();
  };

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  async function send(text?: string) {
    const content = (text ?? draft).trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }), // opener is client-side only
      });

      if (res.headers.get("x-spunk-stream") === "1" && res.body) {
        setMsgs((m) => [...m, { role: "assistant", content: "" }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          const visible = extractChips(full).content;
          setMsgs((m) => {
            const copy = m.slice();
            copy[copy.length - 1] = { role: "assistant", content: visible };
            return copy;
          });
        }
        const { content: finalText, chips } = extractChips(full);
        setMsgs((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            content: finalText || "Sorry, I came up empty. Please call us and we'll help.",
            chips,
          };
          return copy;
        });
      } else {
        const data = (await res.json()) as { reply?: string; error?: string };
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            content: data.reply ?? data.error ?? "Something went wrong. Please reach us through the contact page.",
          },
        ]);
      }
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: "I couldn't connect just now. Please try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher: a labeled pill. Mobile: bottom-right above the action bar.
          Desktop: bottom-left, clear of the Order Online floating pill. */}
      <div className="group fixed bottom-24 right-4 z-40 lg:bottom-6 lg:left-8 lg:right-auto">
        {showGreeting && !open && (
          <div className="absolute bottom-full right-0 mb-3 w-64 rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.7)] lg:right-auto lg:left-0">
            <button
              type="button"
              onClick={dismissGreeting}
              aria-label="Dismiss"
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-[#888] transition-colors hover:bg-[#222] hover:text-[#F5F0EB]"
            >
              <X size={13} />
            </button>
            <button type="button" onClick={toggleOpen} className="flex items-start gap-2.5 pr-4 text-left">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#E8601C]">
                <Beer size={16} className="text-white" />
              </span>
              <span>
                <span className="block font-heading text-[15px] font-semibold text-[#F5F0EB]">Questions? Just ask.</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-[#bbb]">
                  Menu, hours, events. We can even read the answers out loud.
                </span>
              </span>
            </button>
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[#1a1a1a] lg:right-auto lg:left-6"
            />
          </div>
        )}

        <button
          type="button"
          onClick={toggleOpen}
          aria-label={open ? "Close chat" : "Chat with us"}
          aria-expanded={open}
          className={`relative inline-flex items-center justify-center gap-2.5 rounded-full border border-[#E8601C]/45 bg-[#111111] text-[#F5F0EB] shadow-[0_14px_34px_rgba(0,0,0,0.5)] transition-all hover:border-[#E8601C] hover:scale-[1.03] active:scale-95 ${
            open ? "h-14 w-14" : "py-3.5 pl-4 pr-5"
          }`}
        >
          {!open && (
            <span aria-hidden className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-[#E8601C] ring-2 ring-[#111111]" />
          )}
          {open ? (
            <X size={24} />
          ) : (
            <>
              <Beer size={24} className="text-[#F07A3A]" />
              <span className="font-heading text-[15px] font-semibold uppercase tracking-wide">Chat with us</span>
            </>
          )}
        </button>
      </div>

      {open && (
        <section
          aria-label="Spunkmeyers Pub and Grill chat assistant"
          className="chat-pop fixed inset-x-3 bottom-44 z-40 flex max-h-[68dvh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:right-4 sm:w-[min(92vw,420px)] lg:bottom-24 lg:left-8 lg:right-auto"
        >
          <header className="flex items-center gap-3.5 border-b border-white/10 bg-[#111111] px-5 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E8601C]/15">
              <Beer size={22} className="text-[#F07A3A]" />
            </span>
            <div>
              <p className="font-heading text-[19px] font-semibold uppercase tracking-wide leading-tight text-[#F5F0EB]">
                Ask us anything
              </p>
              <p className="mt-0.5 text-[12px] text-[#999]">Spunkmeyers Pub & Grill · automated assistant</p>
            </div>
          </header>

          <div ref={scroller} className="flex-1 space-y-3.5 overflow-y-auto px-4 py-5">
            {msgs.map((m, i) => (
              <div key={`${i}-${m.role}`} className="chat-msg">
                <div
                  className={`max-w-[88%] px-4 py-3 text-[16px] leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto rounded-2xl rounded-br-md bg-[#E8601C] text-white"
                      : "rounded-2xl rounded-bl-md border border-white/10 bg-[#222] text-[#F5F0EB]"
                  }`}
                >
                  {m.content}
                  {m.chips && m.chips.length > 0 && (
                    <span className="mt-3 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <button
                          key={c.href}
                          type="button"
                          onClick={() => navigate(c.href)}
                          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-[#E8601C]/40 bg-[#1a1a1a] px-3.5 py-2 text-[14px] font-semibold text-[#E8601C] transition-colors hover:bg-[#E8601C] hover:text-white"
                        >
                          {c.label} <ArrowRight size={13} />
                        </button>
                      ))}
                    </span>
                  )}
                </div>
                {/* Listen: reads this answer aloud in Spunkmeyers' own voice */}
                {m.role === "assistant" && m.content && (
                  <button
                    type="button"
                    onClick={() => toggleSpeak(m.content, i)}
                    aria-pressed={speakingIdx === i}
                    className={`mt-1.5 inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                      speakingIdx === i || loadingIdx === i
                        ? "bg-[#E8601C] text-white"
                        : "text-[#888] hover:bg-[#222] hover:text-[#E8601C]"
                    }`}
                  >
                    {loadingIdx === i ? (
                      <>
                        <span className="inline-flex items-center gap-1" aria-hidden>
                          <span className="typing-dot !bg-current" />
                          <span className="typing-dot !bg-current" style={{ animationDelay: "0.18s" }} />
                          <span className="typing-dot !bg-current" style={{ animationDelay: "0.36s" }} />
                        </span>
                        <span className="sr-only">Loading audio</span>
                      </>
                    ) : speakingIdx === i ? (
                      <>
                        <Square size={13} /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 size={15} /> Listen
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
            {msgs.length === 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {STARTERS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="min-h-[44px] rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-2.5 text-left text-[14.5px] text-[#bbb] transition-colors hover:border-[#E8601C] hover:text-[#E8601C]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {busy && (
              <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-[#222] px-4 py-3.5">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.18s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.36s" }} />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-[#1a1a1a] p-3"
          >
            {micReady && (
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Ask your question by voice"}
                aria-pressed={listening}
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  listening
                    ? "animate-pulse border-[#c0392b] bg-[#c0392b] text-white"
                    : "border-white/10 bg-[#222] text-[#bbb] hover:border-[#E8601C] hover:text-[#E8601C]"
                }`}
              >
                <Mic size={19} />
              </button>
            )}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={listening ? "Listening…" : "Type or tap the mic"}
              aria-label="Your question"
              className="w-full rounded-xl border border-white/10 bg-[#222] px-4 py-3 text-[16px] text-[#F5F0EB] outline-none transition-colors placeholder:text-[#888] focus:border-[#E8601C]"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8601C] text-white transition-colors hover:bg-[#d4540f] disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="border-t border-white/10 bg-[#151515] px-4 py-2.5 text-[12px] leading-snug text-[#888]">
            This assistant is automated. You must be 21 to drink; please don't share personal details here.
          </p>
        </section>
      )}
    </>
  );
}
