// Shared read-aloud plumbing for the chat Listen button and the page
// narration player. The browser's built-in speech engine is the universal
// fallback; the preferred path is pre-generated / API audio in Spunkmeyers'
// own ElevenLabs voice.

export const speech =
  typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

export function pickVoice(): SpeechSynthesisVoice | null {
  if (!speech) return null;
  const voices = speech.getVoices();
  // Warmest widely-available voices first, then any US English, then any English.
  const preferred = ["Samantha", "Google US English", "Aria", "Allison", "Ava", "Karen"];
  for (const name of preferred) {
    const hit = voices.find((v) => v.name.includes(name));
    if (hit) return hit;
  }
  return voices.find((v) => v.lang === "en-US") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

// Some engines load voices asynchronously; touching getVoices() once warms them.
export function warmVoices(): () => void {
  if (!speech) return () => {};
  speech.getVoices();
  const warm = () => speech.getVoices();
  speech.addEventListener?.("voiceschanged", warm);
  return () => speech.removeEventListener?.("voiceschanged", warm);
}
