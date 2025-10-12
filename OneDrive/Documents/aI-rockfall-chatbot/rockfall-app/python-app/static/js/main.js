;(() => {
  const tbody = document.getElementById("sensor-body")
  const badge = document.getElementById("status-badge")
  const lastEvent = document.getElementById("last-event")
  const riskLevel = document.getElementById("risk-level")
  const sensorCount = document.getElementById("sensor-count")

  const sensors = 6
  let threshold = 10 // mm
  let samplingHz = 2
  const running = true

  function setStatus(level) {
    badge.classList.remove("warn", "alert")
    if (level === "OK") {
      badge.textContent = "OK"
    }
    if (level === "WARN") {
      badge.textContent = "WARN"
      badge.classList.add("warn")
    }
    if (level === "ALERT") {
      badge.textContent = "ALERT"
      badge.classList.add("alert")
    }
  }

  function simulate() {
    if (!running) return
    const now = new Date().toLocaleTimeString()
    const sensorId = Math.ceil(Math.random() * sensors)
    const displacement = +(Math.random() * 20).toFixed(2)
    const tr = document.createElement("tr")
    tr.innerHTML = `<td>${now}</td><td>S${sensorId}</td><td>${displacement}</td>`
    tbody?.prepend(tr)

    // status logic
    if (displacement >= threshold * 1.5) {
      setStatus("ALERT")
      lastEvent.textContent = `ALERT at S${sensorId} (${displacement}mm)`
      riskLevel.textContent = "High"
    } else if (displacement >= threshold) {
      setStatus("WARN")
      lastEvent.textContent = `WARN at S${sensorId} (${displacement}mm)`
      riskLevel.textContent = "Medium"
    } else {
      setStatus("OK")
      riskLevel.textContent = "Low"
    }
  }

  // wire controls
  const thInput = document.getElementById("threshold")
  const smpInput = document.getElementById("sampling")
  const ackBtn = document.getElementById("btn-ack")
  const notifySel = document.getElementById("notify")

  if (thInput) {
    thInput.addEventListener("input", (e) => (threshold = Number(e.target.value || 10)))
  }
  if (smpInput) {
    smpInput.addEventListener("input", (e) => (samplingHz = Math.min(10, Math.max(1, Number(e.target.value) || 2))))
  }
  if (ackBtn) {
    ackBtn.addEventListener("click", () => {
      setStatus("OK")
      lastEvent.textContent = "Acknowledged"
    })
  }

  if (sensorCount) {
    sensorCount.textContent = String(sensors)
  }

  setInterval(simulate, 1000 / samplingHz)
  setInterval(() => {
    /* update speed */
  }, 1500)

  // Assistant
  const chips = document.querySelectorAll(".chip")
  const log = document.getElementById("chat-log")
  const form = document.getElementById("chat-form")
  const input = document.getElementById("chat-input")

  function append(role, text) {
    const row = document.createElement("div")
    row.className = "msg " + (role === "me" ? "me" : "ai")
    row.innerHTML = `<div class="bubble">${text}</div>`
    log?.appendChild(row)
    log?.scrollTo({ top: log.scrollHeight, behavior: "smooth" })
  }

  function respond(text) {
    // naive rule-based responses
    if (/risk/i.test(text)) return "Risk is computed from displacement trends; current risk indicator is shown above."
    if (/alert/i.test(text)) return "No critical alerts in the last 15 minutes. You can adjust thresholds in Controls."
    if (/sensor/i.test(text)) return "Sensors report displacement in millimeters. Look for monotonic growth or spikes."
    if (/hotspot|area/i.test(text)) return "Northern benches showed elevated movement yesterday; keep monitoring."
    if (/weather/i.test(text)) return "Open the Weather page to view current conditions and forecast."
    return "I can help with risk, alerts, sensors, hotspots, or weather."
  }

  chips.forEach((ch) =>
    ch.addEventListener("click", () => {
      const msg = ch.getAttribute("data-msg") || ""
      append("me", msg)
      append("ai", respond(msg))
    }),
  )

  form?.addEventListener("submit", (e) => {
    e.preventDefault()
    const val = (input?.value || "").trim()
    if (!val) return
    append("me", val)
    append("ai", respond(val))
    input.value = ""
  })
})()
