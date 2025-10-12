;(() => {
  const form = document.getElementById("city-form")
  const input = document.getElementById("city-input")
  const btnLocate = document.getElementById("btn-locate")
  const result = document.getElementById("weather-result")

  function iconUrl(code) {
    return `https://openweathermap.org/img/wn/${code}@2x.png`
  }

  function render(data) {
    if (!data || data.error) {
      result.innerHTML = `<p class="muted">${data?.error || "Unable to load weather."}</p>`
      return
    }
    const loc = data.location || {}
    const cur = data.current || {}
    const fc = data.forecast || []
    const when = cur.observedAt ? new Date(cur.observedAt * 1000).toLocaleString() : "—"

    const fcCards = fc
      .map((it) => {
        const ts = it.dt ? new Date(it.dt * 1000).toLocaleString() : ""
        return `<div class="card">
        <div class="row" style="align-items:center; gap:0.5rem;">
          ${it.icon ? `<img alt="" src="${iconUrl(it.icon)}" width="40" height="40">` : ""}
          <div><div>${ts}</div><div class="muted" style="font-size:0.9rem">${it.description || ""}</div></div>
        </div>
        <div style="margin-top:0.35rem"><strong>${it.tempC?.toFixed?.(1) ?? it.tempC}°C</strong> <span class="muted">(${it.tempF ?? ""}°F)</span></div>
      </div>`
      })
      .join("")

    result.innerHTML = `
      <div class="card">
        <h3 style="margin-top:0">${loc.name || "—"}, ${loc.country || ""}</h3>
        <div class="row" style="align-items:center; gap:0.75rem">
          ${cur.icon ? `<img alt="" src="${iconUrl(cur.icon)}" width="60" height="60">` : ""}
          <div>
            <div style="font-size:1.75rem; font-weight:700">${cur.tempC ?? "—"}°C <span class="muted">(${cur.tempF ?? "—"}°F)</span></div>
            <div class="muted">${cur.description || ""}</div>
            <div class="muted" style="font-size:0.9rem">Humidity ${cur.humidity ?? "—"}%, Wind ${cur.windKph ?? "—"} km/h</div>
            <div class="muted" style="font-size:0.9rem">Observed ${when}</div>
          </div>
        </div>
      </div>
      <h3 style="margin:1rem 0 0.5rem">Forecast</h3>
      <div class="grid">
        ${fcCards || '<p class="muted">No forecast data.</p>'}
      </div>
    `
  }

  async function fetchCity(city) {
    result.innerHTML = '<p class="muted">Loading…</p>'
    const r = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    render(await r.json())
  }
  async function fetchCoords(lat, lon) {
    result.innerHTML = '<p class="muted">Loading…</p>'
    const r = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
    render(await r.json())
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault()
    const val = (input?.value || "").trim()
    if (!val) return
    fetchCity(val)
  })

  btnLocate?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      render({ error: "Geolocation not supported" })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => render({ error: err.message || "Unable to get location" }),
    )
  })
})()
