type CurrentData = {
  temp?: number
  feels_like?: number
  humidity?: number
  pressure?: number
  wind_speed?: number
  wind_deg?: number
  description?: string
  icon?: string
}

export function WeatherCurrent({
  locationLabel,
  current,
  units = "metric",
}: {
  locationLabel?: string
  current: CurrentData | null
  units?: "metric" | "imperial"
}) {
  if (!current) return null
  const tempUnit = units === "imperial" ? "°F" : "°C"
  const speedUnit = units === "imperial" ? "mph" : "m/s"
  const iconUrl = current.icon ? `https://openweathermap.org/img/wn/${current.icon}@2x.png` : undefined

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4 md:p-6 grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-pretty">
            Current Weather{locationLabel ? ` — ${locationLabel}` : ""}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">{current.description}</p>
        </div>
        {iconUrl ? (
          <img src={iconUrl || "/placeholder.svg"} alt={current.description || "weather icon"} className="h-14 w-14" />
        ) : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-3xl font-semibold">
            {current.temp?.toFixed?.(0)}
            {tempUnit}
          </div>
          <div className="text-xs text-muted-foreground">
            Feels like {current.feels_like?.toFixed?.(0)}
            {tempUnit}
          </div>
        </div>
        <div>
          <div className="text-xl font-medium">{current.humidity}%</div>
          <div className="text-xs text-muted-foreground">Humidity</div>
        </div>
        <div>
          <div className="text-xl font-medium">
            {current.wind_speed} {speedUnit}
          </div>
          <div className="text-xs text-muted-foreground">Wind</div>
        </div>
        <div>
          <div className="text-xl font-medium">{current.pressure} hPa</div>
          <div className="text-xs text-muted-foreground">Pressure</div>
        </div>
      </div>
    </div>
  )
}
