"use client"

import useSWR from "swr"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeatherCurrent } from "@/components/weather-current"
import { WeatherForecast } from "@/components/weather-forecast"

type ApiResponse = {
  location?: { name?: string; country?: string; coords?: { lat?: number; lon?: number } }
  current?: any
  forecast?: { list?: any[] }
  units?: "metric" | "imperial"
  error?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WeatherPage() {
  const [city, setCity] = useState<string>("Jaipur")
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [units, setUnits] = useState<"metric" | "imperial">("metric")

  const key = useMemo(() => {
    if (coords) return `/api/weather?lat=${coords.lat}&lon=${coords.lon}&units=${units}`
    return city ? `/api/weather?city=${encodeURIComponent(city)}&units=${units}` : null
  }, [city, coords, units])

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(key, fetcher, {
    revalidateOnFocus: false,
  })

  const onUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      () => alert("Unable to retrieve your location."),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const locationLabel = useMemo(() => {
    if (data?.location?.name) {
      const suffix = data.location.country ? `, ${data.location.country}` : ""
      return `${data.location.name}${suffix}`
    }
    if (coords) return `Lat ${coords.lat.toFixed(2)}, Lon ${coords.lon.toFixed(2)}`
    return city || "—"
  }, [data, coords, city])

  return (
    <main className="container mx-auto max-w-5xl p-4 md:p-8 grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-balance">Weather and Forecast</h1>
        <p className="text-sm text-muted-foreground">
          Search by city or use your location. We don&apos;t store or send your coordinates anywhere except to fetch
          weather.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Find weather</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6 grid gap-2">
              <Label htmlFor="city">City</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="city"
                  placeholder="Enter a city (e.g., Jaipur)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setCoords(null)
                      mutate()
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    setCoords(null)
                    mutate()
                  }}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="md:col-span-3 grid gap-2">
              <Label>Units</Label>
              <Select value={units} onValueChange={(v: "metric" | "imperial") => setUnits(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (°C, m/s)</SelectItem>
                  <SelectItem value="imperial">Imperial (°F, mph)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Button variant="secondary" className="w-full" onClick={onUseLocation}>
                Use my location
              </Button>
            </div>
          </div>

          {isLoading && <div className="text-sm text-muted-foreground">Loading weather…</div>}
          {error && <div className="text-sm text-red-600">Failed to load weather.</div>}
          {data?.error && <div className="text-sm text-red-600">{data.error}</div>}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <WeatherCurrent locationLabel={locationLabel} current={data?.current ?? null} units={units} />
        <WeatherForecast list={data?.forecast?.list ?? []} units={units} />
      </div>
    </main>
  )
}
