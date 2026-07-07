/*
 * Live weather for the in-bar TV board.
 *   - Current conditions + 3-day forecast from Open-Meteo (free, no key).
 *   - Active weather alerts from the National Weather Service (free, no key,
 *     but requires a User-Agent — hence server-side).
 * Cached at the CDN edge so we never hammer either service.
 */

const LAT = 41.0498303;
const LON = -81.7276839;
const TZ = "America/New_York";

// WMO weather_code -> short label. (Icon is chosen client-side from the code.)
function label(code) {
  const map = {
    0: "Clear",
    1: "Mostly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    56: "Freezing Drizzle",
    57: "Freezing Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Freezing Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Showers",
    85: "Snow Showers",
    86: "Snow Showers",
    95: "Thunderstorms",
    96: "Thunderstorms",
    99: "Severe Storms",
  };
  return map[code] || "—";
}

async function getForecast() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=${encodeURIComponent(TZ)}&forecast_days=3`;
  const res = await fetch(url);
  if (!res.ok) return { current: null, forecast: null };
  const d = await res.json();

  const c = d.current || {};
  const current = {
    tempF: Math.round(c.temperature_2m),
    feelsF: Math.round(c.apparent_temperature),
    windMph: Math.round(c.wind_speed_10m),
    code: c.weather_code,
    label: label(c.weather_code),
  };

  const day = d.daily || {};
  const forecast = (day.time || []).map((date, i) => ({
    date,
    code: day.weather_code?.[i],
    label: label(day.weather_code?.[i]),
    hiF: Math.round(day.temperature_2m_max?.[i]),
    loF: Math.round(day.temperature_2m_min?.[i]),
    pop: day.precipitation_probability_max?.[i] ?? null,
  }));

  return { current, forecast };
}

async function getAlerts() {
  try {
    const res = await fetch(`https://api.weather.gov/alerts/active?point=${LAT},${LON}`, {
      headers: {
        "User-Agent": "spunkmeyers-pub-site (adam.loomis@gmail.com)",
        Accept: "application/geo+json",
      },
    });
    if (!res.ok) return [];
    const d = await res.json();
    return (d.features || [])
      .map((f) => f.properties || {})
      .filter((p) => p.event)
      .map((p) => ({
        event: p.event,
        severity: p.severity, // Extreme | Severe | Moderate | Minor | Unknown
        headline: p.headline || p.event,
        ends: p.ends || p.expires || null,
      }))
      .slice(0, 4);
  } catch {
    return [];
  }
}

export async function handler() {
  try {
    const [fc, alerts] = await Promise.all([getForecast(), getAlerts()]);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
      },
      body: JSON.stringify({ generatedAt: new Date().toISOString(), ...fc, alerts }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({ current: null, forecast: null, alerts: [], error: String(err) }),
    };
  }
}
