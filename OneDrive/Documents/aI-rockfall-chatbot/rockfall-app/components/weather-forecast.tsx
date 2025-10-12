type ForecastItem = {
  dt: number
  dt_txt?: string
  main?: { temp?: number }
  weather?: { description?: string; icon?: string }[]
}

function pickMiddayPerDay(list: ForecastItem[] = []) {
  // Prefer entries around 12:00:00 local; fallback to first of each day
  const byDay = new Map<string, ForecastItem[]>()
  list.forEach((it) => {
    const d = it.dt_txt ? it.dt_txt.split(" ")[0] : new Date(it.dt * 1000).toISOString().split("T")[0]
    if (!byDay.has(d)) byDay.set(d, [])
    byDay.get(d)!.push(it)
  })

  const selected: ForecastItem[] = []
  Array.from(byDay.entries())
    .slice(0, 6)
    .forEach(([_, arr]) => {
      const midday = arr.find((i) => i.dt_txt?.includes("12:00:00"))
      selected.push(midday || arr[0])
    })
  return selected.slice(0, 5)
}

export function WeatherForecast({
  list,
  units = "metric",
}: {
  list: ForecastItem[]
  units?: "metric" | "imperial"
}) {
  const tempUnit = units === "imperial" ? "°F" : "°C"
  const days = pickMiddayPerDay(list)

  if (!days.length) return null

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4 md:p-6 grid gap-4">
      <h3 className="text-lg font-semibold">5-Day Forecast</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {days.map((d) => {
          const date = d.dt_txt ? new Date(d.dt_txt) : new Date(d.dt * 1000)
          const label = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
          const icon = d.weather?.[0]?.icon
          const desc = d.weather?.[0]?.description
          return (
            <div key={d.dt} className="rounded-md border bg-background p-3 grid gap-2 text-center">
              <div className="text-sm text-muted-foreground">{label}</div>
              {icon ? (
                <img
                  src={`https://openweathermap.org/img/wn/${icon}.png`}
                  alt={desc || "weather icon"}
                  className="mx-auto h-10 w-10"
                />
              ) : null}
              <div className="text-lg font-semibold">
                {d.main?.temp !== undefined ? Math.round(d.main.temp) : "--"}
                {tempUnit}
              </div>
              <div className="text-xs capitalize text-muted-foreground">{desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
