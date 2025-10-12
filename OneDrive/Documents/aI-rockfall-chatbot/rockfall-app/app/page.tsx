"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export default function HomePage() {
  // chat state
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; html: string }>>([])
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  // weather modal
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [city, setCity] = useState("Dahmi Kalan")
  const [weather, setWeather] = useState<any>(null)
  const [weatherError, setWeatherError] = useState<string>("")

  // user info modal
  const [userOpen, setUserOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({ location: "", gmail: "", phone: "" })

  // sensor simulation
  const [disp, setDisp] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString())
  const ALERT_THRESHOLD = 5.0
  const statusIsAlert = disp > ALERT_THRESHOLD

  // chatbot logic (from pasted text, condensed)
  const greetingText =
    "Welcome to the AI-Based Rockfall Prediction and Alert System. I am the GeoGuard Assistant. How can I help you today? You can ask me to navigate the site, explain a term, or check the system status. What would you like to do?"
  const suggestionList = ["Show me the Live Dashboard", "What does 'DEM' mean?", "Are there any active alerts?"]

  function addMessage(html: string, sender: "ai" | "user") {
    setMessages((m) => [...m, { sender, html }])
  }

  function processUserInput(raw: string) {
    const lower = raw.toLowerCase()
    // simple intents
    if (["hello", "hi", "help"].includes(lower)) return addMessage(greetingText, "ai")
    if (lower.includes("dashboard"))
      return addMessage(
        "This is the Live Dashboard. It provides a real-time overview of all sensor data and current risk levels across the mine.",
        "ai",
      )
    if (lower.includes("map"))
      return addMessage(
        "Feature not yet implemented. In a full version, this would open an interactive Sensor Map with live sensors.",
        "ai",
      )
    if (lower.includes("history"))
      return addMessage("Feature not yet implemented. This would show a log of past alerts with filters.", "ai")
    if (lower.includes("reports"))
      return addMessage(
        "Feature not yet implemented. A reporting tool would generate downloadable safety reports.",
        "ai",
      )
    if (lower.includes("dem"))
      return addMessage(
        "A <b>Digital Elevation Model (DEM)</b> is a 3D representation of terrain. We use it as a baseline to detect wall changes and predict rockfalls.",
        "ai",
      )
    if (lower.includes("infrared"))
      return addMessage(
        "Infrared sensors scan pit walls continuously to measure displacement. Threshold crossings flag risk.",
        "ai",
      )
    if (lower.includes("alert") || lower.includes("status")) {
      return addMessage(
        `The current system status is: <b>${
          statusIsAlert
            ? "ALERT: Critical displacement detected! Immediate action required."
            : "All systems normal. No immediate threats detected."
        }</b>`,
        "ai",
      )
    }
    addMessage("I'm not sure how to answer that. Try 'help', 'dashboard', or ask about 'DEM'.", "ai")
  }

  // initialize chat
  useEffect(() => {
    setMessages([{ sender: "ai", html: greetingText }])
    setSuggestions(suggestionList)
  }, [])

  // autoscroll chat
  useEffect(() => {
    const el = chatWindowRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // sensor simulation
  useEffect(() => {
    const id = setInterval(() => {
      setDisp((prev) => {
        let d = prev + (Math.random() - 0.45) * 0.5
        if (d < 0) d = 0
        if (Math.random() < 0.05) d += Math.random() * 4
        setLastUpdated(new Date().toLocaleTimeString())
        return Number.parseFloat(d.toFixed(2))
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  async function fetchWeather() {
    try {
      setWeatherError("")
      setWeather(null)
      const res = await fetch(`/api/weather?q=${encodeURIComponent(city)}`, { cache: "no-store" })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setWeather(data?.current)
    } catch (e: any) {
      setWeatherError(e.message || "Failed to load weather")
    }
  }

  useEffect(() => {
    if (weatherOpen) fetchWeather()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherOpen])

  return (
    <main className="relative min-h-[100svh]">
      {/* translucent background image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/mine-bg.png')", opacity: 0.25 }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-white/30" aria-hidden />

      <section className="container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-balance">AI Rockfall Prediction System</h1>
          <p className="text-gray-700 mt-1">Open-Pit Mine Safety & Monitoring Dashboard</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status */}
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
                  className="w-full bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg hover:bg-black transition"
                >
                  Update Contact Info
                </button>
                <Link
                  href="/weather"
                  className="block w-full text-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                >
                  Open Full Weather & Forecast
                </Link>
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
                  <span className="font-mono text-lg font-semibold">{disp.toFixed(2)} mm</span>
                </p>
                <p className="text-sm text-gray-700">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>

          {/* Right column: chat */}
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
                  addMessage(input.trim(), "user")
                  processUserInput(input.trim())
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

      {/* Weather modal */}
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
                  fetchWeather()
                }}
              >
                <div className="flex gap-2 mb-4">
                  <input
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
                    {weather?.name}, {weather?.sys?.country}
                  </h4>
                  <div className="flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Weather icon"
                      className="w-16 h-16"
                      src={`https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon || "01d"}@2x.png`}
                    />
                    <span className="text-4xl font-bold ml-2">{Number(weather?.main?.temp).toFixed(1)}°C</span>
                  </div>
                  <p className="text-lg text-gray-700 capitalize">{weather?.weather?.[0]?.description}</p>
                  <div className="flex justify-around pt-4">
                    <p>
                      <strong>Humidity:</strong> {weather?.main?.humidity}%
                    </p>
                    <p>
                      <strong>Wind:</strong> {Number(weather?.wind?.speed).toFixed(1)} m/s
                    </p>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-4">Weather data powered by OpenWeatherMap.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Info modal */}
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
                  alert("Information saved successfully! (demo)")
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
