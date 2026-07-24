// Reads a chat answer or page section aloud in Spunkmeyers' ElevenLabs voice
// (Adam's clone, the shared "Porchlight" voice). GET ?text= AND POST { text }
// -> audio/mpeg. Requires ELEVENLABS_API_KEY (Netlify team-level env var,
// shared across sites).
//
// The client falls back to the browser's built-in voice on ANY non-200, so this
// function failing (quota exhausted, outage, missing key) never breaks the
// Listen button, it just sounds less like Adam.

const VOICE_ID = 'XAc0FruUymIjvICmNYkM'

// eleven_turbo_v2_5: half the credit cost and much lower latency than
// eleven_multilingual_v2, with near-equal quality on cloned voices.
const MODEL_ID = 'eleven_turbo_v2_5'

// Answers and narration sections are short; the cap keeps a stray long
// payload from burning credits. ~800 chars is under a minute of speech.
const MAX_CHARS = 800

// Text-to-speech mangles abbreviations ("Blvd", "OH", "St"), so expand the ones
// our content actually uses before synthesis. Word-boundary matches only.
export const expandForSpeech = (t) =>
  t
    .replace(/\bBlvd\.?\b/g, 'Boulevard')
    .replace(/\bAve\.?\b/g, 'Avenue')
    .replace(/\bRd\.?\b/g, 'Road')
    .replace(/\bSt\.?\b/g, 'Street')
    .replace(/\bOH\b/g, 'Ohio')
    .replace(/&/g, ' and ')
    // Clock times: "11am", "11 AM", "11:00am", "4:30 pm" -> a form TTS reads
    // naturally. 12am -> midnight, 12pm -> noon; on-the-hour drops ":00".
    // Without this, "11am" reads as "elevenam" and hours sound garbled.
    .replace(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*([ap])\.?\s?m\.?\b/gi, (_, h, min, ap) => {
      const hour = Number(h)
      const mer = ap.toLowerCase() === 'a' ? 'AM' : 'PM'
      if (!min || min === '00') {
        if (hour === 12) return mer === 'AM' ? 'midnight' : 'noon'
        return `${hour} ${mer}`
      }
      return `${hour}:${min} ${mer}`
    })
    // A dash right after a time reads as a range: "11 AM - 10 PM" -> "11 AM to
    // 10 PM". Scoped to time words so it never touches a phone number's hyphen.
    .replace(/\b(AM|PM|midnight|noon)\s*[-–—]\s*/gi, '$1 to ')
    // Phone numbers and ZIP codes read digit by digit ("3 3 0, 3 3 4, ..."),
    // never as "three hundred thirty". Commas give natural pauses.
    .replace(/\(?(\d{3})\)?[ .-]?(\d{3})[-.](\d{4})\b/g, (_, a, b, c) =>
      [a, b, c].map((g) => g.split('').join(' ')).join(', '))
    .replace(/\b(\d{5})\b/g, (_, z) => z.split('').join(' '))

export const handler = async (event) => {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    console.error('[tts] ELEVENLABS_API_KEY is not set')
    return { statusCode: 503, body: 'tts not configured' }
  }

  // GET ?text= lets the client point an <audio> element directly at this
  // endpoint, so play() starts inside the tap gesture (required on iOS).
  // POST {text} remains for scripts (narration generation).
  let text = ''
  if (event.httpMethod === 'GET') {
    text = String(event.queryStringParameters?.text || '').trim()
  } else if (event.httpMethod === 'POST') {
    try {
      text = String(JSON.parse(event.body || '{}').text || '').trim()
    } catch {
      return { statusCode: 400, body: 'bad json' }
    }
  } else {
    return { statusCode: 405, body: 'GET or POST only' }
  }
  if (!text) return { statusCode: 400, body: 'no text' }
  if (text.length > MAX_CHARS) text = `${text.slice(0, MAX_CHARS)}…`
  text = expandForSpeech(text)

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    )
    if (!res.ok) {
      console.error('[tts] elevenlabs error', res.status, await res.text().catch(() => ''))
      return { statusCode: 502, body: 'tts failed' }
    }
    const buf = Buffer.from(await res.arrayBuffer())
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store', 'x-tts-cap': String(MAX_CHARS), 'x-tts-rev': '1' },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (e) {
    console.error('[tts] exception', e)
    return { statusCode: 502, body: 'tts failed' }
  }
}
