export const dynamic = "force-dynamic"

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.set(k, String(v))
  })
  return search.toString()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const city = url.searchParams.get("city") || "Jaipur"
  const lat = url.searchParams.get("lat")
  const lon = url.searchParams.get("lon")
  const units = url.searchParams.get("units") || "metric"

  const apiKey = process.env.WEATHER_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "Missing WEATHER_API_KEY. Add it in Project Settings > Environment Variables." },
      { status: 500 },
    )
  }

  // Endpoints
  const base = "https://api.openweathermap.org/data/2.5"
  const currentEndpoint = `${base}/weather`
  const forecastEndpoint = `${base}/forecast` // 5-day / 3-hour forecast

  const commonParams = {
    appid: apiKey,
    units,
  } as const

  const locationParams = lat && lon ? { lat, lon } : { q: city }

  const currentQs = buildQuery({ ...commonParams, ...locationParams })
  const forecastQs = buildQuery({ ...commonParams, ...locationParams })

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${currentEndpoint}?${currentQs}`, { cache: "no-store" }),
      fetch(`${forecastEndpoint}?${forecastQs}`, { cache: "no-store" }),
    ])

    if (!currentRes.ok) {
      const text = await currentRes.text()
      return Response.json({ error: `Current weather error: ${text}` }, { status: currentRes.status })
    }
    if (!forecastRes.ok) {
      const text = await forecastRes.text()
      return Response.json({ error: `Forecast error: ${text}` }, { status: forecastRes.status })
    }

    const current = await currentRes.json()
    const forecast = await forecastRes.json()

    // Normalize a compact payload
    return Response.json(
      {
        location: {
          name: current?.name,
          country: current?.sys?.country,
          coords: { lat: current?.coord?.lat, lon: current?.coord?.lon },
        },
        current: {
          temp: current?.main?.temp,
          feels_like: current?.main?.feels_like,
          humidity: current?.main?.humidity,
          pressure: current?.main?.pressure,
          wind_speed: current?.wind?.speed,
          wind_deg: current?.wind?.deg,
          description: current?.weather?.[0]?.description,
          icon: current?.weather?.[0]?.icon,
        },
        forecast, // full OpenWeather 3-hourly list to keep flexible on the client
        units,
        source: "openweathermap",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (e: any) {
    return Response.json({ error: `Unexpected error: ${e?.message || e}` }, { status: 500 })
  }
}
