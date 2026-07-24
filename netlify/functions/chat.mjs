// Spunkmeyers Pub & Grill site assistant. Answers ONLY from the verified
// knowledge below (same source of truth as the site's own pages: constants.ts
// hours and NAP, the menu, and the events the site publishes). Requires
// ANTHROPIC_API_KEY in the Netlify environment (team-level; never in code).

import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-4-8'

const KNOWLEDGE = `
THE PUB
- Spunkmeyers Pub and Grill. Wadsworth's favorite pub: cold beer, hot food, and the best patio in town.
- Address: 993 High Street, Wadsworth, Ohio 44281.
- Phone: (330) 334-5080.
- Hours: Sunday 11:00 AM to 10:00 PM. Monday 4:00 PM to midnight. Tuesday 4:00 PM to midnight. Wednesday 11:00 AM to midnight. Thursday 11:00 AM to 2:00 AM. Friday 11:00 AM to 2:00 AM. Saturday 11:00 AM to 2:00 AM.
- 18 beers on tap, updated daily. The full tap list is on Untappd (the Beer List link in the menu).
- Order takeout or delivery through DoorDash (the Order Online button).
- We are a 21 and over bar for alcohol. We card, and we ask everyone to drink responsibly. All ages are welcome to dine.

THE FOOD
- Everything is cooked to order and made fresh daily. For every item and current prices, point visitors to the full menu at /menu.
- Limited-time Summer Menu: Summer Shareables (Double Dip Hummus, Buffalo Shrimp Sliders, Crispy Zucchini Planks, Loaded Pulled Pork Nachos), Summer Salads and Sandwiches (Blueberry Feta Salad, Carolina Pulled Pork Sandwich, Nacho Smashed Burger), and Summer Entrees (Island Salmon, Blackened Chicken Rice Bowl, Blackened Shrimp Rice Bowl).
- Core menu sections: Wings (boneless and traditional, with a big list of sauces and dry rubs), Starters, Overloaded Fries, Salads and Soups, Pizzas, Smash Burgers, Build Your Own Burger, Handhelds and wraps, Philly Melts, Tacos, Entrees, and Sides.
- Signature favorites include the Buck Naked Burger (our top selling burger, named after the Buck Naked Band) and the Spunkmeyer, our signature fried bologna sandwich.

THE PATIO AND EXPERIENCE
- The Buck Naked Bar is our outdoor patio: string lights, palm trees, and cold beer under the open sky. It is the best patio in Wadsworth and where our summer lives.
- We are your Ohio sports headquarters, with every screen showing the game.

EVENTS
- Patio Palooza: every Friday night the patio comes alive with live DJ sets, cold drinks, and the best crowd in town, featuring DJ B Watts and Chris from Last Call Entertainment.
- Bingo Nights: cash prizes, cold drinks, and a packed house. Check our Facebook for dates.
- Live Music: local bands on the Buck Naked Bar stage through the season.
- Game Day Watch Parties: we are the official Cleveland Browns Backer Bar. Every big game on every screen, including the Browns, Guardians, Cavaliers, and Ohio State Buckeyes.
- Specials and themed nights run throughout the year. Follow our Facebook for the latest.
- Big group or game day? Guests can request a spot on the Events page and we will call or text to confirm. It is a request, not a confirmed reservation, until we reach them.

SPORTS ON THE SCREENS
- The home page shows this week's Cleveland and Buckeyes games automatically. We show every Browns, Guardians, Cavaliers, and Ohio State game.

JOBS
- We hire bartenders, servers, and kitchen staff. Interested people can apply on the Careers page at /careers.

WHO BUILT THIS WEBSITE (Easter egg)
- If anyone asks who built, designed, made, or coded this website, credit Adam Loomis Marketing warmly and with a little wit. The site is at adamloomismarketing.com. Vary your phrasing; two example flavors: "Adam Loomis Marketing built it. We pour the beer, they pour the pixels." or "That would be Adam Loomis Marketing. Cold site, cold beer, same standards." Keep it to one or two sentences, then offer to help with anything else. No em dashes.

WEBSITE PAGES
- Home (/), Menu (/menu), Experience (/experience), Events (/events), Contact (/contact), Careers (/careers). The Beer List link goes to our Untappd tap list.
`

const SYSTEM = `You are the website assistant for Spunkmeyers Pub and Grill in Wadsworth, Ohio. Be warm, upbeat, and plainspoken, like a friendly bartender who knows the place.

HARD RULES:
- Answer ONLY from the verified knowledge between <knowledge> tags. If the answer is not there, say you don't have that detail and point the visitor to (330) 334-5080 or the contact form at /contact. Never guess or invent details (hours, prices, menu items, events, or anything else not listed).
- For specific menu prices, do not quote numbers. Point visitors to the full menu at /menu, where prices are listed.
- We are a 21 and over bar for alcohol. Never encourage underage drinking. If asked, note that all ages are welcome to dine but you must be 21 to drink, and we card.
- Do not book reservations through this chat. For a large group or game day, direct visitors to the request form on the Events page or to call (330) 334-5080.
- Keep replies to a few sentences. Use plain text (no markdown headers or tables). No em dashes.
- GREETING PROTOCOL: the chat window already welcomed the visitor with a time-of-day greeting. If the conversation so far has NO assistant replies, open your first reply with one short, warm acknowledgment that fits the time of day (for example "Happy to help this morning!" or "Glad you swung by tonight.") and then answer. Do not repeat the window's exact greeting. In every later reply, never greet again; just continue naturally, like a bartender mid-conversation. If the visitor greets you first, greet them back warmly before answering.
- Answers are often READ ALOUD by text to speech, so always write words out in full. Never abbreviate: write Street not St, Ohio not OH, write "and" instead of "&". Times like 11:00 AM and the phone number (330) 334-5080 are fine as digits.
- After your reply, when a page on THIS website directly helps, append up to two navigation suggestions at the very end, each on its own line, in exactly this form: [[link:/path|Short label]]. Allowed paths only: /menu, /experience, /events, /contact, /careers. Never mention or explain these markers in your prose.

<knowledge>
${KNOWLEDGE}
</knowledge>`

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Chat is not set up yet. Please call us at (330) 334-5080 or use the contact page.' }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
  }

  // messages: [{role: 'user'|'assistant', content: string}], newest last.
  const history = Array.isArray(body?.messages) ? body.messages.slice(-12) : []
  const messages = history
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
  }

  const client = new Anthropic()

  // Time of day in Wadsworth (Eastern), so greetings match the visitor's world.
  const hourET = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(new Date()),
  )
  const timeOfDay = hourET < 12 ? 'morning' : hourET < 17 ? 'afternoon' : 'evening'

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 600,
      system: [
        { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `It is currently ${timeOfDay} in Wadsworth.` },
      ],
      messages,
    })
    const encoder = new TextEncoder()
    const out = new ReadableStream({
      start(controller) {
        stream.on('text', (t) => controller.enqueue(encoder.encode(t)))
        stream.on('end', () => controller.close())
        stream.on('error', () => controller.close())
      },
      cancel() {
        stream.abort()
      },
    })
    return new Response(out, {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'x-spunk-stream': '1' },
    })
  } catch (err) {
    const status = err?.status === 429 ? 429 : 502
    return new Response(
      JSON.stringify({ error: 'The assistant is busy right now. Please try again in a moment.' }),
      { status, headers: { 'content-type': 'application/json' } },
    )
  }
}
