"use client"

import { useEffect, useRef, useState } from "react"

export default function SpecPage() {
  // Chat state
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; html: string }>>([])
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Weather state
  const [city, setCity] = useState("Dahmi Kalan")
  const [weather, setWeather] = useState<any>(null)
  const [weatherError, setWeatherError] = useState<string>("")
  const [weatherOpen, setWeatherOpen] = useState(false)

  // User info modal
  const [userOpen, setUserOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({ location: "", gmail: "", phone: "" })

  // Sensor simulation
  const [displacement, setDisplacement] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString())
  const ALERT_THRESHOLD = 5.0

  // Chatbot logic (trimmed to essentials from pasted text)
  const chatbotLogic = {
    onboarding: {
      prompt:
        "Welcome to the AI-Based Rockfall Prediction and Alert System. I am the GeoGuard Assistant. How can I help you today? You can ask me to navigate the site, explain a term, or check the system status. What would you like to do?",
      suggestions: ["Show me the Live Dashboard", "What does 'DEM' mean?", "Are there any active alerts?"],
    },
    nav: {
      triggers: ["go to", "show me", "navigate to", "open", "where is", "dashboard", "map", "history", "reports"],
      pages: [
        {
          name: "Live Dashboard",
          keywords: ["dashboard", "main page", "overview"],
          action:
            "This is the Live Dashboard. It provides a real-time overview of all sensor data and current risk levels across the mine.",
        },
        {
          name: "Sensor Map",
          keywords: ["map", "sensor locations", "live feed"],
          action:
            "Feature not yet implemented. In a full version, this would open an interactive Sensor Map where you can view live data from individual sensor locations.",
        },
        {
          name: "Alert History",
          keywords: ["history", "past alerts", "previous events"],
          action:
            "Feature not yet implemented. This section would show a log where you can filter by date, pit area, and risk level to review past events.",
        },
        {
          name: "Reporting Tool",
          keywords: ["reports", "generate report", "download data"],
          action:
            "Feature not yet implemented. A reporting tool would be available here to specify parameters and generate downloadable safety reports.",
        },
      ],
    },
    faq: [
      {
        keywords: ["dem", "digital elevation model"],
        resp: "A <b>Digital Elevation Model (DEM)</b> is a 3D digital representation of a terrain's surface. In our system, we use it as a baseline map to detect and measure changes in the rock face, which helps predict potential rockfalls.",
      },
      {
        keywords: ["infrared sensor", "ir sensor"],
        resp: "The <b>infrared sensors</b> continuously scan the pit walls to create a live data feed. They measure distances and surface profiles with high precision. If the sensor data shows the ground has moved or crossed a specific safety threshold, the system flags a potential risk.",
      },
      {
        keywords: ["risk levels", "alert levels"],
        resp: "Our system uses three main alert levels:<br/><br/>• <b>Low (Green):</b> Normal conditions, no significant movement detected.<br/>• <b>Moderate (Yellow):</b> Minor displacement detected; the area should be monitored closely.<br/>• <b>High (Red):</b> Significant movement has crossed a critical threshold. This indicates a high probability of a rockfall, and safety protocols should be initiated immediately.",
      },
      {
        keywords: ["system status", "sensors online", "active alerts", "alert"],
        respFactory: (statusText: string) => `The current system status is: <b>${statusText}</b>`,
      },
    ],
  }

  // Initial greeting and suggestions
  useEffect(() => {
    setMessages([{ sender: "ai", html: chatbotLogic.onboarding.prompt }])
    setSuggestions(chatbotLogic.onboarding.suggestions)
  }, [])

  useEffect(() => {
    // autoscroll
    const el = chatWindowRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Sensor simulation timer
  useEffect(() => {
    const id = setInterval(() => {
      setDisplacement((prev) => {
        let d = prev + (Math.random() - 0.45) * 0.5
        if (d < 0) d = 0
        if (Math.random() < 0.05) d += Math.random() * 4
        setLastUpdated(new Date().toLocaleTimeString())
        return Number.parseFloat(d.toFixed(2))
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  function addMessage(html: string, sender: "ai" | "user") {
    setMessages((m) => [...m, { sender, html }])
  }

  function processUserInput(raw: string) {
    const lower = raw.toLowerCase()
    // navigation
    if (chatbotLogic.nav.triggers.some((t) => lower.includes(t))) {
      for (const p of chatbotLogic.nav.pages) {
        if (p.keywords.some((k) => lower.includes(k))) {
          addMessage(p.action, "ai")
          return
        }
      }
    }
    // faq
    for (const f of chatbotLogic.faq) {
      if (f.keywords.some((k) => lower.includes(k))) {
        if ("respFactory" in f) {
          const status =
            displacement > ALERT_THRESHOLD
              ? "ALERT: Critical displacement detected! Immediate action required."
              : "All systems normal. No immediate threats detected."
          addMessage((f as any).respFactory(status), "ai")
        } else {
          addMessage((f as any).resp, "ai")
        }
        return
      }
    }
    // greeting/help
    if (["hello", "hi", "help"].includes(lower)) {
      addMessage(chatbotLogic.onboarding.prompt, "ai")
      return
    }
    addMessage("I'm not sure how to answer that. Could you try rephrasing? You can also ask for 'help'.", "ai")
  }

  async function fetchWeatherByCity(c: string) {
    try {
      setWeather(null)
      setWeatherError("")
      const res = await fetch(`/api/weather?city=${encodeURIComponent(c)}`, { cache: "no-store" })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setWeather(data)
    } catch (e: any) {
      setWeatherError(e.message || "Failed to load weather")
    }
  }

  // fetch default weather on open
  useEffect(() => {
    if (weatherOpen) fetchWeatherByCity(city)
  }, [weatherOpen])

  const statusIsAlert = displacement > ALERT_THRESHOLD

  return (
    <main className="relative min-h-[100svh]">
      {/* Background image with translucent overlay */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/mine-bg.png')", filter: "none", opacity: 0.25 }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-white/30" aria-hidden />

      <section className="container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">AI Rockfall Prediction System</h1>
          <p className="text-gray-700 mt-1">Open-Pit Mine Safety & Monitoring Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {/* System status */}
            <div
              className={`p-4 rounded-lg shadow-md transition-all duration-500 border-l-4 ${statusIsAlert ? "bg-red-100 border-red-500 text-red-700 animate-pulse" : "bg-green-100 border-green-500 text-green-700"}`}
            >
              <h2 className="font-bold text-lg">System Status</h2>
              <p>
                {statusIsAlert
                  ? "ALERT: Critical displacement detected! Immediate action required."
                  : "All systems normal. No immediate threats detected."}
              </p>
            </div>

            {/* Controls */}
            <div className="bg-white/80 backdrop-blur p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setWeatherOpen(true)}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Check Site Weather
                </button>
                <button
                  onClick={() => setUserOpen(true)}
                  className="w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-900 transition"
                >
                  Update Contact Info
                </button>
              </div>
            </div>

            {/* Sensor feed */}
            <div className="bg-white/80 backdrop-blur p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Live Sensor Feed</h2>
              <div className="space-y-2">
                <p>
                  <strong>Sensor ID:</strong> PIT_WALL_01
                </p>
                <p>
                  <strong>Displacement:</strong>{" "}
                  <span className="font-mono text-lg font-semibold">{displacement.toFixed(2)} mm</span>
                </p>
                <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>

          {/* Right column: Chat */}
          <div className="lg:col-span-2 bg-white/85 backdrop-blur rounded-lg shadow-md flex flex-col h-[70vh]">
            <div className="p-4 border-b flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                G
              </div>
              <div>
                <h2 className="text-xl font-semibold">GeoGuard AI Assistant</h2>
                <p className="text-sm text-green-600">Online</p>
              </div>
            </div>

            <div ref={chatWindowRef} className="flex-1 p-4 overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg max-w-xs mb-2 break-words ${m.sender === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-gray-800"}`}
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
              ))}
            </div>

            <div className="p-2 border-t flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="bg-gray-200 text-sm text-gray-800 py-1 px-3 rounded-full hover:bg-gray-300 transition"
                  onClick={() => {
                    addMessage(s, "user")
                    processUserInput(s)
                    setInput("")
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="p-4 border-t">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!input.trim()) return
                  const msg = input.trim()
                  addMessage(msg, "user")
                  processUserInput(msg)
                  setInput("")
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ask me anything..."
                />
                <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Modal */}
      {weatherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">Live Weather Conditions</h3>
              <button
                onClick={() => setWeatherOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  fetchWeatherByCity(city)
                }}
              >
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter City Name"
                  />
                  <button className="bg-blue-600 text-white font-semibold px-4 rounded-lg hover:bg-blue-700">
                    Get
                  </button>
                </div>
              </form>

              {weatherError && <div className="text-red-600 text-center">{weatherError}</div>}

              {weather && (
                <div className="text-center space-y-2">
                  <h4 className="text-2xl font-bold">
                    {weather?.location?.name}
                    {weather?.location?.country ? `, ${weather.location.country}` : ""}
                  </h4>
                  <div className="flex items-center justify-center">
                    {weather?.current?.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={weather?.current?.description || "Weather icon"}
                        className="w-16 h-16"
                        src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`}
                      />
                    ) : null}
                    <span className="text-4xl font-bold ml-2">
                      {Number(weather?.current?.temp).toFixed(1)}
                      {weather?.units === "imperial" ? "°F" : "°C"}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 capitalize">{weather?.current?.description}</p>
                  <div className="flex justify-around pt-4">
                    <p>
                      <strong>Humidity:</strong> {weather?.current?.humidity}%
                    </p>
                    <p>
                      <strong>Wind:</strong> {Number(weather?.current?.wind_speed ?? 0).toFixed(1)}{" "}
                      {weather?.units === "imperial" ? "mph" : "m/s"}
                    </p>
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-4">Weather data powered by OpenWeatherMap.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {userOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">Update Contact Information</h3>
              <button
                onClick={() => setUserOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const payload = { ...userInfo, timestamp: new Date().toISOString() }
                  // For demo: log to console (replace with API call as needed)
                  console.log("[v0] User info submitted:", payload)
                  alert("Information saved successfully! Open the console to see the captured data.")
                  setUserOpen(false)
                  setUserInfo({ location: "", gmail: "", phone: "" })
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Your Location</label>
                  <input
                    value={userInfo.location}
                    onChange={(e) => setUserInfo((u) => ({ ...u, location: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Gmail</label>
                  <input
                    type="email"
                    value={userInfo.gmail}
                    onChange={(e) => setUserInfo((u) => ({ ...u, gmail: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo((u) => ({ ...u, phone: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                    Save Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
